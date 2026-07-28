"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  Archive as ArchiveIcon,
  ChevronDown,
  Clock3,
  Link2,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import ConversationMenuItem from "./ConversationMenuItem";
import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";
import styles from "./ChatPage.module.css";

interface ChatSidebarProps {
  activeConversationId: ChatEntityId | null;
  archivedSidebarConversations: Conversation[];
  conversationMenuRef: RefObject<HTMLDivElement>;
  conversationSearch: string;
  handleArchiveConversation: (conversationId: ChatEntityId, archived?: boolean) => void;
  handleArchiveProject: (projectId: ChatEntityId) => void;
  handleDeleteConversation: (conversationId: ChatEntityId) => void;
  handleDeleteProject: (projectId: ChatEntityId) => void;
  handlePinConversation: (conversationId: ChatEntityId) => void;
  handlePinProject: (projectId: ChatEntityId) => void;
  handleSelectProject: (projectId: ChatEntityId) => void;
  isLoadingChatData: boolean;
  isProjectMenuOpen: boolean;
  isSidebarOpen: boolean;
  onOpenConversationRenameDialog: (conversation: Conversation) => void;
  onOpenConversationShareDialog: (conversation: Conversation) => void;
  onOpenCreateProjectModal: () => void;
  onOpenProjectRenameDialog: (project: Project) => void;
  onOpenProjectShareDialog: (project: Project) => void;
  openConversationMenuId: ChatEntityId | null;
  openProjectActionMenuId: ChatEntityId | null;
  projectActionMenuRef: RefObject<HTMLDivElement>;
  projectMenuRef: RefObject<HTMLDivElement>;
  recentProjects: Project[];
  selectedProjectId: ChatEntityId | null;
  setActiveConversationId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setConversationSearch: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsProjectMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setOpenProjectActionMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setSelectedProjectId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setSidebarConversationView: Dispatch<SetStateAction<"active" | "archived">>;
  sidebarConversationView: "active" | "archived";
  startNewChat: () => void;
  visibleSidebarConversations: Conversation[];
}

export default function ChatSidebar({
  activeConversationId,
  archivedSidebarConversations,
  conversationMenuRef,
  conversationSearch,
  handleArchiveConversation,
  handleArchiveProject,
  handleDeleteConversation,
  handleDeleteProject,
  handlePinConversation,
  handlePinProject,
  handleSelectProject,
  isLoadingChatData,
  isProjectMenuOpen,
  isSidebarOpen,
  onOpenConversationRenameDialog,
  onOpenConversationShareDialog,
  onOpenCreateProjectModal,
  onOpenProjectRenameDialog,
  onOpenProjectShareDialog,
  openConversationMenuId,
  openProjectActionMenuId,
  projectActionMenuRef,
  projectMenuRef,
  recentProjects,
  selectedProjectId,
  setActiveConversationId,
  setConversationSearch,
  setIsAttachmentMenuOpen,
  setIsProjectMenuOpen,
  setIsSidebarOpen,
  setOpenConversationMenuId,
  setOpenProjectActionMenuId,
  setSelectedProjectId,
  setSidebarConversationView,
  sidebarConversationView,
  startNewChat,
  visibleSidebarConversations,
}: ChatSidebarProps) {
  return (
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
        onClick={() => {
          setSidebarConversationView("active");
          startNewChat();
        }}
        className={`${styles.newChat} ${!isSidebarOpen ? styles.newChatCollapsed : ""}`}
      >
        <MessageSquarePlus className="h-5 w-5" />
        {isSidebarOpen && <span>New chat</span>}
      </button>

      {isSidebarOpen ? (
        <div className={styles.searchWrap}>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c5cff]/58" />
          <input
            type="text"
            value={conversationSearch}
            onChange={(event) => setConversationSearch(event.target.value)}
            placeholder={sidebarConversationView === "archived" ? "Search archived" : "Search chats"}
            className={styles.searchInput}
          />
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
              <button
                type="button"
                onClick={onOpenCreateProjectModal}
                className="interactive-button flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left text-white hover:bg-white/[0.06]"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#7c5cff]" />
                  <span className="text-sm font-medium">Create new project</span>
                </span>
                <Plus className="h-4 w-4 text-[#7c5cff]" />
              </button>
              <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b7a6ff]/60">
                Recent projects
              </div>
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className={`group relative rounded-[14px] ${
                    selectedProjectId === project.id
                      ? "border border-[#7c5cff]/18 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                      : "hover:bg-white/[0.045]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectProject(project.id)}
                    className={`interactive-button flex w-full items-center justify-between rounded-[14px] px-3 py-3 pr-12 text-left ${
                      selectedProjectId === project.id ? "text-white" : "text-white/88"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      {project.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#7c5cff]" />}
                      <span className="truncate">{project.name}</span>
                    </span>
                  </button>

                  <div
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    ref={openProjectActionMenuId === project.id ? projectActionMenuRef : undefined}
                  >
                    <button
                      type="button"
                      aria-label={`Project actions for ${project.name}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpenProjectActionMenuId((current) => (current === project.id ? null : project.id));
                      }}
                      className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-black/[0.24] text-[#f6edd0] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:border-[#7c5cff]/28 hover:bg-white/[0.08] ${
                        openProjectActionMenuId === project.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {openProjectActionMenuId === project.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-[18px] border border-white/[0.08] bg-[#0b111a]/96 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                        <ConversationMenuItem
                          icon={<Link2 className="h-4 w-4" />}
                          label="Share"
                          onClick={() => onOpenProjectShareDialog(project)}
                        />
                        <ConversationMenuItem
                          icon={<Pencil className="h-4 w-4" />}
                          label="Rename"
                          onClick={() => onOpenProjectRenameDialog(project)}
                        />
                        <ConversationMenuItem
                          icon={project.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                          label={project.pinned ? "Unpin project" : "Pin project"}
                          onClick={() => handlePinProject(project.id)}
                        />
                        <ConversationMenuItem
                          icon={<ArchiveIcon className="h-4 w-4" />}
                          label="Archive"
                          onClick={() => handleArchiveProject(project.id)}
                        />
                        <ConversationMenuItem
                          icon={<Trash2 className="h-4 w-4" />}
                          label="Delete"
                          danger
                          onClick={() => handleDeleteProject(project.id)}
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

      {isSidebarOpen && (
        <div className="space-y-2">
          {isLoadingChatData && <div className={styles.emptyCard}>Loading conversations...</div>}
          {visibleSidebarConversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            return (
              <div
                key={conversation.id}
                className={`group ${styles.convItem} ${isActive ? styles.convItemActive : ""}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(conversation.projectId);
                    setActiveConversationId(conversation.id);
                    setIsAttachmentMenuOpen(false);
                    setOpenConversationMenuId(null);
                  }}
                  className={styles.convBtn}
                >
                  {sidebarConversationView === "archived" ? (
                    <ArchiveIcon className={styles.convIcon} />
                  ) : (
                    <Clock3 className={styles.convIcon} />
                  )}
                  <div className="min-w-0">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-white/90">
                      {conversation.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#7c5cff]" />}
                      <span className="truncate">{conversation.title}</span>
                    </p>
                    {sidebarConversationView === "archived" && conversation.projectName && (
                      <p className="mt-1 truncate text-xs text-[#b7a6ff]/52">{conversation.projectName}</p>
                    )}
                    <p className="mt-1 text-xs text-[#d8dbe3]/42">{conversation.updatedAt.toLocaleDateString()}</p>
                  </div>
                </button>

                <div
                  className="absolute right-2 top-2"
                  ref={openConversationMenuId === conversation.id ? conversationMenuRef : undefined}
                >
                  <button
                    type="button"
                    aria-label="Conversation options"
                    onClick={() =>
                      setOpenConversationMenuId((current) => (current === conversation.id ? null : conversation.id))
                    }
                    className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full text-[#d8d0ff]/80 ${
                      openConversationMenuId === conversation.id
                        ? "border border-[#7c5cff]/24 bg-white/[0.08]"
                        : "opacity-0 group-hover:opacity-100 hover:bg-white/[0.06]"
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {openConversationMenuId === conversation.id && (
                    <div className="absolute right-0 top-10 z-20 w-48 rounded-[18px] border border-white/[0.08] bg-[#0b111a]/96 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                      <ConversationMenuItem
                        icon={<Link2 className="h-4 w-4" />}
                        label="Share"
                        onClick={() => onOpenConversationShareDialog(conversation)}
                      />
                      <ConversationMenuItem
                        icon={<Pencil className="h-4 w-4" />}
                        label="Rename"
                        onClick={() => onOpenConversationRenameDialog(conversation)}
                      />
                      <ConversationMenuItem
                        icon={conversation.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        label={conversation.pinned ? "Unpin chat" : "Pin chat"}
                        onClick={() => handlePinConversation(conversation.id)}
                      />
                      <ConversationMenuItem
                        icon={<ArchiveIcon className="h-4 w-4" />}
                        label={conversation.archived ? "Unarchive" : "Archive"}
                        onClick={() => handleArchiveConversation(conversation.id, !conversation.archived)}
                      />
                      <ConversationMenuItem
                        icon={<Trash2 className="h-4 w-4" />}
                        label="Delete"
                        danger
                        onClick={() => handleDeleteConversation(conversation.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!isLoadingChatData && visibleSidebarConversations.length === 0 && (
            <div className={styles.emptyCard}>
              {sidebarConversationView === "archived"
                ? "No archived conversations yet."
                : "No conversations match that search yet."}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
