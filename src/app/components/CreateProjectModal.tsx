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
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#070c2b]/75 px-4 py-4 backdrop-blur-md">
      <div className="flex max-h-[calc(100vh-150px)] w-full max-w-[980px] flex-col overflow-hidden rounded-[18px] border border-white/[0.13] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(124,92,255,0.16)_0%,transparent_62%),linear-gradient(180deg,rgba(13,18,64,0.98),rgba(7,12,43,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_30px_90px_rgba(0,0,0,0.55)] animate-fade-rise">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.10] bg-white/[0.025] px-6 py-5 sm:px-8">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a78bfa]">Workspace</p>
            <h2 className="mt-1 text-[21px] font-medium tracking-tight text-white">Create project</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Close create project dialog"
              onClick={onClose}
              className="interactive-button flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.13] bg-white/[0.04] text-[#e6e9f5] hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="chat-scrollbar overflow-y-auto px-6 pb-5 pt-6 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="project-name" className="mb-2 block font-sans text-sm font-medium text-[#e6e9f5]">
                Name
              </label>
              <div className="flex items-center gap-3 rounded-[14px] border border-white/[0.13] bg-white/[0.04] px-4 py-3.5 focus-within:border-[#7c5cff] focus-within:ring-2 focus-within:ring-[#7c5cff]/20">
                <FolderPlus className="h-5 w-5 text-[#a78bfa]" />
                <input
                  id="project-name"
                  ref={projectNameInputRef}
                  type="text"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="Copenhagen Trip"
                  className="w-full bg-transparent font-sans text-[16px] text-[#e6e9f5] outline-none placeholder:text-[#7a80a3]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="project-description" className="mb-2 block font-sans text-sm font-medium text-[#e6e9f5]">
                Description
              </label>
              <textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(event) => setNewProjectDescription(event.target.value)}
                placeholder="Briefly describe the project scope and goals."
                rows={3}
                className="interactive-input w-full resize-none rounded-[14px] border border-white/[0.13] bg-white/[0.04] px-4 py-3.5 font-sans text-[15px] leading-6 text-[#e6e9f5] outline-none placeholder:text-[#7a80a3] focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
              />
            </div>

            <div>
              <label htmlFor="project-service" className="mb-2 block font-sans text-sm font-medium text-[#e6e9f5]">
                Service
              </label>
              <select
                id="project-service"
                value={newProjectService}
                onChange={(event) => setNewProjectService(event.target.value)}
                className="interactive-input w-full rounded-[14px] border border-white/[0.13] bg-[#10163f] px-4 py-3.5 font-sans text-[15px] text-[#e6e9f5] outline-none focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
              >
                <option value="" className="bg-[#10163f]">
                  {isLoadingProjectOptions ? "Loading services..." : "Select service"}
                </option>
                {serviceOptions.map((service) => (
                  <option key={service.id} value={service.id} className="bg-[#10163f]">
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="project-client" className="block font-sans text-sm font-medium text-[#e6e9f5]">
                  Client
                </label>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void onAddClient();
                  }}
                  className="interactive-button rounded-full border border-white/[0.13] bg-white/[0.04] px-3 py-1.5 font-sans text-xs font-semibold text-[#e6e9f5]/80 hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/15 hover:text-white"
                >
                  + Add client
                </button>
              </div>
              <select
                id="project-client"
                value={newProjectClient}
                onChange={(event) => setNewProjectClient(event.target.value)}
                className="interactive-input w-full rounded-[14px] border border-white/[0.13] bg-[#10163f] px-4 py-3.5 font-sans text-[15px] text-[#e6e9f5] outline-none focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
              >
                <option value="" className="bg-[#10163f]">
                  {isLoadingProjectOptions ? "Loading clients..." : "Select client"}
                </option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id} className="bg-[#10163f]">
                    {client.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor="project-manager" className="block font-sans text-sm font-medium text-[#e6e9f5]">
                  Project manager
                </label>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddStaff();
                  }}
                  className="interactive-button rounded-full border border-white/[0.13] bg-white/[0.04] px-3 py-1.5 font-sans text-xs font-semibold text-[#e6e9f5]/80 hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/15 hover:text-white"
                >
                  + Add staff
                </button>
              </div>
              <select
                id="project-manager"
                value={newProjectManager}
                onChange={(event) => setNewProjectManager(event.target.value)}
                className="interactive-input w-full rounded-[14px] border border-white/[0.13] bg-[#10163f] px-4 py-3.5 font-sans text-[15px] text-[#e6e9f5] outline-none focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
              >
                <option value="" className="bg-[#10163f]">
                  {isLoadingProjectOptions ? "Loading staff..." : "Select manager"}
                </option>
                {staffOptions.map((staff) => (
                  <option key={staff.id} value={staff.id} className="bg-[#10163f]">
                    {staff.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block font-sans text-sm font-medium text-[#e6e9f5]">Team</label>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddStaff();
                  }}
                  className="interactive-button rounded-full border border-white/[0.13] bg-white/[0.04] px-3 py-1.5 font-sans text-xs font-semibold text-[#e6e9f5]/80 hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/15 hover:text-white"
                >
                  + Add staff
                </button>
              </div>
              <div className="flex min-h-[74px] flex-wrap gap-2 rounded-[14px] border border-white/[0.13] bg-white/[0.04] px-3 py-3">
                {staffOptions.length > 0 ? staffOptions.map((staff) => {
                  const isSelected = newProjectTeam.includes(staff.id);

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => toggleTeamMember(staff.id)}
                      className={`interactive-button rounded-full border px-3 py-2 font-sans text-sm ${
                        isSelected
                          ? "border-[#7c5cff]/45 bg-[#2e2bff] text-white shadow-[0_8px_20px_rgba(46,43,255,0.28)]"
                          : "border-white/[0.13] bg-white/[0.045] text-[#e6e9f5]/82 hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/15 hover:text-white"
                      }`}
                    >
                      {staff.label}
                    </button>
                  );
                }) : (
                  <p className="px-1 py-2 font-sans text-sm text-[#7a80a3]">
                    {isLoadingProjectOptions ? "Loading staff..." : "No staff users available."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.10] bg-white/[0.025] px-6 pb-5 pt-4 sm:px-8">
          <div className="rounded-[14px] border border-white/[0.13] bg-white/[0.04] px-4 py-5 text-[#e6e9f5]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/15">
                <Lightbulb className="h-4 w-4 text-[#a78bfa]" />
              </div>
              <p className="font-sans text-[15px] leading-7 text-[#7a80a3]">
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
              className="interactive-button rounded-xl border border-transparent bg-[#2e2bff] px-7 py-3.5 font-sans text-[16px] font-semibold text-white shadow-[0_8px_22px_rgba(46,43,255,0.30)] hover:bg-[#2120e0] hover:shadow-[0_12px_28px_rgba(46,43,255,0.45)] disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:bg-white/[0.07] disabled:text-white/32 disabled:shadow-none"
            >
              Create project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
