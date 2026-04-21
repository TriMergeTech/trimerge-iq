"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { FolderPlus, Lightbulb, X } from "lucide-react";

import { serviceOptions, staffOptions } from "./chatPageTypes";

interface CreateProjectModalProps {
  newProjectClient: string;
  newProjectDescription: string;
  newProjectManager: (typeof staffOptions)[number];
  newProjectName: string;
  newProjectService: (typeof serviceOptions)[number];
  newProjectTeam: string[];
  onClose: () => void;
  onCreateProject: () => void;
  projectNameInputRef: RefObject<HTMLInputElement>;
  setNewProjectClient: Dispatch<SetStateAction<string>>;
  setNewProjectDescription: Dispatch<SetStateAction<string>>;
  setNewProjectManager: Dispatch<SetStateAction<(typeof staffOptions)[number]>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  setNewProjectService: Dispatch<SetStateAction<(typeof serviceOptions)[number]>>;
  toggleTeamMember: (member: string) => void;
}

export default function CreateProjectModal({
  newProjectClient,
  newProjectDescription,
  newProjectManager,
  newProjectName,
  newProjectService,
  newProjectTeam,
  onClose,
  onCreateProject,
  projectNameInputRef,
  setNewProjectClient,
  setNewProjectDescription,
  setNewProjectManager,
  setNewProjectName,
  setNewProjectService,
  toggleTeamMember,
}: CreateProjectModalProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 px-4 py-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-170px)] w-full max-w-[980px] flex-col overflow-hidden rounded-[16px] border border-white/8 bg-[#232323] shadow-[0_30px_80px_rgba(0,0,0,0.55)] animate-fade-rise">
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5 sm:px-8">
          <h2 className="text-[20px] font-medium tracking-tight text-white">Create project</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Close create project dialog"
              onClick={onClose}
              className="interactive-button flex h-10 w-10 items-center justify-center rounded-full text-white/88 hover:bg-white/8"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="chat-scrollbar overflow-y-auto px-6 pb-4 pt-6 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="project-name" className="mb-3 block text-[15px] font-medium text-white/95">
                Name
              </label>
              <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5">
                <FolderPlus className="h-5 w-5 text-white/55" />
                <input
                  id="project-name"
                  ref={projectNameInputRef}
                  type="text"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="Copenhagen Trip"
                  className="w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/35"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="project-description" className="mb-3 block text-[15px] font-medium text-white/95">
                Description
              </label>
              <textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(event) => setNewProjectDescription(event.target.value)}
                placeholder="Briefly describe the project scope and goals."
                rows={3}
                className="w-full resize-none rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/35"
              />
            </div>

            <div>
              <label htmlFor="project-service" className="mb-3 block text-[15px] font-medium text-white/95">
                Service
              </label>
              <select
                id="project-service"
                value={newProjectService}
                onChange={(event) => setNewProjectService(event.target.value as (typeof serviceOptions)[number])}
                className="w-full rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service} className="bg-[#252525]">
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project-client" className="mb-3 block text-[15px] font-medium text-white/95">
                Client
              </label>
              <input
                id="project-client"
                type="text"
                value={newProjectClient}
                onChange={(event) => setNewProjectClient(event.target.value)}
                placeholder="Client name"
                className="w-full rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/35"
              />
            </div>

            <div>
              <label htmlFor="project-manager" className="mb-3 block text-[15px] font-medium text-white/95">
                Project manager
              </label>
              <select
                id="project-manager"
                value={newProjectManager}
                onChange={(event) => setNewProjectManager(event.target.value as (typeof staffOptions)[number])}
                className="w-full rounded-[12px] border border-white/10 bg-[#252525] px-4 py-3.5 text-[15px] text-white outline-none"
              >
                {staffOptions.map((staff) => (
                  <option key={staff} value={staff} className="bg-[#252525]">
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-[15px] font-medium text-white/95">Team</label>
              <div className="flex flex-wrap gap-2 rounded-[12px] border border-white/10 bg-[#252525] px-3 py-3">
                {staffOptions.map((staff) => {
                  const isSelected = newProjectTeam.includes(staff);

                  return (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => toggleTeamMember(staff)}
                      className={`interactive-button rounded-full px-3 py-2 text-sm ${isSelected ? "bg-[#d4af37] text-[#111214]" : "bg-white/8 text-white/88 hover:bg-white/12"}`}
                    >
                      {staff}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 bg-[#232323] px-6 pb-5 pt-4 sm:px-8">
          <div className="rounded-[14px] bg-[#4b4b4b] px-4 py-5 text-white/92">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <p className="text-[16px] leading-7 text-white/92">
                Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to
                keep things tidy.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCreateProject}
              disabled={!newProjectName.trim()}
              className="interactive-button rounded-full bg-[#626262] px-7 py-3.5 text-[17px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-[#737373] disabled:cursor-not-allowed disabled:bg-[#5a5a5a] disabled:text-white/45"
            >
              Create project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
