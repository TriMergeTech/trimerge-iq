import type { Dispatch, SetStateAction } from "react";

import { createProject, deleteProject, updateProject as updateApiProject } from "./chatApi";
import { rememberStoredProjectName } from "./chatLocalState";
import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";

interface UseProjectActionsProps {
  conversations: Conversation[];
  newProjectClient: string;
  newProjectDescription: string;
  newProjectManager: string;
  newProjectName: string;
  newProjectService: string;
  newProjectTeam: string[];
  projects: Project[];
  selectedProjectId: ChatEntityId | null;
  setActiveConversationId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setAttachedFiles: Dispatch<SetStateAction<{ name: string; size: number; type: string }[]>>;
  setConversationSearch: Dispatch<SetStateAction<string>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreateProjectModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsProjectMenuOpen: Dispatch<SetStateAction<boolean>>;
  setLastChatError: Dispatch<SetStateAction<string>>;
  setNewProjectClient: Dispatch<SetStateAction<string>>;
  setNewProjectDescription: Dispatch<SetStateAction<string>>;
  setNewProjectManager: Dispatch<SetStateAction<string>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  setNewProjectService: Dispatch<SetStateAction<string>>;
  setNewProjectTeam: Dispatch<SetStateAction<string[]>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setOpenProjectActionMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setProjectHomeTab: Dispatch<SetStateAction<"chats" | "sources">>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setSelectedProjectId: Dispatch<SetStateAction<ChatEntityId | null>>;
}

export function useProjectActions({
  conversations,
  newProjectClient,
  newProjectDescription,
  newProjectManager,
  newProjectName,
  newProjectService,
  newProjectTeam,
  projects,
  selectedProjectId,
  setActiveConversationId,
  setAttachedFiles,
  setConversationSearch,
  setConversations,
  setInputMessage,
  setIsAttachmentMenuOpen,
  setIsCreateProjectModalOpen,
  setIsProjectMenuOpen,
  setLastChatError,
  setNewProjectClient,
  setNewProjectDescription,
  setNewProjectManager,
  setNewProjectName,
  setNewProjectService,
  setNewProjectTeam,
  setOpenConversationMenuId,
  setOpenProjectActionMenuId,
  setProjectHomeTab,
  setProjects,
  setSelectedProjectId,
}: UseProjectActionsProps) {
  const resetProjectForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectService("");
    setNewProjectTeam([]);
    setNewProjectManager("");
    setNewProjectClient("");
  };

  const openCreateProjectModal = () => {
    setIsProjectMenuOpen(false);
    resetProjectForm();
    setIsCreateProjectModalOpen(true);
  };

  const closeCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
    resetProjectForm();
  };

  const handleCreateProject = async () => {
    const nextName = newProjectName.trim();
    const nextDescription = newProjectDescription.trim();
    if (!nextName || !nextDescription || !newProjectManager || newProjectTeam.length === 0 || !newProjectClient || !newProjectService) {
      return;
    }

    const hasLocalStaffSelection =
      newProjectManager.startsWith("local-person-") || newProjectTeam.some((member) => member.startsWith("local-person-"));
    const hasLocalClientSelection = newProjectClient.startsWith("local-client-");
    const hasLocalServiceSelection = newProjectService.startsWith("local-service-");

    if (hasLocalStaffSelection || hasLocalClientSelection || hasLocalServiceSelection) {
      setLastChatError(
        "Projects API needs saved API records. Use a client/service from the API, and a staff user returned by the users endpoint. Local-only staff from the admin dashboard cannot be sent to /projects yet.",
      );
      return;
    }

    try {
      const apiProject = await createProject({
        name: nextName,
        description: nextDescription,
        service: newProjectService,
        team: newProjectTeam,
        projectManager: newProjectManager,
        client: newProjectClient,
      });

      if (!apiProject) {
        throw new Error("Project API did not return the created project.");
      }

      const newProject: Project = apiProject;
      setLastChatError("");

      setProjects((current) => [newProject, ...current]);
      rememberStoredProjectName(newProject.name);
      setSelectedProjectId(newProject.id);
      setActiveConversationId(null);
      setInputMessage("");
      setAttachedFiles([]);
      setConversationSearch("");
      setIsAttachmentMenuOpen(false);
      setOpenConversationMenuId(null);
      setOpenProjectActionMenuId(null);
      setIsProjectMenuOpen(false);
      closeCreateProjectModal();
    } catch (error) {
      setLastChatError(error instanceof Error ? error.message : "Unable to create project in the API.");
    }
  };

  const handleSelectProject = (projectId: ChatEntityId | null) => {
    setSelectedProjectId(projectId);
    setActiveConversationId(null);
    setProjectHomeTab("chats");
    setOpenConversationMenuId(null);
    setOpenProjectActionMenuId(null);
    setIsProjectMenuOpen(false);
  };

  const toggleTeamMember = (member: string) => {
    setNewProjectTeam((current) =>
      current.includes(member) ? current.filter((item) => item !== member) : [...current, member],
    );
  };

  const updateProject = (projectId: ChatEntityId, updater: (project: Project) => Project | null) => {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? updater(project) : project)).filter(Boolean) as Project[],
    );
  };

  const handleRenameProject = async (project: Project) => {
    const nextName = window.prompt("Rename project", project.name)?.trim();
    if (!nextName) return;

    try {
      const apiProject = await updateApiProject(project.id, { name: nextName });
      if (apiProject) {
        updateProject(project.id, (current) => ({ ...current, ...apiProject, pinned: current.pinned }));
      } else {
        updateProject(project.id, (current) => ({ ...current, name: nextName }));
      }
      setLastChatError("");
    } catch (error) {
      setLastChatError(error instanceof Error ? error.message : "Unable to rename project in the API.");
      updateProject(project.id, (current) => ({ ...current, name: nextName }));
    }

    setOpenProjectActionMenuId(null);
  };

  const handlePinProject = (projectId: ChatEntityId) => {
    updateProject(projectId, (current) => ({ ...current, pinned: !current.pinned }));
    setOpenProjectActionMenuId(null);
  };

  const handleArchiveProject = (projectId: ChatEntityId) => {
    updateProject(projectId, (current) => ({ ...current, archived: true }));

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setActiveConversationId(null);
    }

    setOpenProjectActionMenuId(null);
  };

  const handleDeleteProject = async (projectId: ChatEntityId) => {
    const previousSelectedProjectId = selectedProjectId;
    const deletedProject = projects.find((project) => project.id === projectId) ?? null;
    const previousConversationsProjectState = new Map<ChatEntityId, Pick<Conversation, "projectId" | "projectName">>(
      conversations
        .filter((conversation) => conversation.projectId === projectId)
        .map((conversation) => [
          conversation.id,
          {
            projectId: conversation.projectId,
            projectName: conversation.projectName,
          },
        ]),
    );

    setProjects((current) => current.filter((project) => project.id !== projectId));
    setConversations((current) =>
      current.map((conversation) =>
        conversation.projectId === projectId ? { ...conversation, projectId: null } : conversation,
      ),
    );

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setActiveConversationId(null);
    }

    setOpenProjectActionMenuId(null);

    try {
      await deleteProject(projectId);
      setLastChatError("");
    } catch (error) {
      setLastChatError(error instanceof Error ? error.message : "Unable to delete project in the API.");

      if (deletedProject) setProjects((current) => [deletedProject, ...current]);
      setConversations((current) =>
        current.map((conversation) => {
          const previousProjectState = previousConversationsProjectState.get(conversation.id);
          return previousProjectState ? { ...conversation, ...previousProjectState } : conversation;
        }),
      );

      if (previousSelectedProjectId === projectId) {
        setSelectedProjectId(projectId);
        setActiveConversationId(null);
      }
    }
  };

  const handleShareProject = async (project: Project) => {
    const shareLabel = `TriMerge project: ${project.name}`;

    try {
      await navigator.clipboard.writeText(shareLabel);
    } catch {
      window.prompt("Copy this project label", shareLabel);
    }

    setOpenProjectActionMenuId(null);
  };

  return {
    closeCreateProjectModal,
    handleArchiveProject,
    handleCreateProject,
    handleDeleteProject,
    handlePinProject,
    handleRenameProject,
    handleSelectProject,
    handleShareProject,
    openCreateProjectModal,
    toggleTeamMember,
  };
}
