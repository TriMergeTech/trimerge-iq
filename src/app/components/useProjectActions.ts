import type { Dispatch, SetStateAction } from "react";

import { serviceOptions, staffOptions, type Conversation, type Project } from "./chatPageTypes";

interface UseProjectActionsProps {
  newProjectClient: string;
  newProjectDescription: string;
  newProjectManager: (typeof staffOptions)[number];
  newProjectName: string;
  newProjectService: (typeof serviceOptions)[number];
  newProjectTeam: string[];
  selectedProjectId: number | null;
  setActiveConversationId: Dispatch<SetStateAction<number | null>>;
  setAttachedFiles: Dispatch<SetStateAction<{ name: string; size: number; type: string }[]>>;
  setConversationSearch: Dispatch<SetStateAction<string>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreateProjectModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsProjectMenuOpen: Dispatch<SetStateAction<boolean>>;
  setNewProjectClient: Dispatch<SetStateAction<string>>;
  setNewProjectDescription: Dispatch<SetStateAction<string>>;
  setNewProjectManager: Dispatch<SetStateAction<(typeof staffOptions)[number]>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  setNewProjectService: Dispatch<SetStateAction<(typeof serviceOptions)[number]>>;
  setNewProjectTeam: Dispatch<SetStateAction<string[]>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<number | null>>;
  setOpenProjectActionMenuId: Dispatch<SetStateAction<number | null>>;
  setProjectHomeTab: Dispatch<SetStateAction<"chats" | "sources">>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setSelectedProjectId: Dispatch<SetStateAction<number | null>>;
}

export function useProjectActions({
  newProjectClient,
  newProjectDescription,
  newProjectManager,
  newProjectName,
  newProjectService,
  newProjectTeam,
  selectedProjectId,
  setActiveConversationId,
  setAttachedFiles,
  setConversationSearch,
  setConversations,
  setInputMessage,
  setIsAttachmentMenuOpen,
  setIsCreateProjectModalOpen,
  setIsProjectMenuOpen,
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
    setNewProjectService(serviceOptions[0]);
    setNewProjectTeam([]);
    setNewProjectManager(staffOptions[0]);
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

  const handleCreateProject = () => {
    const nextName = newProjectName.trim();
    if (!nextName) return;

    const newProject: Project = {
      id: Date.now(),
      name: nextName,
      createdAt: new Date(),
      description: newProjectDescription.trim(),
      service: newProjectService,
      team: newProjectTeam,
      projectManager: newProjectManager,
      client: newProjectClient.trim(),
    };

    setProjects((current) => [newProject, ...current]);
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
  };

  const handleSelectProject = (projectId: number | null) => {
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

  const updateProject = (projectId: number, updater: (project: Project) => Project | null) => {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? updater(project) : project)).filter(Boolean) as Project[],
    );
  };

  const handleRenameProject = (project: Project) => {
    const nextName = window.prompt("Rename project", project.name)?.trim();
    if (!nextName) return;

    updateProject(project.id, (current) => ({ ...current, name: nextName }));
    setOpenProjectActionMenuId(null);
  };

  const handlePinProject = (projectId: number) => {
    updateProject(projectId, (current) => ({ ...current, pinned: !current.pinned }));
    setOpenProjectActionMenuId(null);
  };

  const handleArchiveProject = (projectId: number) => {
    updateProject(projectId, (current) => ({ ...current, archived: true }));

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setActiveConversationId(null);
    }

    setOpenProjectActionMenuId(null);
  };

  const handleDeleteProject = (projectId: number) => {
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
