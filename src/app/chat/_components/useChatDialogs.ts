import { type Dispatch, type SetStateAction, useState } from "react";

import {
  createClientOption,
  createShareLink,
  renameConversation,
  updateProject as updateApiProject,
} from "./chatApi";
import { persistConversationOverride } from "./chatLocalState";
import type {
  ChatEntityId,
  ChatRenameDialogState,
  ChatShareDialogState,
  Conversation,
  Project,
  ProjectFormOption,
} from "./chatPageTypes";

interface UseChatDialogsProps {
  projects: Project[];
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setLastChatError: Dispatch<SetStateAction<string>>;
  setNewProjectClient: Dispatch<SetStateAction<string>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setOpenProjectActionMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setProjectClientOptions: Dispatch<SetStateAction<ProjectFormOption[]>>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setIsWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export function useChatDialogs({
  projects,
  setConversations,
  setLastChatError,
  setNewProjectClient,
  setOpenConversationMenuId,
  setOpenProjectActionMenuId,
  setProjectClientOptions,
  setProjects,
  setIsWorkspaceMenuOpen,
}: UseChatDialogsProps) {
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientAbout, setNewClientAbout] = useState("");
  const [newClientError, setNewClientError] = useState("");
  const [isSavingNewClient, setIsSavingNewClient] = useState(false);
  const [shareDialog, setShareDialog] = useState<ChatShareDialogState | null>(null);
  const [renameDialog, setRenameDialog] = useState<ChatRenameDialogState | null>(null);
  const [isShareCopied, setIsShareCopied] = useState(false);

  const addProjectClientOption = () => {
    setNewClientName("");
    setNewClientAbout("");
    setNewClientError("");
    setIsCreateClientDialogOpen(true);
  };

  const closeCreateClientDialog = () => {
    if (isSavingNewClient) return;
    setIsCreateClientDialogOpen(false);
    setNewClientError("");
  };

  const submitNewClient = async () => {
    const clientName = newClientName.trim();
    const clientAbout = newClientAbout.trim();
    if (!clientName || !clientAbout) return;

    try {
      setIsSavingNewClient(true);
      setNewClientError("");
      const createdClient = await createClientOption({ name: clientName, about: clientAbout });

      if (!createdClient) {
        throw new Error("Client API did not return the created client.");
      }

      setProjectClientOptions((current) => [...current, createdClient]);
      setNewProjectClient(createdClient.id);
      setIsCreateClientDialogOpen(false);
      setNewClientName("");
      setNewClientAbout("");
      setLastChatError("");
    } catch (error) {
      setNewClientError(error instanceof Error ? error.message : "Unable to create client in the API.");
    } finally {
      setIsSavingNewClient(false);
    }
  };

  const openProjectShareDialog = (project: Project) => {
    setOpenProjectActionMenuId(null);
    setIsShareCopied(false);
    setShareDialog({
      title: project.name,
      description: "Share this project label with your team.",
      value: `TriMerge project: ${project.name}`,
    });
  };

  const openConversationShareDialog = async (conversation: Conversation) => {
    setOpenConversationMenuId(null);
    setIsWorkspaceMenuOpen(false);
    setIsShareCopied(false);
    setShareDialog({
      title: conversation.title,
      description: "Creating a share link for this chat.",
      isLoading: true,
      value: "",
    });

    try {
      const shareLink = await createShareLink(conversation.id);
      if (!shareLink) throw new Error("Share link was not returned by the chat API.");

      setShareDialog({
        title: conversation.title,
        description: "Copy this link to share the conversation.",
        value: shareLink,
      });
    } catch (error) {
      setShareDialog(null);
      setLastChatError(error instanceof Error ? error.message : "Unable to create a share link.");
    }
  };

  const copyShareDialogValue = async () => {
    if (!shareDialog?.value) return;

    try {
      await navigator.clipboard.writeText(shareDialog.value);
      setIsShareCopied(true);
      window.setTimeout(() => setIsShareCopied(false), 1400);
    } catch {
      setLastChatError("Unable to copy automatically. Select the text and copy it manually.");
    }
  };

  const openConversationRenameDialog = (conversation: Conversation) => {
    setOpenConversationMenuId(null);
    setIsWorkspaceMenuOpen(false);
    setRenameDialog({
      id: conversation.id,
      kind: "conversation",
      originalName: conversation.title,
      value: conversation.title,
    });
  };

  const openProjectRenameDialog = (project: Project) => {
    setOpenProjectActionMenuId(null);
    setRenameDialog({
      id: project.id,
      kind: "project",
      originalName: project.name,
      value: project.name,
    });
  };

  const submitRenameDialog = async () => {
    if (!renameDialog || renameDialog.isSaving) return;

    const nextName = renameDialog.value.trim();
    if (!nextName) {
      setRenameDialog((current) => (current ? { ...current, error: "Enter a name before saving." } : current));
      return;
    }

    if (nextName === renameDialog.originalName) {
      setRenameDialog(null);
      return;
    }

    setRenameDialog((current) => (current ? { ...current, error: "", isSaving: true } : current));

    try {
      if (renameDialog.kind === "conversation") {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === renameDialog.id
              ? { ...conversation, title: nextName, updatedAt: new Date() }
              : conversation,
          ),
        );
        await renameConversation(renameDialog.id, nextName);
        persistConversationOverride(renameDialog.id, { title: nextName });
      } else {
        const previousProject = projects.find((project) => project.id === renameDialog.id);
        const apiProject = await updateApiProject(renameDialog.id, { name: nextName });
        setProjects((current) =>
          current.map((project) =>
            project.id === renameDialog.id
              ? { ...project, ...(apiProject ?? {}), name: apiProject?.name ?? nextName, pinned: project.pinned }
              : project,
          ),
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.projectId === renameDialog.id || conversation.projectName === previousProject?.name
              ? { ...conversation, projectName: apiProject?.name ?? nextName }
              : conversation,
          ),
        );
      }

      setLastChatError("");
      setRenameDialog(null);
    } catch (error) {
      setRenameDialog((current) =>
        current
          ? {
              ...current,
              error:
                error instanceof Error
                  ? error.message
                  : current.kind === "conversation"
                    ? "Unable to rename this conversation."
                    : "Unable to rename this project.",
              isSaving: false,
            }
          : current,
      );

      if (renameDialog.kind === "conversation") {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === renameDialog.id
              ? { ...conversation, title: renameDialog.originalName, updatedAt: new Date() }
              : conversation,
          ),
        );
      }
    }
  };

  return {
    addProjectClientOption,
    closeCreateClientDialog,
    copyShareDialogValue,
    isCreateClientDialogOpen,
    isSavingNewClient,
    isShareCopied,
    newClientAbout,
    newClientError,
    newClientName,
    openConversationRenameDialog,
    openConversationShareDialog,
    openProjectRenameDialog,
    openProjectShareDialog,
    renameDialog,
    setNewClientAbout,
    setNewClientName,
    setRenameDialog,
    setShareDialog,
    shareDialog,
    submitNewClient,
    submitRenameDialog,
  };
}
