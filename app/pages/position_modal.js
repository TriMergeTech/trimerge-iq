import { useEffect, useState } from "react";
import FormField from "../components/form_field";
import { post_request } from "../utils/services";

function PositionModal({ position = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    title: position.title || "",
    description: position.description || "",
    responsibilities: position.responsibilities || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState(() => {
    const init = position.skills || form.skills;
    if (!init) return [];
    if (Array.isArray(init))
      return init.map((s) => (typeof s === "string" ? s : s._id || s.id));
    return [];
  });
  const [skillsLoading, setSkillsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchSkills = async () => {
      setSkillsLoading(true);
      try {
        const res = await post_request("get_skills", {});
        if (res.ok && mounted) {
          setAvailableSkills(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load skills", err);
      } finally {
        if (mounted) setSkillsLoading(false);
      }
    };
    fetchSkills();
    return () => {
      mounted = false;
    };
  }, []);

  // keep form.skills in sync with selectedSkills so handleSubmit sends them
  useEffect(() => {
    setForm((prev) => ({ ...prev, skills: selectedSkills }));
  }, [selectedSkills]);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting position with data:", form);

    setLoading(true);
    setError(null);

    try {
      const endpoint = position._id ? "update_position" : "add_position";
      const payload = position._id ? { _id: position._id, ...form } : form;

      const res = await post_request(endpoint, payload);

      if (!res.ok) {
        throw new Error(res?.message || "Failed to save position");
      }

      onSave && onSave(res.data || payload);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-xl bg-white">
      <div className="rounded-t-xl bg-gradient-to-r from-[#1e5ba8] to-[#174a8f] p-6">
        <h3 className="text-xl font-bold text-white">
          {position._id ? "Edit Position" : "Add New Position"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <FormField label="Title">
          <input
            type="text"
            value={form.title}
            onChange={handleChange("title")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e5ba8]"
            required
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={form.description}
            onChange={handleChange("description")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e5ba8]"
            rows={4}
          />
        </FormField>

        <FormField label="Responsibilities">
          <div className="space-y-2">
            {(() => {
              const getResponsibilities = () =>
                Array.isArray(form.responsibilities)
                  ? form.responsibilities
                  : form.responsibilities
                    ? [form.responsibilities]
                    : [""];

              const responsibilities = getResponsibilities();

              return (
                <>
                  {responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => {
                          const arr = getResponsibilities().slice();
                          arr[idx] = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            responsibilities: arr,
                          }));
                        }}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                        placeholder={`Responsibility ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = getResponsibilities().slice();
                          arr.splice(idx, 1);
                          setForm((prev) => ({
                            ...prev,
                            responsibilities: arr,
                          }));
                        }}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        aria-label={`Remove responsibility ${idx + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        const arr = Array.isArray(form.responsibilities)
                          ? form.responsibilities.slice()
                          : form.responsibilities
                            ? [form.responsibilities]
                            : [];
                        arr.push("");
                        setForm((prev) => ({ ...prev, responsibilities: arr }));
                      }}
                      className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#1e5ba8] px-3 py-2 text-sm font-semibold text-white hover:bg-[#174a8f]"
                    >
                      + Add responsibility
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </FormField>

        <FormField label="Skills">
          <div className="space-y-2 max-h-40 overflow-auto">
            {skillsLoading ? (
              <p className="text-sm text-gray-500">Loading skills...</p>
            ) : availableSkills.length === 0 ? (
              <p className="text-sm text-gray-500">No skills available</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableSkills.map((skill) => {
                  const id = skill._id;
                  const checked = selectedSkills.includes(id);
                  return (
                    <label
                      key={id}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedSkills((prev) =>
                            prev.includes(id)
                              ? prev.filter((s) => s !== id)
                              : [...prev, id],
                          );
                        }}
                        // className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                        className="h-4 w-4 text-gray-700"
                      />
                      <span className="text-gray-700">
                        {skill.name || skill.title || id}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </FormField>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-[#1e5ba8] px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#174a8f] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PositionModal;
