import type { Dispatch, SetStateAction } from "react";

import type { Conversation, UploadedFile } from "./chatPageTypes";
import { getAIResponse } from "./chatPageUtils";

interface UseConversationActionsProps {
  activeConversation: Conversation | null;
  activeConversationId: number | null;
  attachedFiles: UploadedFile[];
  inputMessage: string;
  selectedProjectId: number | null;
  setActiveConversationId: Dispatch<SetStateAction<number | null>>;
  setAttachedFiles: Dispatch<SetStateAction<UploadedFile[]>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  setIsWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<number | null>>;
}

export function useConversationActions({
  activeConversation,
  activeConversationId,
  attachedFiles,
  inputMessage,
  selectedProjectId,
  setActiveConversationId,
  setAttachedFiles,
  setConversations,
  setInputMessage,
  setIsAttachmentMenuOpen,
  setIsTyping,
  setIsWorkspaceMenuOpen,
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

  const sendMessage = (prompt?: string) => {
    const content = (prompt ?? inputMessage).trim();
    if (!content && attachedFiles.length === 0) return;

    const conversationId = activeConversationId ?? Date.now();
    const isNewConversation = activeConversationId === null;
    const newTitle = content ? content.slice(0, 38) + (content.length > 38 ? "..." : "") : "Shared files";
    const userMessage = {
      id: Date.now(),
      content: content || "Shared files",
      sender: "user" as const,
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setConversations((current) => {
      const existingConversation = current.find((conversation) => conversation.id === conversationId);

      if (!existingConversation) {
        return [
          {
            id: conversationId,
            title: newTitle,
            updatedAt: new Date(),
            projectId: selectedProjectId,
            messages: [userMessage],
          },
          ...current,
        ];
      }

      return current
        .map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: conversation.title === "New chat" && content ? newTitle : conversation.title,
                updatedAt: new Date(),
                messages: [...conversation.messages, userMessage],
              }
            : conversation,
        )
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    setActiveConversationId(conversationId);
    setInputMessage("");
    setAttachedFiles([]);
    setIsAttachmentMenuOpen(false);
    setOpenConversationMenuId(null);
    setIsTyping(true);

    window.setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        content: getAIResponse(content, userMessage.files?.length ?? 0),
        sender: "ai" as const,
        timestamp: new Date(),
      };

      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt: new Date(),
                  messages: [...conversation.messages, aiMessage],
                }
              : conversation,
          )
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      );
      setIsTyping(false);
    }, isNewConversation ? 1000 : 1200);
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
