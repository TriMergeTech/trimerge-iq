import { useState } from "react";
import FormField from "../components/form_field";
import { post_request } from "../utils/services";

function SkillModal({ skill = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    title: skill.title || "",
    description: skill.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // keep form.skills in sync with selectedSkills so handleSubmit sends them
  const handleChange = (key) => (e) => {
    console.log(key, e.target.value);
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = skill._id ? "update_skill" : "add_skill";
      const payload = skill._id ? { _id: skill._id, updates: form } : form;

      const res = await post_request(endpoint, payload);

      if (!res.ok) {
        throw new Error(res?.message || "Failed to save skill");
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
          {skill._id ? "Edit Skill" : "Add New Skill"}
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

export default SkillModal;
