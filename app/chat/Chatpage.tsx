"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Clock3,
  FileText,
  Image as ImageIcon,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  X,
} from "lucide-react";

import ChatComposer from "./ChatComposer";
import ConversationMenuItem from "./ConversationMenuItem";
import ConversationView from "./ConversationView";
import CreateProjectModal from "./CreateProjectModal";
import ProjectHomePanel from "./ProjectHomePanel";
import {
  serviceOptions,
  staffOptions,
  type UploadedFile,
} from "./chatPageTypes";
import { formatFileSize } from "./chatPageUtils";
import { useConversationActions } from "./useConversationActions";
import { useProjectActions } from "./useProjectActions";
import { post_request } from "../utils/services";
import { emitter } from "../page";

export default function ChatPage() {
  const [projects, setProjects] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectHomeTab, setProjectHomeTab] = useState<"chats" | "sources">(
    "chats",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversationSearch, setConversationSearch] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [openConversationMenuId, setOpenConversationMenuId] = useState<
    number | null
  >(null);
  const [openProjectActionMenuId, setOpenProjectActionMenuId] = useState<
    number | null
  >(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectService, setNewProjectService] = useState<
    (typeof serviceOptions)[number]
  >(serviceOptions[0]);
  const [newProjectTeam, setNewProjectTeam] = useState<string[]>([]);
  const [newProjectManager, setNewProjectManager] = useState<
    (typeof staffOptions)[number]
  >(staffOptions[0]);
  const [activeConversation, set_active_conversation] = useState(null);
  const [newProjectClient, setNewProjectClient] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const conversationMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const projectActionMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const [recent_message, set_recent_message] = useState(null);

  const handle_select_project = (project) => {
    setSelectedProject(project);
    set_active_conversation(null);
  };

  const get_user = () => {
    let usr = window.localStorage.getItem("profile");
    try {
      usr = JSON.parse(usr);
    } catch (e) {
      usr = null;
      setError(e.message);
      setIsCreating(false);
    } finally {
    }

    return usr;
  };
  useEffect(() => {
    let usr = get_user();
    if (!usr) return;

    const load = async () => {
      try {
        console.log(usr);
        const [projectsRes, conversationsRes] = await Promise.all([
          post_request("get_projects", { user: usr._id }),
          post_request(`$AGENCY/conversations`, { user: usr._id }),
        ]);

        console.log(projectsRes, conversationsRes);
        if (!projectsRes.ok) {
          throw new Error(`Failed to load projects: ${projectsRes.message}`);
        }
        if (!conversationsRes.ok) {
          throw new Error(
            `Failed to load conversations: ${conversationsRes.message}`,
          );
        }

        setProjects(projectsRes.data);
        setConversations(conversationsRes.data);
      } catch (err) {
        if ((err as any).name === "AbortError") return;
        console.error("Error loading initial data", err);
      }
    };

    load();
  }, []);

  // const selectedProject = useMemo(
  //   () => projects.find((project) => project._id === selectedProject?._id) ?? null,
  //   [projects, selectedProjectId],
  // );
  // const filteredConversations = useMemo(() => {
  //   const base = conversations.filter(
  //     (c) => !c.archived && c.projectId === selectedProjectId,
  //   );
  //   if (!conversationSearch.trim()) return base;
  //   return base.filter((c) =>
  //     c.title.toLowerCase().includes(conversationSearch.toLowerCase()),
  //   );
  // }, [conversationSearch, conversations, selectedProjectId]);
  // const visibleConversations = useMemo(
  //   () =>
  //     [...filteredConversations].sort((a, b) => {
  //       if (a.pinned && !b.pinned) return -1;
  //       if (!a.pinned && b.pinned) return 1;
  //       return b.updatedAt.getTime() - a.updatedAt.getTime();
  //     }),
  //   [filteredConversations],
  // );
  // const recentProjects = useMemo(
  //   () =>
  //     [...projects]
  //       .filter((project) => !project.archived)
  //       .sort((a, b) => {
  //         if (a.pinned && !b.pinned) return -1;
  //         if (!a.pinned && b.pinned) return 1;
  //         return b.createdAt.getTime() - a.createdAt.getTime();
  //       }),
  //   [projects],
  // );
  // const projectRecentConversations = useMemo(
  //   () => visibleConversations.slice(0, 6),
  //   [visibleConversations],
  // );

  // useEffect(() => {
  //   const handleOutsideClick = (event: MouseEvent) => {
  //     if (
  //       attachmentMenuRef.current &&
  //       !attachmentMenuRef.current.contains(event.target as Node)
  //     )
  //       setIsAttachmentMenuOpen(false);
  //     if (
  //       conversationMenuRef.current &&
  //       !conversationMenuRef.current.contains(event.target as Node)
  //     )
  //       setOpenConversationMenuId(null);
  //     if (
  //       projectMenuRef.current &&
  //       !projectMenuRef.current.contains(event.target as Node)
  //     )
  //       setIsProjectMenuOpen(false);
  //     if (
  //       projectActionMenuRef.current &&
  //       !projectActionMenuRef.current.contains(event.target as Node)
  //     )
  //       setOpenProjectActionMenuId(null);
  //     if (
  //       workspaceMenuRef.current &&
  //       !workspaceMenuRef.current.contains(event.target as Node)
  //     )
  //       setIsWorkspaceMenuOpen(false);
  //   };
  //   document.addEventListener("mousedown", handleOutsideClick);
  //   return () => document.removeEventListener("mousedown", handleOutsideClick);
  // }, []);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = isCreateProjectModalOpen
      ? "hidden"
      : previousHtmlOverflow;
    document.body.style.overflow = isCreateProjectModalOpen
      ? "hidden"
      : previousBodyOverflow;

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isCreateProjectModalOpen]);

  useEffect(() => {
    if (!isCreateProjectModalOpen) return;
    const timeoutId = window.setTimeout(
      () => projectNameInputRef.current?.focus(),
      30,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isCreateProjectModalOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setAttachedFiles((current) => [
      ...current,
      ...Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    ]);
    event.target.value = "";
  };

  const send_message = async () => {
    let mesg = {
      text: inputMessage,
      user: get_user()?._id,
    };
    if (activeConversation) {
      mesg.conversation = activeConversation?._id;
    }
    if (selectedProject) {
      mesg.project = selectedProject?._id;
    }

    let res = await post_request(`$AGENCY/new_message`, mesg);

    if (res.ok) {
      if (res.data.conversation) {
        let convo = res.data.conversation;
        setConversations((prev) => [convo, ...prev]);
        set_active_conversation(convo);
      }
      set_recent_message(res.data.message);

      setInputMessage("");
      emitter.emit("new_message", res.data.message);
    }
  };

  const start_new_chat = () => {
    set_active_conversation(null);
  };

  const {
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
  } = useProjectActions({
    newProjectClient,
    newProjectDescription,
    newProjectManager,
    newProjectName,
    newProjectService,
    newProjectTeam,
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
  });

  const {
    handleArchiveConversation,
    handleClearActiveChat,
    handleDeleteConversation,
    handlePinConversation,
    handleRenameConversation,
    handleShareConversation,
    startNewChat,
  } = useConversationActions({
    activeConversation,
    activeConversationId,
    attachedFiles,
    inputMessage,
    setActiveConversationId,
    setAttachedFiles,
    setConversations,
    setInputMessage,
    setIsAttachmentMenuOpen,
    setIsTyping,
    setIsWorkspaceMenuOpen,
    setOpenConversationMenuId,
  });

  return (
    <section className="relative h-[calc(100vh-81px)] overflow-hidden bg-gradient-to-br from-slate-950 via-[#0d1f3a] to-slate-950 text-white">
      {isCreateProjectModalOpen && (
        <CreateProjectModal
          onClose={closeCreateProjectModal}
          onCreateProject={handleCreateProject}
          projectNameInputRef={projectNameInputRef}
        />
      )}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-9rem] top-12 h-80 w-80 rounded-full bg-[#d4af37]/[0.08] blur-3xl" />
        <div className="absolute right-[-5rem] top-0 h-[28rem] w-[28rem] rounded-full bg-[#1e5ba8]/[0.14] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-300/[0.06] blur-3xl" />
      </div>

      <div className="relative flex h-full w-full">
        <aside
          className={`chat-scrollbar h-full shrink-0 overflow-y-scroll border-r border-[#d4af37]/25 bg-[#0b1018]/95 shadow-[inset_-1px_0_0_rgba(212,175,55,0.12)] backdrop-blur-xl transition-[width] duration-300 ${isSidebarOpen ? "w-[290px]" : "w-[76px]"}`}
        >
          <div className="border-b border-[#d4af37]/18 px-5 py-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((current) => !current)}
                className="interactive-button rounded-full border border-[#d4af37]/30 bg-[#101827] px-3 py-2 text-sm text-[#f2e7bb] shadow-[0_10px_30px_rgba(0,0,0,0.24)] hover:border-[#d4af37]/50 hover:bg-[#13233f]"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={start_new_chat}
              className={`interactive-button flex w-full items-center rounded-2xl border border-[#d4af37]/35 bg-[linear-gradient(180deg,rgba(18,31,52,0.95),rgba(10,15,24,0.92))] py-3.5 text-left text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] hover:border-[#d4af37]/55 hover:bg-[linear-gradient(180deg,rgba(22,39,66,0.96),rgba(10,15,24,0.94))] ${isSidebarOpen ? "gap-3 px-4" : "justify-center px-0"}`}
            >
              <MessageSquarePlus className="h-5 w-5 text-[#d4af37]" />
              {isSidebarOpen && <span className="font-medium">New chat</span>}
            </button>
            {isSidebarOpen ? (
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d4af37]/65" />
                <input
                  type="text"
                  value={conversationSearch}
                  onChange={(event) =>
                    setConversationSearch(event.target.value)
                  }
                  placeholder="Search chats"
                  className="interactive-input w-full rounded-2xl border border-[#d4af37]/28 bg-[#0f1726]/90 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#c5c9d3]/46 focus:border-[#d4af37]/55 focus:ring-0"
                />
              </div>
            ) : (
              <button
                type="button"
                aria-label="Search chats"
                className="interactive-button mt-4 flex w-full items-center justify-center rounded-2xl border border-[#d4af37]/28 bg-[#0f1726]/90 py-3.5 text-[#d4af37]/78 hover:border-[#d4af37]/48 hover:bg-[#13233f]"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 px-4 py-5">
            {isSidebarOpen && (
              <div className="relative mb-5" ref={projectMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProjectMenuOpen((current) => !current)}
                  className="interactive-button flex w-full items-center justify-between rounded-xl border border-white/8 bg-transparent px-3 py-2.5 text-left text-white/88 hover:bg-white/[0.04]"
                >
                  <span className="text-sm font-medium">Project</span>
                  <ChevronDown
                    className={`h-4 w-4 text-white/55 transition-transform ${isProjectMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProjectMenuOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 rounded-2xl border border-[#d4af37]/26 bg-[#0b111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                    <button
                      type="button"
                      onClick={openCreateProjectModal}
                      className="interactive-button flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-white hover:bg-[#162235]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">✨</span>
                        <span className="text-sm font-medium">
                          Create new project
                        </span>
                      </span>
                      <Plus className="h-4 w-4 text-[#d4af37]" />
                    </button>
                    <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/60">
                      Recent projects
                    </div>
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className={`group relative rounded-xl ${selectedProject?._id === project._id ? "bg-[#162235]" : "hover:bg-[#162235]"}`}
                      >
                        <button
                          type="button"
                          onClick={() => handle_select_project(project)}
                          className={`interactive-button flex w-full items-center justify-between rounded-xl px-3 py-3 pr-12 text-left ${selectedProject?._id === project._id ? "text-white" : "text-white/88"}`}
                        >
                          <span className="text-sm font-medium">
                            {project.pinned ? "📌 " : ""}
                            {project.title}
                          </span>
                        </button>

                        <div
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          ref={
                            openProjectActionMenuId === project._id
                              ? projectActionMenuRef
                              : undefined
                          }
                        >
                          <button
                            type="button"
                            aria-label={`Project actions for ${project.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenProjectActionMenuId((current) =>
                                current === project._id ? null : project._id,
                              );
                            }}
                            className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/24 bg-[#101827]/75 text-[#f6edd0] transition ${openProjectActionMenuId === project._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openProjectActionMenuId === project._id && (
                            <div className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-[#d4af37]/26 bg-[#0b111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                              <ConversationMenuItem
                                emoji="🔗"
                                label="Share"
                                onClick={() => handleShareProject(project)}
                              />
                              <ConversationMenuItem
                                emoji="✏️"
                                label="Rename"
                                onClick={() => handleRenameProject(project)}
                              />
                              <ConversationMenuItem
                                emoji={project.pinned ? "📍" : "📌"}
                                label={
                                  project.pinned
                                    ? "Unpin project"
                                    : "Pin project"
                                }
                                onClick={() => handlePinProject(project._id)}
                              />
                              <ConversationMenuItem
                                emoji="🗂️"
                                label="Archive"
                                onClick={() =>
                                  handleArchiveProject(project._id)
                                }
                              />
                              <ConversationMenuItem
                                emoji="🗑️"
                                label="Delete"
                                danger
                                onClick={() => handleDeleteProject(project._id)}
                              />
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
              <div className="mb-5 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/70">
                Recents
              </div>
            )}
            {isSidebarOpen && (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const isActive = conversation._id === activeConversation?._id;
                  return (
                    <div
                      key={conversation._id}
                      className={`group relative rounded-2xl ${isActive ? "border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(18,23,34,0.86))] shadow-[0_18px_40px_rgba(0,0,0,0.2)]" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          set_active_conversation(conversation);
                          setIsAttachmentMenuOpen(false);
                          setOpenConversationMenuId(null);
                        }}
                        className={`interactive-button flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 pr-12 text-left ${isActive ? "" : "hover:bg-white/[0.04]"}`}
                      >
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]/70" />
                        {isSidebarOpen && (
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white/90">
                              {conversation.pinned ? "📌 " : ""}
                              {conversation.title}
                            </p>
                            <p className="mt-1 text-xs text-[#d8dbe3]/42">
                              {new Date(
                                conversation?.updated || conversation?.created,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </button>

                      {isSidebarOpen && (
                        <div
                          className="absolute right-2 top-2"
                          ref={
                            openConversationMenuId === conversation.id
                              ? conversationMenuRef
                              : undefined
                          }
                        >
                          <button
                            type="button"
                            aria-label="Conversation options"
                            onClick={() =>
                              setOpenConversationMenuId((current) =>
                                current === conversation._id
                                  ? null
                                  : conversation._id,
                              )
                            }
                            className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full text-[#f2e7bb]/80 ${openConversationMenuId === conversation._id ? "border border-[#d4af37]/28 bg-[#162235]" : "opacity-0 group-hover:opacity-100 hover:bg-[#162235]"}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openConversationMenuId === conversation._id && (
                            <div className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-[#d4af37]/26 bg-[#0b111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                              <ConversationMenuItem
                                emoji="🔗"
                                label="Share"
                                onClick={() =>
                                  handleShareConversation(conversation)
                                }
                              />
                              <ConversationMenuItem
                                emoji="✏️"
                                label="Rename"
                                onClick={() =>
                                  handleRenameConversation(conversation)
                                }
                              />
                              <ConversationMenuItem
                                emoji={conversation.pinned ? "📍" : "📌"}
                                label={
                                  conversation.pinned
                                    ? "Unpin chat"
                                    : "Pin chat"
                                }
                                onClick={() =>
                                  handlePinConversation(conversation._id)
                                }
                              />
                              <ConversationMenuItem
                                emoji="🗂️"
                                label="Archive"
                                onClick={() =>
                                  handleArchiveConversation(conversation._id)
                                }
                              />
                              <ConversationMenuItem
                                emoji="🗑️"
                                label="Delete"
                                danger
                                onClick={() =>
                                  handleDeleteConversation(conversation._id)
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isSidebarOpen && conversations.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#d4af37]/26 bg-[#0f1726]/70 px-4 py-6 text-sm text-[#d8dbe3]/48">
                    No conversations match that search yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(30,91,168,0.18),transparent_28%),linear-gradient(180deg,#11161f_0%,#0c1118_100%)]">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
                onRenameConversation={handleRenameConversation}
                onShareConversation={handleShareConversation}
                onStartNewChat={startNewChat}
                onToggleWorkspaceMenu={() =>
                  setIsWorkspaceMenuOpen((current) => !current)
                }
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
                    inputTextClassName="flex-1 bg-transparent px-3 py-3 text-[17px] font-light text-white outline-none placeholder:text-[#d8dbe3]/38"
                    isAttachmentMenuOpen={isAttachmentMenuOpen}
                    isTyping={isTyping}
                    onFileSelect={handleFileSelect}
                    onInputMessageChange={setInputMessage}
                    onSubmit={() => send_message()}
                    setIsAttachmentMenuOpen={setIsAttachmentMenuOpen}
                  />
                }
                onOpenConversation={set_active_conversation}
                onProjectHomeTabChange={setProjectHomeTab}
                projectHomeTab={projectHomeTab}
                selectedProject={selectedProject}
              />
            )}

            {attachedFiles.length > 0 && (
              <div className="px-6 pb-3 lg:px-12">
                <div className="mx-auto flex max-w-[1160px] flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-2xl border border-[#d4af37]/22 bg-[#101827]/80 px-3 py-2 text-white/88"
                    >
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="max-w-[160px] truncate text-sm">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedFiles((current) =>
                            current.filter((item) => item.name !== file.name),
                          )
                        }
                        className="interactive-button rounded-full p-1 hover:bg-[#d4af37]/12"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConversation && (
              <div className="border-t border-[#d4af37]/18 bg-[#0c1118]/95 px-8 pb-8 pt-5 lg:px-16 xl:px-20 backdrop-blur-xl">
                <div className="mx-auto max-w-[1480px]">
                  <ChatComposer
                    attachedFiles={attachedFiles}
                    attachmentMenuRef={attachmentMenuRef}
                    fileInputRef={fileInputRef}
                    imageInputRef={imageInputRef}
                    inputMessage={inputMessage}
                    inputTextClassName="flex-1 bg-transparent px-3 py-3 text-[22px] font-light text-white outline-none placeholder:text-[#d8dbe3]/38"
                    isAttachmentMenuOpen={isAttachmentMenuOpen}
                    isTyping={isTyping}
                    onFileSelect={handleFileSelect}
                    onInputMessageChange={setInputMessage}
                    onSubmit={() => send_message()}
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
