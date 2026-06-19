"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Archive as ArchiveIcon, ChevronDown, Clock3, FileText, Image as ImageIcon, Link2, MessageSquarePlus, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Pencil, Pin, PinOff, Plus, Search, Sparkles, Trash2, X } from "lucide-react";

import ChatComposer from "./ChatComposer";
import styles from "./ChatPage.module.css";
import {
  readStoredAdminPeople,
  writeStoredAdminPeople,
} from "./adminRegistryState";
import { createClientOption, createShareLink, fetchConversations, fetchMessages, fetchProjectFormOptions, fetchProjects, getChatProfile, renameConversation, updateProject as updateApiProject } from "./chatApi";
import { applyConversationOverrides, persistConversationOverride, readStoredProjectNames, readStoredProjects, writeStoredProjects } from "./chatLocalState";
import ConversationMenuItem from "./ConversationMenuItem";
import ConversationView from "./ConversationView";
import CreateClientDialog from "./CreateClientDialog";
import CreateProjectModal from "./CreateProjectModal";
import ProjectHomePanel from "./ProjectHomePanel";
import RenameDialog from "./RenameDialog";
import ShareDialog from "./ShareDialog";
import { type ChatEntityId, type Conversation, type Project, type ProjectFormOption, type UploadedFile } from "./chatPageTypes";
import { formatFileSize } from "./chatPageUtils";
import { useConversationActions } from "./useConversationActions";
import { useProjectActions } from "./useProjectActions";

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<ChatEntityId | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<ChatEntityId | null>(null);
  const [projectHomeTab, setProjectHomeTab] = useState<"chats" | "sources">("chats");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarConversationView, setSidebarConversationView] = useState<"active" | "archived">("active");
  const [conversationSearch, setConversationSearch] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingChatData, setIsLoadingChatData] = useState(true);
  const [lastChatError, setLastChatError] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [openConversationMenuId, setOpenConversationMenuId] = useState<ChatEntityId | null>(null);
  const [openProjectActionMenuId, setOpenProjectActionMenuId] = useState<ChatEntityId | null>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectService, setNewProjectService] = useState("");
  const [newProjectTeam, setNewProjectTeam] = useState<string[]>([]);
  const [newProjectManager, setNewProjectManager] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [projectClientOptions, setProjectClientOptions] = useState<ProjectFormOption[]>([]);
  const [projectServiceOptions, setProjectServiceOptions] = useState<ProjectFormOption[]>([]);
  const [projectStaffOptions, setProjectStaffOptions] = useState<ProjectFormOption[]>([]);
  const [isLoadingProjectOptions, setIsLoadingProjectOptions] = useState(false);
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientAbout, setNewClientAbout] = useState("");
  const [newClientError, setNewClientError] = useState("");
  const [isSavingNewClient, setIsSavingNewClient] = useState(false);
  const [shareDialog, setShareDialog] = useState<{
    description: string;
    isLoading?: boolean;
    title: string;
    value: string;
  } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{
    error?: string;
    id: ChatEntityId;
    isSaving?: boolean;
    kind: "conversation" | "project";
    originalName: string;
    value: string;
  } | null>(null);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const projectsRef = useRef<Project[]>([]);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const conversationMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const projectActionMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(() => conversations.find((c) => c.id === activeConversationId) ?? null, [activeConversationId, conversations]);
  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedProjectId) ?? null, [projects, selectedProjectId]);
  const activeSidebarConversations = useMemo(() => {
    const base = conversations.filter((c) => !c.archived && c.projectId === null);
    if (!conversationSearch.trim()) return base;
    return base.filter((c) => c.title.toLowerCase().includes(conversationSearch.toLowerCase()));
  }, [conversationSearch, conversations]);
  const archivedSidebarConversations = useMemo(() => {
    const base = conversations.filter((c) => c.archived);
    if (!conversationSearch.trim()) return base;
    return base.filter((c) => c.title.toLowerCase().includes(conversationSearch.toLowerCase()));
  }, [conversationSearch, conversations]);
  const sidebarConversations = sidebarConversationView === "archived" ? archivedSidebarConversations : activeSidebarConversations;
  const visibleSidebarConversations = useMemo(() => [...sidebarConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  }), [sidebarConversations]);
  const filteredConversations = useMemo(() => {
    const base = conversations.filter((c) => !c.archived && c.projectId === selectedProjectId);
    if (!conversationSearch.trim()) return base;
    return base.filter((c) => c.title.toLowerCase().includes(conversationSearch.toLowerCase()));
  }, [conversationSearch, conversations, selectedProjectId]);
  const visibleConversations = useMemo(() => [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  }), [filteredConversations]);
  const recentProjects = useMemo(
    () =>
      [...projects]
        .filter((project) => !project.archived)
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        }),
    [projects],
  );
  const projectRecentConversations = useMemo(() => visibleConversations.slice(0, 6), [visibleConversations]);

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
            conversation.id === renameDialog.id ? { ...conversation, title: nextName, updatedAt: new Date() } : conversation,
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
            conversation.id === renameDialog.id ? { ...conversation, title: renameDialog.originalName, updatedAt: new Date() } : conversation,
          ),
        );
      }
    }
  };

  const addProjectStaffOption = () => {
    const staffName = window.prompt("Staff member name")?.trim();
    if (!staffName) return;

    const newStaff = {
      id: `local-person-${Date.now()}`,
      name: staffName,
      email: "",
      role: "staff" as const,
      createdAt: new Date(),
    };

    writeStoredAdminPeople([...readStoredAdminPeople(), newStaff]);
    setProjectStaffOptions((current) => [...current, { id: newStaff.id, label: newStaff.name }]);
    setNewProjectManager((current) => current || newStaff.id);
    setNewProjectTeam((current) => (current.includes(newStaff.id) ? current : [...current, newStaff.id]));
  };

  useEffect(() => {
    projectsRef.current = projects;
    writeStoredProjects(projects);
  }, [projects]);

  useEffect(() => {
    let isCancelled = false;

    const loadProjects = async () => {
      try {
        const apiProjects = await fetchProjects();
        if (isCancelled || apiProjects.length === 0) return;

        setProjects((current) => {
          const storedProjects = readStoredProjects();
          const currentById = new Map(current.map((project) => [String(project.id), project]));
          const currentByName = new Map(current.map((project) => [project.name, project]));
          const storedById = new Map(storedProjects.map((project) => [String(project.id), project]));
          const storedByName = new Map(storedProjects.map((project) => [project.name, project]));

          return apiProjects.map((project) => {
            const existingProject =
              currentById.get(String(project.id)) ??
              currentByName.get(project.name) ??
              storedById.get(String(project.id)) ??
              storedByName.get(project.name);
            return {
              ...existingProject,
              ...project,
              pinned: existingProject?.pinned ?? project.pinned,
              archived: existingProject?.archived ?? project.archived,
            };
          });
        });
        setLastChatError("");
      } catch (error) {
        if (!isCancelled) {
          setLastChatError(error instanceof Error ? error.message : "Unable to load projects right now.");
        }
      }
    };

    void loadProjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!isCreateProjectModalOpen) return;

    const loadProjectOptions = async () => {
      setIsLoadingProjectOptions(true);

      try {
        const options = await fetchProjectFormOptions();
        if (isCancelled) return;

        setProjectClientOptions(options.clients);
        setProjectServiceOptions(options.services);
        setProjectStaffOptions(options.staff);
        setLastChatError("");
      } catch (error) {
        if (!isCancelled) {
          setLastChatError(error instanceof Error ? error.message : "Unable to load project options right now.");
        }
      } finally {
        if (!isCancelled) setIsLoadingProjectOptions(false);
      }
    };

    void loadProjectOptions();

    return () => {
      isCancelled = true;
    };
  }, [isCreateProjectModalOpen]);

  useEffect(() => {
    if (!isCreateProjectModalOpen) return;

    if (!newProjectService && projectServiceOptions[0]) setNewProjectService(projectServiceOptions[0].id);
    if (!newProjectClient && projectClientOptions[0]) setNewProjectClient(projectClientOptions[0].id);
    if (!newProjectManager && projectStaffOptions[0]) setNewProjectManager(projectStaffOptions[0].id);
  }, [
    isCreateProjectModalOpen,
    newProjectClient,
    newProjectManager,
    newProjectService,
    projectClientOptions,
    projectServiceOptions,
    projectStaffOptions,
  ]);

  useEffect(() => {
    let isCancelled = false;

    const loadConversations = async () => {
      setIsLoadingChatData(true);
      setLastChatError("");

      try {
        const profile = getChatProfile();
        const projectNames = Array.from(
          new Set([
            ...projectsRef.current.map((project) => project.name),
            ...readStoredProjectNames(),
            ...(selectedProject?.name ? [selectedProject.name] : []),
          ]),
        );
        const buildConversationRequests = (includeArchived: boolean) => [
          fetchConversations(profile, null, 1, 100, includeArchived),
          ...projectNames.map((projectName) => fetchConversations(profile, projectName, 1, 100, includeArchived)),
        ];
        const conversationGroups = await Promise.all([
          ...buildConversationRequests(false),
          ...buildConversationRequests(true),
        ]);
        const conversationMap = new Map<ChatEntityId, Conversation>();

        conversationGroups.flat().forEach((conversation) => {
          conversationMap.set(conversation.id, conversation);
        });

        const apiConversations = Array.from(conversationMap.values());
        if (isCancelled) return;

        setConversations((current) => {
          const currentMap = new Map(current.map((conversation) => [conversation.id, conversation]));

          return applyConversationOverrides(apiConversations)
            .map((conversation) => {
              const existingConversation = currentMap.get(conversation.id);

              const projectId =
                existingConversation?.projectId ??
                projectsRef.current.find((project) => project.name === conversation.projectName)?.id ??
                null;

              return {
                ...conversation,
                projectId,
                pinned: conversation.pinned ?? existingConversation?.pinned,
                archived: conversation.archived,
                messages: existingConversation?.messages ?? [],
                updatedAt: existingConversation?.updatedAt ?? conversation.updatedAt,
              };
            })
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        });
      } catch (error) {
        if (!isCancelled) {
          setLastChatError(error instanceof Error ? error.message : "Unable to load conversations right now.");
        }
      } finally {
        if (!isCancelled) setIsLoadingChatData(false);
      }
    };

    void loadConversations();

    return () => {
      isCancelled = true;
    };
  }, [selectedProject?.name]);

  useEffect(() => {
    const inferredProjects = Array.from(
      new Set(
        conversations
          .map((conversation) => conversation.projectName?.trim())
          .filter((projectName): projectName is string => Boolean(projectName)),
      ),
    );

    if (inferredProjects.length === 0) return;

    setProjects((current) => {
      const existingProjectNames = new Set(current.map((project) => project.name));
      const nextProjects = inferredProjects
        .filter((projectName) => !existingProjectNames.has(projectName))
        .map((projectName) => ({
          id: Date.now() + Math.floor(Math.random() * 100000),
          name: projectName,
          createdAt: new Date(),
        }));

      return nextProjects.length > 0 ? [...current, ...nextProjects] : current;
    });
  }, [conversations]);

  useEffect(() => {
    if (projects.length === 0 || conversations.length === 0) return;

    const projectIdsByName = new Map(projects.map((project) => [project.name, project.id]));
    let hasProjectIdUpdates = false;

    const nextConversations = conversations.map((conversation) => {
      if (!conversation.projectName) return conversation;

      const projectId = projectIdsByName.get(conversation.projectName) ?? null;
      if (conversation.projectId === projectId) return conversation;

      hasProjectIdUpdates = true;
      return {
        ...conversation,
        projectId,
      };
    });

    if (hasProjectIdUpdates) setConversations(nextConversations);
  }, [projects, conversations]);

  useEffect(() => {
    if (!activeConversationId) return;

    const activeWithMessages = conversations.find((conversation) => conversation.id === activeConversationId);
    if (activeWithMessages?.messages.length) return;

    let isCancelled = false;

    const loadMessages = async () => {
      setLastChatError("");

      try {
        const messages = await fetchMessages(activeConversationId);
        if (isCancelled) return;

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === activeConversationId
              ? {
                  ...conversation,
                  updatedAt: messages[messages.length - 1]?.timestamp ?? conversation.updatedAt,
                  messages,
                }
              : conversation,
          ),
        );
      } catch (error) {
        if (!isCancelled) {
          setLastChatError(error instanceof Error ? error.message : "Unable to load messages right now.");
        }
      }
    };

    void loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [activeConversationId, conversations]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) setIsAttachmentMenuOpen(false);
      if (conversationMenuRef.current && !conversationMenuRef.current.contains(event.target as Node)) setOpenConversationMenuId(null);
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) setIsProjectMenuOpen(false);
      if (projectActionMenuRef.current && !projectActionMenuRef.current.contains(event.target as Node)) setOpenProjectActionMenuId(null);
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) setIsWorkspaceMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = isCreateProjectModalOpen ? "hidden" : previousHtmlOverflow;
    document.body.style.overflow = isCreateProjectModalOpen ? "hidden" : previousBodyOverflow;

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isCreateProjectModalOpen]);

  useEffect(() => {
    if (!isCreateProjectModalOpen) return;
    const timeoutId = window.setTimeout(() => projectNameInputRef.current?.focus(), 30);
    return () => window.clearTimeout(timeoutId);
  }, [isCreateProjectModalOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setAttachedFiles((current) => [...current, ...Array.from(files).map((file) => ({ name: file.name, size: file.size, type: file.type }))]);
    event.target.value = "";
  };

  const {
    closeCreateProjectModal,
    handleArchiveProject,
    handleCreateProject,
    handleDeleteProject,
    handlePinProject,
    handleSelectProject,
    openCreateProjectModal,
    toggleTeamMember,
  } = useProjectActions({
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
  });

  const {
    handleArchiveConversation,
    handleClearActiveChat,
    handleDeleteConversation,
    handlePinConversation,
    sendMessage,
    startNewChat,
  } = useConversationActions({
    activeConversation,
    activeConversationId,
    attachedFiles,
    inputMessage,
    selectedProjectId,
    selectedProjectName: selectedProject?.name,
    setActiveConversationId,
    setAttachedFiles,
    setConversations,
    setInputMessage,
    setIsAttachmentMenuOpen,
    setIsTyping,
    setIsWorkspaceMenuOpen,
    setLastChatError,
    setOpenConversationMenuId,
  });

  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {isCreateProjectModalOpen && (
        <CreateProjectModal
          clientOptions={projectClientOptions}
          isLoadingProjectOptions={isLoadingProjectOptions}
          newProjectClient={newProjectClient}
          newProjectDescription={newProjectDescription}
          newProjectManager={newProjectManager}
          newProjectName={newProjectName}
          newProjectService={newProjectService}
          newProjectTeam={newProjectTeam}
          onAddClient={addProjectClientOption}
          onAddStaff={addProjectStaffOption}
          onClose={closeCreateProjectModal}
          onCreateProject={handleCreateProject}
          projectNameInputRef={projectNameInputRef}
          serviceOptions={projectServiceOptions}
          setNewProjectClient={setNewProjectClient}
          setNewProjectDescription={setNewProjectDescription}
          setNewProjectManager={setNewProjectManager}
          setNewProjectName={setNewProjectName}
          setNewProjectService={setNewProjectService}
          staffOptions={projectStaffOptions}
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
          onClose={closeCreateClientDialog}
          onNameChange={setNewClientName}
          onSubmit={submitNewClient}
        />
      )}
      {shareDialog && (
        <ShareDialog
          copied={isShareCopied}
          description={shareDialog.description}
          isLoading={shareDialog.isLoading}
          onClose={() => setShareDialog(null)}
          onCopy={copyShareDialogValue}
          title={shareDialog.title}
          value={shareDialog.value}
        />
      )}
      {renameDialog && (
        <RenameDialog
          error={renameDialog.error}
          isSaving={renameDialog.isSaving}
          label={renameDialog.kind === "conversation" ? "Rename chat" : "Rename project"}
          onChange={(value) => setRenameDialog((current) => (current ? { ...current, error: "", value } : current))}
          onClose={() => {
            if (!renameDialog.isSaving) setRenameDialog(null);
          }}
          onSubmit={submitRenameDialog}
          title={renameDialog.kind === "conversation" ? renameDialog.originalName : "Project workspace"}
          value={renameDialog.value}
        />
      )}

      <div className={styles.chatShell}>
        <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollapsed : ""}`}>
          <button
            type="button"
            onClick={() => setIsSidebarOpen((current) => !current)}
            className={styles.sideCollapse}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => { setSidebarConversationView("active"); startNewChat(); }}
            className={`${styles.newChat} ${!isSidebarOpen ? styles.newChatCollapsed : ""}`}
          >
            <MessageSquarePlus className="h-5 w-5" />
            {isSidebarOpen && <span>New chat</span>}
          </button>

          {isSidebarOpen ? (
            <div className={styles.searchWrap}>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c5cff]/58" />
              <input type="text" value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder={sidebarConversationView === "archived" ? "Search archived" : "Search chats"} className={styles.searchInput} />
            </div>
          ) : (
            <button type="button" aria-label="Search chats" className={styles.sideCollapse}>
              <Search className="h-4 w-4" />
            </button>
          )}

          {isSidebarOpen && (
            <div className="relative" ref={projectMenuRef}>
              <button
                type="button"
                onClick={() => setIsProjectMenuOpen((current) => !current)}
                className={styles.projectSelect}
              >
                <span>Project</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProjectMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isProjectMenuOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 rounded-[20px] border border-white/[0.08] bg-[#0b111a]/96 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                  <button type="button" onClick={openCreateProjectModal} className="interactive-button flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left text-white hover:bg-white/[0.06]">
                    <span className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-[#7c5cff]" />
                      <span className="text-sm font-medium">Create new project</span>
                    </span>
                    <Plus className="h-4 w-4 text-[#7c5cff]" />
                  </button>
                  <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b7a6ff]/60">Recent projects</div>
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`group relative rounded-[14px] ${selectedProjectId === project.id ? "border border-[#7c5cff]/18 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]" : "hover:bg-white/[0.045]"}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectProject(project.id)}
                        className={`interactive-button flex w-full items-center justify-between rounded-[14px] px-3 py-3 pr-12 text-left ${selectedProjectId === project.id ? "text-white" : "text-white/88"}`}
                      >
                        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                          {project.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#7c5cff]" />}
                          <span className="truncate">{project.name}</span>
                        </span>
                      </button>

                      <div className="absolute right-2 top-1/2 -translate-y-1/2" ref={openProjectActionMenuId === project.id ? projectActionMenuRef : undefined}>
                        <button
                          type="button"
                          aria-label={`Project actions for ${project.name}`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenProjectActionMenuId((current) => current === project.id ? null : project.id);
                          }}
                          className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-black/[0.24] text-[#f6edd0] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:border-[#7c5cff]/28 hover:bg-white/[0.08] ${openProjectActionMenuId === project.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none"}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openProjectActionMenuId === project.id && (
                          <div className="absolute right-0 top-10 z-20 w-48 rounded-[18px] border border-white/[0.08] bg-[#0b111a]/96 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                            <ConversationMenuItem icon={<Link2 className="h-4 w-4" />} label="Share" onClick={() => openProjectShareDialog(project)} />
                            <ConversationMenuItem icon={<Pencil className="h-4 w-4" />} label="Rename" onClick={() => openProjectRenameDialog(project)} />
                            <ConversationMenuItem icon={project.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />} label={project.pinned ? "Unpin project" : "Pin project"} onClick={() => handlePinProject(project.id)} />
                            <ConversationMenuItem icon={<ArchiveIcon className="h-4 w-4" />} label="Archive" onClick={() => handleArchiveProject(project.id)} />
                            <ConversationMenuItem icon={<Trash2 className="h-4 w-4" />} label="Delete" danger onClick={() => handleDeleteProject(project.id)} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isSidebarOpen && (
            <>
              <button
                type="button"
                onClick={() => setSidebarConversationView((current) => (current === "archived" ? "active" : "archived"))}
                className={`${styles.sideRow} ${sidebarConversationView === "archived" ? styles.sideRowActive : ""}`}
              >
                <span className={styles.sideRowLeft}>
                  <ArchiveIcon className="h-4 w-4 shrink-0" />
                  <span>Archived</span>
                </span>
                <span className={styles.sideCount}>{archivedSidebarConversations.length}</span>
              </button>

              <div className={styles.sideLabel}>{sidebarConversationView === "archived" ? "Archived" : "Recents"}</div>
            </>
          )}

          {isSidebarOpen && <div className="space-y-2">
            {isLoadingChatData && <div className={styles.emptyCard}>Loading conversations...</div>}
            {visibleSidebarConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              return (
                <div key={conversation.id} className={`group ${styles.convItem} ${isActive ? styles.convItemActive : ""}`}>
                  <button type="button" onClick={() => { setSelectedProjectId(conversation.projectId); setActiveConversationId(conversation.id); setIsAttachmentMenuOpen(false); setOpenConversationMenuId(null); }} className={styles.convBtn}>
                    {sidebarConversationView === "archived" ? <ArchiveIcon className={styles.convIcon} /> : <Clock3 className={styles.convIcon} />}
                    <div className="min-w-0">
                      <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-white/90">
                        {conversation.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#7c5cff]" />}
                        <span className="truncate">{conversation.title}</span>
                      </p>
                      {sidebarConversationView === "archived" && conversation.projectName && <p className="mt-1 truncate text-xs text-[#b7a6ff]/52">{conversation.projectName}</p>}
                      <p className="mt-1 text-xs text-[#d8dbe3]/42">{conversation.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </button>

                  <div className="absolute right-2 top-2" ref={openConversationMenuId === conversation.id ? conversationMenuRef : undefined}>
                    <button type="button" aria-label="Conversation options" onClick={() => setOpenConversationMenuId((current) => current === conversation.id ? null : conversation.id)} className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full text-[#d8d0ff]/80 ${openConversationMenuId === conversation.id ? "border border-[#7c5cff]/24 bg-white/[0.08]" : "opacity-0 group-hover:opacity-100 hover:bg-white/[0.06]"}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {openConversationMenuId === conversation.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-[18px] border border-white/[0.08] bg-[#0b111a]/96 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                        <ConversationMenuItem icon={<Link2 className="h-4 w-4" />} label="Share" onClick={() => void openConversationShareDialog(conversation)} />
                        <ConversationMenuItem icon={<Pencil className="h-4 w-4" />} label="Rename" onClick={() => openConversationRenameDialog(conversation)} />
                        <ConversationMenuItem icon={conversation.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />} label={conversation.pinned ? "Unpin chat" : "Pin chat"} onClick={() => handlePinConversation(conversation.id)} />
                        <ConversationMenuItem icon={<ArchiveIcon className="h-4 w-4" />} label={conversation.archived ? "Unarchive" : "Archive"} onClick={() => handleArchiveConversation(conversation.id, !conversation.archived)} />
                        <ConversationMenuItem icon={<Trash2 className="h-4 w-4" />} label="Delete" danger onClick={() => handleDeleteConversation(conversation.id)} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!isLoadingChatData && visibleSidebarConversations.length === 0 && <div className={styles.emptyCard}>{sidebarConversationView === "archived" ? "No archived conversations yet." : "No conversations match that search yet."}</div>}
          </div>}

        </aside>

        <div className={styles.main}>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {lastChatError && (
              <div className={styles.alertWrap}>
                <div className={styles.alertBanner}>
                  {lastChatError}
                </div>
              </div>
            )}
            {activeConversation ? (
              <ConversationView
                activeConversation={activeConversation}
                formatFileSize={formatFileSize}
                isTyping={isTyping}
                isWorkspaceMenuOpen={isWorkspaceMenuOpen}
                onArchiveConversation={handleArchiveConversation}
                onClearActiveChat={handleClearActiveChat}
                onDeleteConversation={handleDeleteConversation}
                onPinConversation={handlePinConversation}
                onRenameConversation={openConversationRenameDialog}
                onShareConversation={(conversation) => void openConversationShareDialog(conversation)}
                onStartNewChat={startNewChat}
                onToggleWorkspaceMenu={() => setIsWorkspaceMenuOpen((current) => !current)}
                selectedProjectName={selectedProject?.name}
                workspaceMenuRef={workspaceMenuRef}
              />
            ) : (
              <ProjectHomePanel
                composer={
                  <ChatComposer
                    attachedFiles={attachedFiles}
                    attachmentMenuRef={attachmentMenuRef}
                    fileInputRef={fileInputRef}
                    imageInputRef={imageInputRef}
                    inputMessage={inputMessage}
                    isAttachmentMenuOpen={isAttachmentMenuOpen}
                    isTyping={isTyping}
                    onFileSelect={handleFileSelect}
                    onInputMessageChange={setInputMessage}
                    onSubmit={() => sendMessage()}
                    setIsAttachmentMenuOpen={setIsAttachmentMenuOpen}
                  />
                }
                onOpenConversation={setActiveConversationId}
                onProjectHomeTabChange={setProjectHomeTab}
                projectHomeTab={projectHomeTab}
                projectRecentConversations={projectRecentConversations}
                selectedProject={selectedProject}
              />
            )}

            {attachedFiles.length > 0 && (
              <div className="px-6 pb-3 lg:px-12">
                <div className="mx-auto flex max-w-[1160px] flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div key={file.name} className="flex items-center gap-2 rounded-2xl border border-[#7c5cff]/22 bg-[#101827]/80 px-3 py-2 text-white/88">
                      {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span className="max-w-[160px] truncate text-sm">{file.name}</span>
                      <button type="button" onClick={() => setAttachedFiles((current) => current.filter((item) => item.name !== file.name))} className="interactive-button rounded-full p-1 hover:bg-[#7c5cff]/12"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConversation && (
              <div className={styles.activeComposerFooter}>
              <div className="mx-auto max-w-[1480px]">
                <ChatComposer
                  attachedFiles={attachedFiles}
                  attachmentMenuRef={attachmentMenuRef}
                  fileInputRef={fileInputRef}
                  imageInputRef={imageInputRef}
                  inputMessage={inputMessage}
                  isAttachmentMenuOpen={isAttachmentMenuOpen}
                  isTyping={isTyping}
                  onFileSelect={handleFileSelect}
                  onInputMessageChange={setInputMessage}
                  onSubmit={() => sendMessage()}
                  setIsAttachmentMenuOpen={setIsAttachmentMenuOpen}
                />
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


