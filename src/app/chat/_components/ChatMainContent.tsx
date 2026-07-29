"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";

import AttachmentStatusList from "./AttachmentStatusList";
import ChatComposer from "./ChatComposer";
import styles from "./ChatPage.module.css";
import ConversationView from "./ConversationView";
import ProjectHomePanel from "./ProjectHomePanel";
import type { ChatEntityId, Conversation, Project, UploadedFile } from "./chatPageTypes";
import { formatFileSize } from "./chatPageUtils";

interface ChatMainContentProps {
  activeConversation: Conversation | null;
  attachedFiles: UploadedFile[];
  attachmentMenuRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  handleArchiveConversation: (conversationId: ChatEntityId, archived?: boolean) => void;
  handleClearActiveChat: () => void;
  handleDeleteConversation: (conversationId: ChatEntityId) => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePinConversation: (conversationId: ChatEntityId) => void;
  imageInputRef: RefObject<HTMLInputElement>;
  inputMessage: string;
  isAttachmentMenuOpen: boolean;
  isTyping: boolean;
  isWorkspaceMenuOpen: boolean;
  lastChatError: string;
  onOpenConversationRenameDialog: (conversation: Conversation) => void;
  onOpenConversationShareDialog: (conversation: Conversation) => void;
  onProjectHomeTabChange: Dispatch<SetStateAction<"chats" | "sources">>;
  onRemoveFile: (file: UploadedFile) => void;
  projectHomeTab: "chats" | "sources";
  projectRecentConversations: Conversation[];
  selectedProject: Project | null;
  setActiveConversationId: Dispatch<SetStateAction<ChatEntityId | null>>;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setIsAttachmentMenuOpen: Dispatch<SetStateAction<boolean>>;
  setIsWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
  sendMessage: () => void | Promise<void>;
  startNewChat: () => void;
  workspaceMenuRef: RefObject<HTMLDivElement>;
}

export default function ChatMainContent({
  activeConversation,
  attachedFiles,
  attachmentMenuRef,
  fileInputRef,
  handleArchiveConversation,
  handleClearActiveChat,
  handleDeleteConversation,
  handleFileSelect,
  handlePinConversation,
  imageInputRef,
  inputMessage,
  isAttachmentMenuOpen,
  isTyping,
  isWorkspaceMenuOpen,
  lastChatError,
  onOpenConversationRenameDialog,
  onOpenConversationShareDialog,
  onProjectHomeTabChange,
  onRemoveFile,
  projectHomeTab,
  projectRecentConversations,
  selectedProject,
  setActiveConversationId,
  setInputMessage,
  setIsAttachmentMenuOpen,
  setIsWorkspaceMenuOpen,
  sendMessage,
  startNewChat,
  workspaceMenuRef,
}: ChatMainContentProps) {
  const composer = (
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
  );

  return (
    <div className={styles.main}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {lastChatError && (
          <div className={styles.alertWrap}>
            <div className={styles.alertBanner}>{lastChatError}</div>
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
            onRenameConversation={onOpenConversationRenameDialog}
            onShareConversation={onOpenConversationShareDialog}
            onStartNewChat={startNewChat}
            onToggleWorkspaceMenu={() => setIsWorkspaceMenuOpen((current) => !current)}
            selectedProjectName={selectedProject?.name}
            workspaceMenuRef={workspaceMenuRef}
          />
        ) : (
          <ProjectHomePanel
            composer={composer}
            onOpenConversation={setActiveConversationId}
            onProjectHomeTabChange={onProjectHomeTabChange}
            projectHomeTab={projectHomeTab}
            projectRecentConversations={projectRecentConversations}
            selectedProject={selectedProject}
          />
        )}

        <AttachmentStatusList attachedFiles={attachedFiles} onRemoveFile={onRemoveFile} />

        {activeConversation && (
          <div className={styles.activeComposerFooter}>
            <div className="mx-auto max-w-[1480px]">{composer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
