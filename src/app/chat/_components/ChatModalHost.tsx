"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";

import CreateClientDialog from "./CreateClientDialog";
import CreateProjectModal from "./CreateProjectModal";
import RenameDialog from "./RenameDialog";
import ShareDialog from "./ShareDialog";
import type { ChatRenameDialogState, ChatShareDialogState, ProjectFormOption } from "./chatPageTypes";

interface ChatModalHostProps {
  clientOptions: ProjectFormOption[];
  isCreateClientDialogOpen: boolean;
  isCreateProjectModalOpen: boolean;
  isLoadingProjectOptions: boolean;
  isSavingNewClient: boolean;
  isShareCopied: boolean;
  newClientAbout: string;
  newClientError: string;
  newClientName: string;
  newProjectClient: string;
  newProjectDescription: string;
  newProjectManager: string;
  newProjectName: string;
  newProjectService: string;
  newProjectTeam: string[];
  onAddClient: () => void | Promise<void>;
  onAddStaff: () => void;
  onCloseCreateClient: () => void;
  onCloseCreateProject: () => void;
  onCopyShare: () => void | Promise<void>;
  onCreateProject: () => void;
  onSubmitNewClient: () => void | Promise<void>;
  onSubmitRename: () => void | Promise<void>;
  projectNameInputRef: RefObject<HTMLInputElement>;
  renameDialog: ChatRenameDialogState | null;
  serviceOptions: ProjectFormOption[];
  setNewClientAbout: Dispatch<SetStateAction<string>>;
  setNewClientName: Dispatch<SetStateAction<string>>;
  setNewProjectClient: Dispatch<SetStateAction<string>>;
  setNewProjectDescription: Dispatch<SetStateAction<string>>;
  setNewProjectManager: Dispatch<SetStateAction<string>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  setNewProjectService: Dispatch<SetStateAction<string>>;
  setRenameDialog: Dispatch<SetStateAction<ChatRenameDialogState | null>>;
  setShareDialog: Dispatch<SetStateAction<ChatShareDialogState | null>>;
  shareDialog: ChatShareDialogState | null;
  staffOptions: ProjectFormOption[];
  toggleTeamMember: (member: string) => void;
}

export default function ChatModalHost({
  clientOptions,
  isCreateClientDialogOpen,
  isCreateProjectModalOpen,
  isLoadingProjectOptions,
  isSavingNewClient,
  isShareCopied,
  newClientAbout,
  newClientError,
  newClientName,
  newProjectClient,
  newProjectDescription,
  newProjectManager,
  newProjectName,
  newProjectService,
  newProjectTeam,
  onAddClient,
  onAddStaff,
  onCloseCreateClient,
  onCloseCreateProject,
  onCopyShare,
  onCreateProject,
  onSubmitNewClient,
  onSubmitRename,
  projectNameInputRef,
  renameDialog,
  serviceOptions,
  setNewClientAbout,
  setNewClientName,
  setNewProjectClient,
  setNewProjectDescription,
  setNewProjectManager,
  setNewProjectName,
  setNewProjectService,
  setRenameDialog,
  setShareDialog,
  shareDialog,
  staffOptions,
  toggleTeamMember,
}: ChatModalHostProps) {
  return (
    <>
      {isCreateProjectModalOpen && (
        <CreateProjectModal
          clientOptions={clientOptions}
          isLoadingProjectOptions={isLoadingProjectOptions}
          newProjectClient={newProjectClient}
          newProjectDescription={newProjectDescription}
          newProjectManager={newProjectManager}
          newProjectName={newProjectName}
          newProjectService={newProjectService}
          newProjectTeam={newProjectTeam}
          onAddClient={onAddClient}
          onAddStaff={onAddStaff}
          onClose={onCloseCreateProject}
          onCreateProject={onCreateProject}
          projectNameInputRef={projectNameInputRef}
          serviceOptions={serviceOptions}
          setNewProjectClient={setNewProjectClient}
          setNewProjectDescription={setNewProjectDescription}
          setNewProjectManager={setNewProjectManager}
          setNewProjectName={setNewProjectName}
          setNewProjectService={setNewProjectService}
          staffOptions={staffOptions}
          toggleTeamMember={toggleTeamMember}
        />
      )}
      {isCreateClientDialogOpen && (
        <CreateClientDialog
          about={newClientAbout}
          error={newClientError}
          isSaving={isSavingNewClient}
          name={newClientName}
          onAboutChange={setNewClientAbout}
          onClose={onCloseCreateClient}
          onNameChange={setNewClientName}
          onSubmit={onSubmitNewClient}
        />
      )}
      {shareDialog && (
        <ShareDialog
          copied={isShareCopied}
          description={shareDialog.description}
          isLoading={shareDialog.isLoading}
          onClose={() => setShareDialog(null)}
          onCopy={onCopyShare}
          title={shareDialog.title}
          value={shareDialog.value}
        />
      )}
      {renameDialog && (
        <RenameDialog
          error={renameDialog.error}
          isSaving={renameDialog.isSaving}
          label={renameDialog.kind === "conversation" ? "Rename chat" : "Rename project"}
          onChange={(value) =>
            setRenameDialog((current) => (current ? { ...current, error: "", value } : current))
          }
          onClose={() => {
            if (!renameDialog.isSaving) setRenameDialog(null);
          }}
          onSubmit={onSubmitRename}
          title={renameDialog.kind === "conversation" ? renameDialog.originalName : "Project workspace"}
          value={renameDialog.value}
        />
      )}
    </>
  );
}
