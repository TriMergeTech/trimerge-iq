import type { Dispatch, SetStateAction } from "react";

import { createConversation, createMessage, fetchMessages, getChatProfile, rememberMessageSender } from "./chatApi";
import type { Conversation, UploadedFile } from "./chatPageTypes";

interface UseConversationActionsProps {
  activeConversation: Conversation | null;
  activeConversationId: number | null;
  attachedFiles: UploadedFile[];
  inputMessage: string;
  selectedProjectId: number | null;
  selectedProjectName?: string;
  setActiveConversationId: Dispatch<SetStateAction<number | null>>;
  setAttachedFiles: Dispatch<SetStateAction<UploadedFile[]>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  setIsWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
  setLastChatError: Dispatch<SetStateAction<string>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<number | null>>;
}

export function useConversationActions({
  activeConversation,
  activeConversationId,
  attachedFiles,
  inputMessage,
  selectedProjectId,
  selectedProjectName,
  setActiveConversationId,
  setAttachedFiles,
  setConversations,
  setInputMessage,
  setIsAttachmentMenuOpen,
  setIsTyping,
  setIsWorkspaceMenuOpen,
  setLastChatError,
  setOpenConversationMenuId,
}: UseConversationActionsProps) {
  const updateConversation = (
    conversationId: number,
    updater: (conversation: Conversation) => Conversation | null,
  ) => {
    setConversations((current) =>
      current
        .map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation))
        .filter(Boolean) as Conversation[],
    );
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setInputMessage("");
    setAttachedFiles([]);
    setIsTyping(false);
    setIsAttachmentMenuOpen(false);
    setOpenConversationMenuId(null);
  };

  const handleRenameConversation = (conversation: Conversation) => {
    const nextTitle = window.prompt("Rename conversation", conversation.title)?.trim();
    if (!nextTitle) return;

    updateConversation(conversation.id, (current) => ({
      ...current,
      title: nextTitle,
      updatedAt: new Date(),
    }));
    setOpenConversationMenuId(null);
  };

  const handleDeleteConversation = (conversationId: number) => {
    updateConversation(conversationId, () => null);
    if (activeConversationId === conversationId) setActiveConversationId(null);
    setOpenConversationMenuId(null);
  };

  const handlePinConversation = (conversationId: number) => {
    updateConversation(conversationId, (current) => ({
      ...current,
      pinned: !current.pinned,
      updatedAt: new Date(),
    }));
    setOpenConversationMenuId(null);
  };

  const handleArchiveConversation = (conversationId: number) => {
    updateConversation(conversationId, (current) => ({
      ...current,
      archived: true,
      updatedAt: new Date(),
    }));
    if (activeConversationId === conversationId) setActiveConversationId(null);
    setOpenConversationMenuId(null);
  };

  const handleShareConversation = async (conversation: Conversation) => {
    const shareLabel = `TriMerge chat: ${conversation.title}`;

    try {
      await navigator.clipboard.writeText(shareLabel);
    } catch {
      window.prompt("Copy this conversation label", shareLabel);
    }

    setOpenConversationMenuId(null);
  };

  const handleClearActiveChat = () => {
    if (!activeConversation) return;

    updateConversation(activeConversation.id, (current) => ({
      ...current,
      messages: [],
      updatedAt: new Date(),
    }));
    setIsWorkspaceMenuOpen(false);
  };

  const sendMessage = async (prompt?: string) => {
    const content = (prompt ?? inputMessage).trim();
    if (!content && attachedFiles.length === 0) return;

    const fallbackConversationId = activeConversationId ?? Date.now();
    const newTitle = content ? content.slice(0, 38) + (content.length > 38 ? "..." : "") : "Shared files";
    const timestamp = new Date();
    const userMessage = {
      id: Date.now(),
      content: content || "Shared files",
      sender: "user" as const,
      timestamp,
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setConversations((current) => {
      const existingConversation = current.find((conversation) => conversation.id === fallbackConversationId);

      if (!existingConversation) {
        return [
          {
            id: fallbackConversationId,
            title: newTitle,
            updatedAt: timestamp,
            projectId: selectedProjectId,
            recentMessage: userMessage.content,
            messages: [userMessage],
          },
          ...current,
        ];
      }

      return current
        .map((conversation) =>
          conversation.id === fallbackConversationId
            ? {
                ...conversation,
                title: conversation.title === "New chat" && content ? newTitle : conversation.title,
                updatedAt: timestamp,
                recentMessage: userMessage.content,
                messages: [...conversation.messages, userMessage],
              }
            : conversation,
        )
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    setActiveConversationId(fallbackConversationId);
    setInputMessage("");
    setAttachedFiles([]);
    setIsAttachmentMenuOpen(false);
    setOpenConversationMenuId(null);
    setIsTyping(true);
    setLastChatError("");

    try {
      const profile = getChatProfile();
      const resolvedConversation =
        activeConversationId === null
          ? await createConversation({
              title: newTitle,
              profile,
              memory: activeConversation?.memory ?? "initial context",
              project: selectedProjectName ?? activeConversation?.projectName ?? undefined,
              recent_message: userMessage.content,
            })
          : activeConversation;

      if (!resolvedConversation) {
        throw new Error("Unable to resolve the active conversation.");
      }

      const conversationId = resolvedConversation.id;

      setConversations((current) => {
        let foundFallbackConversation = false;

        const nextConversations = current
          .map((conversation) => {
            if (conversation.id !== fallbackConversationId) return conversation;

            foundFallbackConversation = true;
            return {
              ...conversation,
              ...resolvedConversation,
              projectId: conversation.projectId,
              messages: conversation.messages,
              updatedAt: timestamp,
              recentMessage: userMessage.content,
            };
          });

        if (!foundFallbackConversation) {
          nextConversations.unshift({
            ...resolvedConversation,
            projectId: selectedProjectId,
            messages: [userMessage],
            updatedAt: timestamp,
            recentMessage: userMessage.content,
          });
        }

        return nextConversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      });
      setActiveConversationId(conversationId);

      const createdMessage = await createMessage({
        conversation: conversationId,
        text: userMessage.content,
        attachment: userMessage.files ?? [],
      });

      if (createdMessage?.id) {
        rememberMessageSender(conversationId, createdMessage.id, "user");
      }

      const remoteMessages = await fetchMessages(conversationId);

      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt: new Date(),
                  recentMessage: userMessage.content,
                  messages: remoteMessages.length > 0 ? remoteMessages : conversation.messages,
                }
              : conversation,
          )
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      );
    } catch (error) {
      setLastChatError(error instanceof Error ? error.message : "Unable to send the message right now.");
    } finally {
      setIsTyping(false);
    }
  };

  return {
    handleArchiveConversation,
    handleClearActiveChat,
    handleDeleteConversation,
    handlePinConversation,
    handleRenameConversation,
    handleShareConversation,
    sendMessage,
    startNewChat,
  };
}
