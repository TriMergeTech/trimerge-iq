import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";

import {
  fetchConversations,
  fetchMessages,
  fetchProjects,
  getChatProfile,
} from "./chatApi";
import {
  applyConversationOverrides,
  readStoredProjectNames,
  readStoredProjects,
  writeStoredProjects,
} from "./chatLocalState";
import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";

interface UseChatDataProps {
  activeConversationId: ChatEntityId | null;
  selectedProjectId: ChatEntityId | null;
  setLastChatError: Dispatch<SetStateAction<string>>;
}

export function useChatData({
  activeConversationId,
  selectedProjectId,
  setLastChatError,
}: UseChatDataProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingChatData, setIsLoadingChatData] = useState(true);
  const projectsRef = useRef<Project[]>([]);
  const selectedProjectName = projects.find((project) => project.id === selectedProjectId)?.name;

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
  }, [setLastChatError]);

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
            ...(selectedProjectName ? [selectedProjectName] : []),
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
  }, [selectedProjectName, setLastChatError]);

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
        const { messages, pendingTool } = await fetchMessages(activeConversationId);
        if (isCancelled) return;

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === activeConversationId
              ? {
                  ...conversation,
                  updatedAt: messages[messages.length - 1]?.timestamp ?? conversation.updatedAt,
                  messages,
                  pendingTool: pendingTool === undefined ? conversation.pendingTool : pendingTool,
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
  }, [activeConversationId, conversations, setLastChatError]);

  return {
    conversations,
    isLoadingChatData,
    projects,
    setConversations,
    setProjects,
  };
}
