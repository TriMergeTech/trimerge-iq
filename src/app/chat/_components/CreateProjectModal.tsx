"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { FolderPlus, Lightbulb, X } from "lucide-react";

import type { ProjectFormOption } from "./chatPageTypes";

interface CreateProjectModalProps {
  clientOptions: ProjectFormOption[];
  isLoadingProjectOptions: boolean;
  newProjectClient: string;
  newProjectDescription: string;
  newProjectManager: string;
  newProjectName: string;
  newProjectService: string;
  newProjectTeam: string[];
  onAddClient: () => void | Promise<void>;
  onAddStaff: () => void;
  onClose: () => void;
  onCreateProject: () => void;
  projectNameInputRef: RefObject<HTMLInputElement>;
  serviceOptions: ProjectFormOption[];
  setNewProjectClient: Dispatch<SetStateAction<string>>;
  setNewProjectDescription: Dispatch<SetStateAction<string>>;
  setNewProjectManager: Dispatch<SetStateAction<string>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  setNewProjectService: Dispatch<SetStateAction<string>>;
  staffOptions: ProjectFormOption[];
  toggleTeamMember: (member: string) => void;
}

export default function CreateProjectModal({
  clientOptions,
  isLoadingProjectOptions,
  newProjectClient,
  newProjectDescription,
  newProjectManager,
  newProjectName,
  newProjectService,
  newProjectTeam,
  onAddClient,
  onAddStaff,
  onClose,
  onCreateProject,
  projectNameInputRef,
  serviceOptions,
  setNewProjectClient,
  setNewProjectDescription,
  setNewProjectManager,
  setNewProjectName,
  setNewProjectService,
  staffOptions,
  toggleTeamMember,
}: CreateProjectModalProps) {
  const canCreateProject =
    Boolean(newProjectName.trim()) &&
    Boolean(newProjectDescription.trim()) &&
    Boolean(newProjectManager) &&
    newProjectTeam.length > 0 &&
    Boolean(newProjectClient) &&
    Boolean(newProjectService);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-150px)] w-full max-w-[980px] flex-col overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,27,39,0.98),rgba(10,15,23,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_30px_90px_rgba(0,0,0,0.55)] animate-fade-rise">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] bg-white/[0.015] px-6 py-5 shadow-[inset_0_-1px_0_rgba(212,175,55,0.06)] sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/58">Workspace</p>
            <h2 className="mt-1 text-[21px] font-medium tracking-tight text-white">Create project</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Close create project dialog"
              onClick={onClose}
              className="interactive-button flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] hover:bg-white/[0.07]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="chat-scrollbar overflow-y-auto px-6 pb-5 pt-6 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="project-name" className="mb-2 block text-sm font-medium text-white/88">
                Name
              </label>
              <div className="flex items-center gap-3 rounded-[18px] border border-white/[0.08] bg-black/[0.18] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] focus-within:border-[#d4af37]/38 focus-within:ring-2 focus-within:ring-[#d4af37]/10">
                <FolderPlus className="h-5 w-5 text-[#d4af37]/70" />
                <input
                  id="project-name"
                  ref={projectNameInputRef}
                  type="text"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="Copenhagen Trip"
                  className="w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="project-description" className="mb-2 block text-sm font-medium text-white/88">
                Description
              </label>
              <textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(event) => setNewProjectDescription(event.target.value)}
                placeholder="Briefly describe the project scope and goals."
                rows={3}
                className="interactive-input w-full resize-none rounded-[18px] border border-white/[0.08] bg-black/[0.18] px-4 py-3.5 text-[15px] leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none placeholder:text-white/30 focus:border-[#d4af37]/38 focus:ring-2 focus:ring-[#d4af37]/10"
              />
            </div>

            <div>
              <label htmlFor="project-service" className="mb-2 block text-sm font-medium text-white/88">
                Service
              </label>
              <select
                id="project-service"
                value={newProjectService}
                onChange={(event) => setNewProjectService(event.target.value)}
                className="interactive-input w-full rounded-[18px] border border-white/[0.08] bg-[#101722] px-4 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none focus:border-[#d4af37]/38 focus:ring-2 focus:ring-[#d4af37]/10"
              >
                <option value="" className="bg-[#101722]">
                  {isLoadingProjectOptions ? "Loading services..." : "Select service"}
                </option>
                {serviceOptions.map((service) => (
                  <option key={service.id} value={service.id} className="bg-[#101722]">
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="project-client" className="block text-sm font-medium text-white/88">
                  Client
                </label>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void onAddClient();
                  }}
                  className="interactive-button rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] hover:border-[#d4af37]/28 hover:bg-white/[0.07] hover:text-white"
                >
                  + Add client
                </button>
              </div>
              <select
                id="project-client"
                value={newProjectClient}
                onChange={(event) => setNewProjectClient(event.target.value)}
                className="interactive-input w-full rounded-[18px] border border-white/[0.08] bg-[#101722] px-4 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none focus:border-[#d4af37]/38 focus:ring-2 focus:ring-[#d4af37]/10"
              >
                <option value="" className="bg-[#101722]">
                  {isLoadingProjectOptions ? "Loading clients..." : "Select client"}
                </option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id} className="bg-[#101722]">
                    {client.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="project-manager" className="block text-sm font-medium text-white/88">
                  Project manager
                </label>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddStaff();
                  }}
                  className="interactive-button rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] hover:border-[#d4af37]/28 hover:bg-white/[0.07] hover:text-white"
                >
                  + Add staff
                </button>
              </div>
              <select
                id="project-manager"
                value={newProjectManager}
                onChange={(event) => setNewProjectManager(event.target.value)}
                className="interactive-input w-full rounded-[18px] border border-white/[0.08] bg-[#101722] px-4 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none focus:border-[#d4af37]/38 focus:ring-2 focus:ring-[#d4af37]/10"
              >
                <option value="" className="bg-[#101722]">
                  {isLoadingProjectOptions ? "Loading staff..." : "Select manager"}
                </option>
                {staffOptions.map((staff) => (
                  <option key={staff.id} value={staff.id} className="bg-[#101722]">
                    {staff.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-white/88">Team</label>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddStaff();
                  }}
                  className="interactive-button rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] hover:border-[#d4af37]/28 hover:bg-white/[0.07] hover:text-white"
                >
                  + Add staff
                </button>
              </div>
              <div className="flex min-h-[74px] flex-wrap gap-2 rounded-[18px] border border-white/[0.08] bg-black/[0.18] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                {staffOptions.length > 0 ? staffOptions.map((staff) => {
                  const isSelected = newProjectTeam.includes(staff.id);

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => toggleTeamMember(staff.id)}
                      className={`interactive-button rounded-full border px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] ${
                        isSelected
                          ? "border-[#f1d46a]/24 bg-[linear-gradient(180deg,#e2be4b,#c79d22)] text-[#111214]"
                          : "border-white/[0.08] bg-white/[0.045] text-white/82 hover:border-[#d4af37]/24 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {staff.label}
                    </button>
                  );
                }) : (
                  <p className="px-1 py-2 text-sm text-white/45">
                    {isLoadingProjectOptions ? "Loading staff..." : "No staff users available."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.07] bg-white/[0.015] px-6 pb-5 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:px-8">
          <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] px-4 py-5 text-white/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/22 bg-[#d4af37]/10">
                <Lightbulb className="h-4 w-4 text-[#f4df91]" />
              </div>
              <p className="text-[15px] leading-7 text-white/72">
                Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to
                keep things tidy.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCreateProject}
              disabled={!canCreateProject}
              className="interactive-button rounded-full border border-[#f1d46a]/24 bg-[linear-gradient(180deg,#e2be4b,#c79d22)] px-7 py-3.5 text-[16px] font-semibold text-[#111214] shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_14px_32px_rgba(212,175,55,0.22)] hover:bg-[linear-gradient(180deg,#edcb62,#d4af37)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-none disabled:bg-white/[0.07] disabled:text-white/32 disabled:shadow-none"
            >
              Create project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
