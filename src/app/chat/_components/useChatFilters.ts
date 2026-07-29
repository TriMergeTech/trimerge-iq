import { useMemo } from "react";

import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";

interface UseChatFiltersProps {
  activeConversationId: ChatEntityId | null;
  conversationSearch: string;
  conversations: Conversation[];
  projects: Project[];
  selectedProjectId: ChatEntityId | null;
  sidebarConversationView: "active" | "archived";
}

const sortByPinnedAndUpdated = (conversations: Conversation[]) =>
  [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

const matchesSearch = (conversation: Conversation, search: string) =>
  conversation.title.toLowerCase().includes(search.toLowerCase());

export function useChatFilters({
  activeConversationId,
  conversationSearch,
  conversations,
  projects,
  selectedProjectId,
  sidebarConversationView,
}: UseChatFiltersProps) {
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const activeSidebarConversations = useMemo(() => {
    const base = conversations.filter((conversation) => !conversation.archived && conversation.projectId === null);
    if (!conversationSearch.trim()) return base;
    return base.filter((conversation) => matchesSearch(conversation, conversationSearch));
  }, [conversationSearch, conversations]);

  const archivedSidebarConversations = useMemo(() => {
    const base = conversations.filter((conversation) => conversation.archived);
    if (!conversationSearch.trim()) return base;
    return base.filter((conversation) => matchesSearch(conversation, conversationSearch));
  }, [conversationSearch, conversations]);

  const sidebarConversations =
    sidebarConversationView === "archived" ? archivedSidebarConversations : activeSidebarConversations;

  const visibleSidebarConversations = useMemo(
    () => sortByPinnedAndUpdated(sidebarConversations),
    [sidebarConversations],
  );

  const visibleConversations = useMemo(() => {
    const base = conversations.filter(
      (conversation) => !conversation.archived && conversation.projectId === selectedProjectId,
    );
    const filtered = conversationSearch.trim()
      ? base.filter((conversation) => matchesSearch(conversation, conversationSearch))
      : base;

    return sortByPinnedAndUpdated(filtered);
  }, [conversationSearch, conversations, selectedProjectId]);

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

  const projectRecentConversations = useMemo(
    () => visibleConversations.slice(0, 6),
    [visibleConversations],
  );

  return {
    activeConversation,
    archivedSidebarConversations,
    projectRecentConversations,
    recentProjects,
    selectedProject,
    visibleConversations,
    visibleSidebarConversations,
  };
}
