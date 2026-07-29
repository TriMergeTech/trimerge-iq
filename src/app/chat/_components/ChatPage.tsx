"use client";

import { useEffect, useRef, useState } from "react";

import ChatMainContent from "./ChatMainContent";
import ChatModalHost from "./ChatModalHost";
import ChatSidebar from "./ChatSidebar";
import styles from "./ChatPage.module.css";
import { type ChatEntityId } from "./chatPageTypes";
import { useChatData } from "./useChatData";
import { useChatDialogs } from "./useChatDialogs";
import { useChatFilters } from "./useChatFilters";
import { useConversationActions } from "./useConversationActions";
import { useProjectFormState } from "./useProjectFormState";
import { useProjectActions } from "./useProjectActions";
import { useRfpAttachments } from "./useRfpAttachments";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<ChatEntityId | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<ChatEntityId | null>(null);
  const [projectHomeTab, setProjectHomeTab] = useState<"chats" | "sources">("chats");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarConversationView, setSidebarConversationView] = useState<"active" | "archived">("active");
  const [conversationSearch, setConversationSearch] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastChatError, setLastChatError] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [openConversationMenuId, setOpenConversationMenuId] = useState<ChatEntityId | null>(null);
  const [openProjectActionMenuId, setOpenProjectActionMenuId] = useState<ChatEntityId | null>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const conversationMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const projectActionMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const {
    attachedFiles,
    handleFileSelect,
    removeAttachedFile,
    setAttachedFiles,
  } = useRfpAttachments();
  const {
    conversations,
    isLoadingChatData,
    projects,
    setConversations,
    setProjects,
  } = useChatData({
    activeConversationId,
    selectedProjectId,
    setLastChatError,
  });
  const {
    addProjectStaffOption,
    isLoadingProjectOptions,
    newProjectClient,
    newProjectDescription,
    newProjectManager,
    newProjectName,
    newProjectService,
    newProjectTeam,
    projectClientOptions,
    projectServiceOptions,
    projectStaffOptions,
    setNewProjectClient,
    setNewProjectDescription,
    setNewProjectManager,
    setNewProjectName,
    setNewProjectService,
    setNewProjectTeam,
    setProjectClientOptions,
  } = useProjectFormState({
    isCreateProjectModalOpen,
    projectNameInputRef,
    setLastChatError,
  });

  const {
    activeConversation,
    archivedSidebarConversations,
    projectRecentConversations,
    recentProjects,
    selectedProject,
    visibleSidebarConversations,
  } = useChatFilters({
    activeConversationId,
    conversationSearch,
    conversations,
    projects,
    selectedProjectId,
    sidebarConversationView,
  });

  const {
    addProjectClientOption,
    closeCreateClientDialog,
    copyShareDialogValue,
    isCreateClientDialogOpen,
    isSavingNewClient,
    isShareCopied,
    newClientAbout,
    newClientError,
    newClientName,
    openConversationRenameDialog,
    openConversationShareDialog,
    openProjectRenameDialog,
    openProjectShareDialog,
    renameDialog,
    setNewClientAbout,
    setNewClientName,
    setRenameDialog,
    setShareDialog,
    shareDialog,
    submitNewClient,
    submitRenameDialog,
  } = useChatDialogs({
    projects,
    setConversations,
    setLastChatError,
    setNewProjectClient,
    setOpenConversationMenuId,
    setOpenProjectActionMenuId,
    setProjectClientOptions,
    setProjects,
    setIsWorkspaceMenuOpen,
  });

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
      <ChatModalHost
        clientOptions={projectClientOptions}
        isCreateClientDialogOpen={isCreateClientDialogOpen}
        isCreateProjectModalOpen={isCreateProjectModalOpen}
        isLoadingProjectOptions={isLoadingProjectOptions}
        isSavingNewClient={isSavingNewClient}
        isShareCopied={isShareCopied}
        newClientAbout={newClientAbout}
        newClientError={newClientError}
        newClientName={newClientName}
        newProjectClient={newProjectClient}
        newProjectDescription={newProjectDescription}
        newProjectManager={newProjectManager}
        newProjectName={newProjectName}
        newProjectService={newProjectService}
        newProjectTeam={newProjectTeam}
        onAddClient={addProjectClientOption}
        onAddStaff={addProjectStaffOption}
        onCloseCreateClient={closeCreateClientDialog}
        onCloseCreateProject={closeCreateProjectModal}
        onCopyShare={copyShareDialogValue}
        onCreateProject={handleCreateProject}
        onSubmitNewClient={submitNewClient}
        onSubmitRename={submitRenameDialog}
        projectNameInputRef={projectNameInputRef}
        renameDialog={renameDialog}
        serviceOptions={projectServiceOptions}
        setNewClientAbout={setNewClientAbout}
        setNewClientName={setNewClientName}
        setNewProjectClient={setNewProjectClient}
        setNewProjectDescription={setNewProjectDescription}
        setNewProjectManager={setNewProjectManager}
        setNewProjectName={setNewProjectName}
        setNewProjectService={setNewProjectService}
        setRenameDialog={setRenameDialog}
        setShareDialog={setShareDialog}
        shareDialog={shareDialog}
        staffOptions={projectStaffOptions}
        toggleTeamMember={toggleTeamMember}
      />

      <div className={styles.chatShell}>
        <ChatSidebar
          activeConversationId={activeConversationId}
          archivedSidebarConversations={archivedSidebarConversations}
          conversationMenuRef={conversationMenuRef}
          conversationSearch={conversationSearch}
          handleArchiveConversation={handleArchiveConversation}
          handleArchiveProject={handleArchiveProject}
          handleDeleteConversation={handleDeleteConversation}
          handleDeleteProject={handleDeleteProject}
          handlePinConversation={handlePinConversation}
          handlePinProject={handlePinProject}
          handleSelectProject={handleSelectProject}
          isLoadingChatData={isLoadingChatData}
          isProjectMenuOpen={isProjectMenuOpen}
          isSidebarOpen={isSidebarOpen}
          onOpenConversationRenameDialog={openConversationRenameDialog}
          onOpenConversationShareDialog={(conversation) => void openConversationShareDialog(conversation)}
          onOpenCreateProjectModal={openCreateProjectModal}
          onOpenProjectRenameDialog={openProjectRenameDialog}
          onOpenProjectShareDialog={openProjectShareDialog}
          openConversationMenuId={openConversationMenuId}
          openProjectActionMenuId={openProjectActionMenuId}
          projectActionMenuRef={projectActionMenuRef}
          projectMenuRef={projectMenuRef}
          recentProjects={recentProjects}
          selectedProjectId={selectedProjectId}
          setActiveConversationId={setActiveConversationId}
          setConversationSearch={setConversationSearch}
          setIsAttachmentMenuOpen={setIsAttachmentMenuOpen}
          setIsProjectMenuOpen={setIsProjectMenuOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          setOpenConversationMenuId={setOpenConversationMenuId}
          setOpenProjectActionMenuId={setOpenProjectActionMenuId}
          setSelectedProjectId={setSelectedProjectId}
          setSidebarConversationView={setSidebarConversationView}
          sidebarConversationView={sidebarConversationView}
          startNewChat={startNewChat}
          visibleSidebarConversations={visibleSidebarConversations}
        />

        <ChatMainContent
          activeConversation={activeConversation}
          attachedFiles={attachedFiles}
          attachmentMenuRef={attachmentMenuRef}
          fileInputRef={fileInputRef}
          handleArchiveConversation={handleArchiveConversation}
          handleClearActiveChat={handleClearActiveChat}
          handleDeleteConversation={handleDeleteConversation}
          handleFileSelect={handleFileSelect}
          handlePinConversation={handlePinConversation}
          imageInputRef={imageInputRef}
          inputMessage={inputMessage}
          isAttachmentMenuOpen={isAttachmentMenuOpen}
          isTyping={isTyping}
          isWorkspaceMenuOpen={isWorkspaceMenuOpen}
          lastChatError={lastChatError}
          onOpenConversationRenameDialog={openConversationRenameDialog}
          onOpenConversationShareDialog={(conversation) => void openConversationShareDialog(conversation)}
          onProjectHomeTabChange={setProjectHomeTab}
          onRemoveFile={removeAttachedFile}
          projectHomeTab={projectHomeTab}
          projectRecentConversations={projectRecentConversations}
          selectedProject={selectedProject}
          setActiveConversationId={setActiveConversationId}
          setInputMessage={setInputMessage}
          setIsAttachmentMenuOpen={setIsAttachmentMenuOpen}
          setIsWorkspaceMenuOpen={setIsWorkspaceMenuOpen}
          sendMessage={sendMessage}
          startNewChat={startNewChat}
          workspaceMenuRef={workspaceMenuRef}
        />
      </div>
    </section>
  );
}


