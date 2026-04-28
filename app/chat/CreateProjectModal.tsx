"use client";

import { useEffect, useState, useRef } from "react";
import { FolderPlus, Lightbulb, X } from "lucide-react";
import { post_request } from "../utils/services";

export default function CreateProjectModal({ onClose, onCreateProject }) {
  // FORM STATE
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [service, setService] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);

  // DATA STATE
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);

  // UI STATE
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, clientsRes, staffsRes] = await Promise.all([
          post_request("get_services", {}),
          post_request("get_clients", {}),
          post_request("$PROFILE/get_profiles", {
            profile: "98260a6c-e1d5-46f1-8ab3-4f30a062b52a",
          }),
        ]);

        if (servicesRes?.ok) setServices(servicesRes.data);
        if (clientsRes?.ok) setClients(clientsRes.data);
        if (staffsRes?.ok) setStaffs(staffsRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // TEAM TOGGLE
  const toggleTeamMember = (member: any) => {
    const exists = team.find((m) => m._id === member._id);

    if (exists) {
      setTeam((prev) => prev.filter((m) => m._id !== member._id));
    } else {
      setTeam((prev) => [...prev, member]);
    }
  };

  // CREATE PROJECT
  const handleCreate = async () => {
    if (isCreating) return;
    if (!name.trim()) return;

    setIsCreating(true);
    setError(null);

    let usr = localStorage.getItem("profile");
    try {
      usr = JSON.parse(usr);
    } catch (e) {
      usr = null;
      setError(e.message);
      setIsCreating(false);
    } finally {
    }
    if (!usr) return;

    try {
      const payload = {
        title: name,
        description,
        service: service?._id,
        client: client?._id,
        project_manager: manager?._id,
        team: team.map((t) => t._id),
        user: usr._id,
      };

      const response = await post_request("new_project", payload);

      if (response?.ok) {
        // reset
        setName("");
        setDescription("");
        setService(null);
        setClient(null);
        setManager(null);
        setTeam([]);

        onCreateProject?.(response.data);
        onClose();
      } else {
        setError(response?.message || "Failed to create project");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 px-4 py-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-170px)] w-full max-w-[980px] flex-col overflow-hidden rounded-[16px] border border-white/8 bg-[#232323] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        {/* HEADER */}
        <div className="flex justify-between border-b border-white/8 px-6 py-5">
          <h2 className="text-[20px] text-white">Create project</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-6 space-y-5">
          {/* NAME */}
          <div>
            <label className="text-white">Name</label>
            <div className="flex items-center gap-2 bg-[#252525] p-3 rounded">
              <FolderPlus />
              <input
                ref={projectNameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-white">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#252525] p-3 rounded text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="service"
                className="mb-3 block text-[15px] font-medium text-white/95"
              >
                Service
              </label>
              <select
                id="service"
                value={service?._id || ""}
                onChange={(e) =>
                  setService(services.find((s) => s._id === e.target.value))
                }
                className="w-full rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none"
              >
                <option disabled selected value="">
                  Select Service
                </option>
                {services.map((s) => (
                  <option className="bg-[#252525]" key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="client"
                className="mb-3 block text-[15px] font-medium text-white/95"
              >
                Client
              </label>
              <select
                id="client"
                value={client?._id || ""}
                onChange={(e) =>
                  setClient(clients.find((c) => c._id === e.target.value))
                }
                className="w-full rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none"
              >
                <option selected disabled value="">
                  Select Client
                </option>
                {clients.map((c) => (
                  <option className="bg-[#252525]" key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MANAGER */}
          <div>
            <label
              htmlFor="project-manager"
              className="mb-3 block text-[15px] font-medium text-white/95"
            >
              Project manager
            </label>
            <select
              id="project-manager"
              value={manager?._id || ""}
              onChange={(e) =>
                setManager(staffs.find((s) => s._id === e.target.value))
              }
              className="w-full rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none"
            >
              <option disabled selected value="">
                Select Manager
              </option>
              {staffs.map((s) => (
                <option className="bg-[#252525]" key={s._id} value={s._id}>
                  {s.fullname}
                </option>
              ))}
            </select>
          </div>

          {/* TEAM */}
          <div className="md:col-span-2">
            <label className="mb-3 block text-[15px] font-medium text-white/95">
              Team
            </label>
            <div className="flex flex-wrap gap-2 rounded-[12px] border border-white/10 bg-[#252525] px-3 py-3">
              {staffs.map((staff) => {
                const selected = team.find((t) => t._id === staff._id);

                return (
                  <button
                    key={staff?._id}
                    type="button"
                    onClick={() => toggleTeamMember(staff)}
                    className={`interactive-button rounded-full px-3 py-2 text-sm ${selected ? "bg-[#d4af37] text-[#111214]" : "bg-white/8 text-white/88 hover:bg-white/12"}`}
                  >
                    {staff?.fullname}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR */}
          {error && <p className="text-red-400">{error}</p>}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="bg-gray-600 px-6 py-3 rounded text-white"
          >
            {isCreating ? "Creating..." : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}
