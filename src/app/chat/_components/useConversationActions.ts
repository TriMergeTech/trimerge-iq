import type { Dispatch, SetStateAction } from "react";

import {
  archiveConversation,
  createConversation,
  createMessage,
  createShareLink,
  deleteConversation,
  extractRfpFromFile,
  fetchProposalGenerationStatus,
  fetchMessages,
  getChatProfile,
  pinConversation,
  renameConversation,
  startProposalGeneration,
} from "./chatApi";
import { persistConversationOverride, rememberGeneratedProposalMessage, rememberStoredProjectName } from "./chatLocalState";
import { getProposalHubUrl, rememberGeneratedProposal } from "../../proposal-hub/_hub/utils/generatedProposalStorage";
import type { ChatEntityId, Conversation, UploadedFile } from "./chatPageTypes";

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

  const handleClearActiveChat = () => {
    if (!activeConversation) return;

    updateConversation(activeConversation.id, (current) => ({
      ...current,
      messages: [],
      updatedAt: new Date(),
    }));
    setIsWorkspaceMenuOpen(false);
  };

  const isRfpFile = (file: UploadedFile) =>
    Boolean(file.file) && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

  const IMPORTANT_RFP_FIELDS = [
    "proposal_id",
    "client_name",
    "proposal_budget",
    "requested_timeline",
    "services",
    "project_scope",
    "scope",
    "requirements",
    "deliverables",
    "submission_deadline",
    "evaluation_criteria",
  ];
  const MAX_RFP_FIELD_LENGTH = 900;
  const MAX_RFP_CONTEXT_LENGTH = 7000;

  const truncateText = (value: string, maxLength: number) =>
    value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;

  const stringifyExtractedValue = (value: unknown) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  };

  const formatExtractedRfpData = (data: Record<string, unknown>) => {
    const entries = Object.entries(data);
    const importantEntries = IMPORTANT_RFP_FIELDS
      .map((field) => entries.find(([key]) => key.toLowerCase() === field))
      .filter((entry): entry is [string, unknown] => Boolean(entry));
    const fallbackEntries = importantEntries.length > 0 ? importantEntries : entries.slice(0, 12);

    return fallbackEntries
      .map(([key, value]) => {
        const formattedValue = truncateText(stringifyExtractedValue(value), MAX_RFP_FIELD_LENGTH);
        return `${key}: ${formattedValue}`;
      })
      .join("\n");
  };

  const formatExtractedRfpContext = (rfpFiles: UploadedFile[]) => {
    const extractedFiles = rfpFiles.filter((file) => file.extractedRfpData);
    if (extractedFiles.length === 0) return "";

    const context = extractedFiles
      .map((file) => {
        const extractedData = formatExtractedRfpData(file.extractedRfpData ?? {});
        return `Uploaded RFP: ${file.name}\nExtracted RFP data:\n${extractedData}`;
      })
      .join("\n\n");

    return truncateText(context, MAX_RFP_CONTEXT_LENGTH);
  };

  const getMergedExtractedRfpData = (rfpFiles: UploadedFile[]) =>
    rfpFiles.reduce<Record<string, unknown>>((mergedData, file) => {
      if (!file.extractedRfpData) return mergedData;
      return {
        ...mergedData,
        ...file.extractedRfpData,
      };
    }, {});

  const shouldGenerateProposalFromRfp = (text: string, rfpFiles: UploadedFile[], pendingTool?: string | null) => {
    if (rfpFiles.length === 0) return false;
    if (pendingTool) return true;

    const normalizedText = text.toLowerCase();
    return (
      normalizedText.includes("proposal") &&
      /\b(create|generate|make|build|draft|prepare|write)\b/.test(normalizedText)
    );
  };

  const updateProposalGenerationMessage = (
    conversationId: ChatEntityId,
    messageId: ChatEntityId,
    content: string,
    generatedProposal: NonNullable<Conversation["messages"][number]["generatedProposal"]>,
  ) => {
    const nextMessage = {
      id: messageId,
      content,
      sender: "ai" as const,
      timestamp: new Date(),
      generatedProposal,
    };

    rememberGeneratedProposalMessage(conversationId, nextMessage);
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      updatedAt: new Date(),
      messages: conversation.messages.map((message) =>
        message.id === messageId
          ? nextMessage
          : message,
      ),
    }));
  };

  const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const runProposalGeneration = async (
    conversationId: ChatEntityId,
    filesWithExtractedRfpData: UploadedFile[],
    promptText: string,
  ) => {
    const proposalMetadata = {
      ...getMergedExtractedRfpData(filesWithExtractedRfpData),
      chat_request: promptText || "Create a proposal from the uploaded RFP.",
    };
    const progressMessageId = `proposal-generation-${Date.now()}`;

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      updatedAt: new Date(),
      messages: [
        ...conversation.messages,
        {
          id: progressMessageId,
          content: "Starting proposal generation from the uploaded RFP...",
          sender: "ai" as const,
          timestamp: new Date(),
          generatedProposal: {
            status: "queued",
            progress: 5,
            title: "Proposal generation",
          },
        },
      ],
    }));
    rememberGeneratedProposalMessage(conversationId, {
      id: progressMessageId,
      content: "Starting proposal generation from the uploaded RFP...",
      sender: "ai",
      timestamp: new Date(),
      generatedProposal: {
        status: "queued",
        progress: 5,
        title: "Proposal generation",
      },
    });

    const callbackId = await startProposalGeneration(proposalMetadata);
    sessionStorage.setItem("proposal_callback_id", callbackId);

    updateProposalGenerationMessage(conversationId, progressMessageId, "Proposal generation started. I will update this card as sections are processed.", {
      callbackId,
      progress: 10,
      status: "running",
      title: "Proposal generation",
    });

    for (let attempt = 0; attempt < 180; attempt += 1) {
      await wait(2000);
      const status = await fetchProposalGenerationStatus(callbackId);
      const progress = typeof status.progress === "number" ? status.progress : undefined;
      const statusMessage = status.message || "Generating proposal...";

      if (status.status === "completed" && status.proposal) {
        rememberGeneratedProposal(status.proposal);
        const proposalId = status.proposal._id ?? status.proposal.id ?? "";
        const proposalTitle = status.proposal.opportunity_title ?? status.proposal.title ?? "Generated proposal";

        updateProposalGenerationMessage(conversationId, progressMessageId, "Your proposal is ready in Proposal Hub.", {
          callbackId,
          id: proposalId,
          progress: 100,
          status: "completed",
          title: proposalTitle,
          url: getProposalHubUrl(status.proposal),
        });
        return;
      }

      if (status.status === "failed") {
        updateProposalGenerationMessage(conversationId, progressMessageId, statusMessage || "Proposal generation failed.", {
          callbackId,
          progress,
          status: "failed",
          title: "Proposal generation",
        });
        return;
      }

      updateProposalGenerationMessage(conversationId, progressMessageId, statusMessage, {
        callbackId,
        progress,
        status: status.status ?? "running",
        title: "Proposal generation",
      });
    }

    updateProposalGenerationMessage(conversationId, progressMessageId, "Proposal generation is still running. Check Proposal Hub shortly.", {
      callbackId,
      progress: 95,
      status: "running",
      title: "Proposal generation",
    });
  };

  const sendMessage = async (prompt?: string) => {
    const content = (prompt ?? inputMessage).trim();
    if (!content && attachedFiles.length === 0) return;

    const hasRfpAttachment = attachedFiles.some(isRfpFile);
    const fallbackConversationId = activeConversationId ?? Date.now();
    const fallbackMessageContent = hasRfpAttachment ? "Uploaded RFP" : "Shared files";
    const newTitle = content ? content.slice(0, 38) + (content.length > 38 ? "..." : "") : fallbackMessageContent;
    const timestamp = new Date();
    const userMessage = {
      id: Date.now(),
      content: content || fallbackMessageContent,
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
      const filesWithExtractedRfpData = await Promise.all(
        (userMessage.files ?? []).map(async (file) => {
          if (!isRfpFile(file) || !file.file) return file;
          if (file.extractedRfpData) return file;
          return {
            ...file,
            extractedRfpData: await extractRfpFromFile(file.file),
            extractionStatus: "ready" as const,
          };
        }),
      );
      const extractedRfpContext = formatExtractedRfpContext(filesWithExtractedRfpData);
      if (extractedRfpContext) {
        console.log("Hidden RFP context sent to chat backend:", extractedRfpContext);
      }
      const messageText = extractedRfpContext
        ? `${content || "Please create a proposal from the uploaded RFP."}\n\n${extractedRfpContext}`
        : userMessage.content;
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
      const shouldGenerateProposal = shouldGenerateProposalFromRfp(
        content,
        filesWithExtractedRfpData.filter((file) => Boolean(file.extractedRfpData)),
        resolvedConversation.pendingTool,
      );

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
        text: messageText,
        attachment: filesWithExtractedRfpData,
        user: profile,
        ...(resolvedConversation.pendingTool ? { pending_tool: resolvedConversation.pendingTool } : {}),
      });

      const nextPendingTool = createdMessage?.pending_tool ?? null;

      const { messages: remoteMessages, pendingTool: fetchedPendingTool } = await fetchMessages(conversationId);
      const resolvedPendingTool = fetchedPendingTool === undefined ? nextPendingTool : fetchedPendingTool;

      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt: new Date(),
                  recentMessage: userMessage.content,
                  messages: remoteMessages.length > 0 ? remoteMessages : conversation.messages,
                  pendingTool: resolvedPendingTool,
                }
              : conversation,
          )
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      );

      if (shouldGenerateProposal) {
        await runProposalGeneration(conversationId, filesWithExtractedRfpData, content);
      }
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
