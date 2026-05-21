import type { Dispatch, SetStateAction } from "react";

import {
  archiveConversation,
  createConversation,
  createMessage,
  createShareLink,
  deleteConversation,
  fetchMessages,
  getChatProfile,
  pinConversation,
  rememberMessageSender,
  renameConversation,
} from "./chatApi";
import { persistConversationOverride, rememberStoredProjectName } from "./chatLocalState";
import { ENDPOINT_CREATION_TOOL_NAME, getAIResponse, isEndpointCreationRequest } from "./chatPageUtils";
import type { ChatEntityId, Conversation, Message, UploadedFile } from "./chatPageTypes";

interface UseConversationActionsProps {
  activeConversation: Conversation | null;
  activeConversationId: ChatEntityId | null;
  attachedFiles: UploadedFile[];
  inputMessage: string;
  selectedProjectId: ChatEntityId | null;
  selectedProjectName?: string;
  setActiveConversationId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setAttachedFiles: Dispatch<SetStateAction<UploadedFile[]>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  setIsWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
  setLastChatError: Dispatch<SetStateAction<string>>;
  setOpenConversationMenuId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setSelectedProjectId: Dispatch<SetStateAction<ChatEntityId | null>>;
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
  setSelectedProjectId,
}: UseConversationActionsProps) {
  const appendMessageIfMissing = (messages: Message[], nextMessage: Message | null) => {
    if (!nextMessage) return messages;
    if (messages.some((message) => String(message.id) === String(nextMessage.id))) return messages;
    return [...messages, nextMessage];
  };

  const updateConversation = (
    conversationId: ChatEntityId,
    updater: (conversation: Conversation) => Conversation | null,
  ) => {
    setConversations((current) =>
      current
        .map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation))
        .filter(Boolean) as Conversation[],
    );
  };

  const startNewChat = () => {
    setSelectedProjectId(null);
    setActiveConversationId(null);
    setInputMessage("");
    setAttachedFiles([]);
    setIsTyping(false);
    setIsAttachmentMenuOpen(false);
    setOpenConversationMenuId(null);
  };

  const handleRenameConversation = async (conversation: Conversation) => {
    const nextTitle = window.prompt("Rename conversation", conversation.title)?.trim();
    if (!nextTitle) return;

    const previousTitle = conversation.title;
    updateConversation(conversation.id, (current) => ({
      ...current,
      title: nextTitle,
      updatedAt: new Date(),
    }));
    setOpenConversationMenuId(null);

    try {
      await renameConversation(conversation.id, nextTitle);
      persistConversationOverride(conversation.id, { title: nextTitle });
    } catch (error) {
      updateConversation(conversation.id, (current) => ({
        ...current,
        title: previousTitle,
        updatedAt: new Date(),
      }));
      setLastChatError(error instanceof Error ? error.message : "Unable to rename this conversation.");
    }
  };

  const handleDeleteConversation = async (conversationId: ChatEntityId) => {
    const previousActiveConversationId = activeConversationId;
    let deletedConversation: Conversation | null = null;

    setConversations((current) => {
      deletedConversation = current.find((conversation) => conversation.id === conversationId) ?? null;
      return current.filter((conversation) => conversation.id !== conversationId);
    });
    if (activeConversationId === conversationId) setActiveConversationId(null);
    setOpenConversationMenuId(null);

    try {
      await deleteConversation(conversationId, false);
      persistConversationOverride(conversationId, { deleted: true });
    } catch (error) {
      if (deletedConversation) {
        setConversations((current) => [deletedConversation as Conversation, ...current].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      }
      setActiveConversationId(previousActiveConversationId);
      setLastChatError(error instanceof Error ? error.message : "Unable to delete this conversation.");
    }
  };

  const handlePinConversation = async (conversationId: ChatEntityId) => {
    let nextPinned = false;
    updateConversation(conversationId, (current) => {
      const pinned = !current.pinned;
      nextPinned = pinned;

      return {
        ...current,
        pinned,
        updatedAt: new Date(),
      };
    });
    setOpenConversationMenuId(null);

    try {
      await pinConversation(conversationId, nextPinned);
      persistConversationOverride(conversationId, { pinned: nextPinned });
    } catch (error) {
      updateConversation(conversationId, (current) => ({
        ...current,
        pinned: !nextPinned,
        updatedAt: new Date(),
      }));
      setLastChatError(error instanceof Error ? error.message : "Unable to update the pin status.");
    }
  };

  const handleArchiveConversation = async (conversationId: ChatEntityId, archived = true) => {
    const previousActiveConversationId = activeConversationId;

    updateConversation(conversationId, (current) => ({
      ...current,
      archived,
      updatedAt: new Date(),
    }));
    if (archived && activeConversationId === conversationId) setActiveConversationId(null);
    setOpenConversationMenuId(null);

    try {
      await archiveConversation(conversationId, archived);
    } catch (error) {
      updateConversation(conversationId, (current) => ({
        ...current,
        archived: !archived,
        updatedAt: new Date(),
      }));
      if (archived) setActiveConversationId(previousActiveConversationId);
      setLastChatError(error instanceof Error ? error.message : "Unable to archive this conversation.");
    }
  };

  const handleShareConversation = async (conversation: Conversation) => {
    let shareLabel = "";

    try {
      shareLabel = await createShareLink(conversation.id);
      if (!shareLabel) throw new Error("Share link was not returned by the chat API.");
      await navigator.clipboard.writeText(shareLabel);
      window.prompt("Share link copied. You can also copy it here:", shareLabel);
    } catch (error) {
      if (shareLabel) {
        window.prompt("Copy this share link", shareLabel);
      } else {
        setLastChatError(error instanceof Error ? error.message : "Unable to create a share link.");
      }
    }

    setOpenConversationMenuId(null);
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
    if (selectedProjectName) rememberStoredProjectName(selectedProjectName);

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

      const isEndpointRequest = isEndpointCreationRequest(userMessage.content);
      const createdMessage = await createMessage({
        conversation: conversationId,
        text: userMessage.content,
        tool: isEndpointRequest ? ENDPOINT_CREATION_TOOL_NAME : undefined,
        attachment: userMessage.files ?? [],
      });

      if (createdMessage.payload?.id) {
        rememberMessageSender(conversationId, createdMessage.payload.id, "user");
      }

      if (createdMessage.errorMessage) {
        const fallbackAiMessage = {
          id: `${conversationId}-fallback-${Date.now()}`,
          content: getAIResponse(userMessage.content, userMessage.files?.length ?? 0),
          sender: "ai" as const,
          timestamp: new Date(),
          toolResponse: isEndpointRequest
            ? {
                id: "endpoint-creation-tool",
                name: ENDPOINT_CREATION_TOOL_NAME,
              }
            : undefined,
        };

        setConversations((current) =>
          current
            .map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    updatedAt: fallbackAiMessage.timestamp,
                    recentMessage: fallbackAiMessage.content,
                    messages: appendMessageIfMissing(conversation.messages, fallbackAiMessage),
                  }
                : conversation,
            )
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
        );
        setLastChatError(`Chat backend is unavailable: ${createdMessage.errorMessage}`);
        return;
      }

      if (createdMessage.aiMessage) {
        const aiMessage =
          isEndpointRequest && !createdMessage.aiMessage.toolResponse
            ? {
                ...createdMessage.aiMessage,
                toolResponse: {
                  id: "endpoint-creation-tool",
                  name: ENDPOINT_CREATION_TOOL_NAME,
                },
              }
            : createdMessage.aiMessage;

        setConversations((current) =>
          current
            .map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    updatedAt: aiMessage.timestamp,
                    recentMessage: aiMessage.content,
                    messages: appendMessageIfMissing(conversation.messages, aiMessage),
                  }
                : conversation,
            )
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
        );

        return;
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
    handleDeleteConversation,
    handlePinConversation,
    handleRenameConversation,
    handleShareConversation,
    sendMessage,
    startNewChat,
  };
}
