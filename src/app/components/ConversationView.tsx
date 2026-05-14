"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Archive as ArchiveIcon, ArrowDown, Eraser, FileText, Image as ImageIcon, Link2, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";

import ConversationMenuItem from "./ConversationMenuItem";
import type { ChatEntityId, Conversation, Message } from "./chatPageTypes";

interface ConversationViewProps {
  activeConversation: Conversation;
  formatFileSize: (bytes: number) => string;
  isTyping: boolean;
  isWorkspaceMenuOpen: boolean;
  onArchiveConversation: (conversationId: ChatEntityId, archived?: boolean) => void;
  onClearActiveChat: () => void;
  onDeleteConversation: (conversationId: ChatEntityId) => void;
  onPinConversation: (conversationId: ChatEntityId) => void;
  onRenameConversation: (conversation: Conversation) => void;
  onShareConversation: (conversation: Conversation) => void;
  onStartNewChat: () => void;
  onToggleWorkspaceMenu: () => void;
  selectedProjectName?: string;
  workspaceMenuRef: RefObject<HTMLDivElement>;
}

export default function ConversationView({
  activeConversation,
  formatFileSize,
  isTyping,
  isWorkspaceMenuOpen,
  onArchiveConversation,
  onClearActiveChat,
  onDeleteConversation,
  onPinConversation,
  onRenameConversation,
  onShareConversation,
  onStartNewChat,
  onToggleWorkspaceMenu,
  selectedProjectName,
  workspaceMenuRef,
}: ConversationViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];

  const updateScrollToBottomVisibility = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const distanceFromBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 140);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior,
    });
    setShowScrollToBottom(false);
  }, []);

  useEffect(() => {
    const scrollFrame = window.requestAnimationFrame(() => {
      scrollToBottom("smooth");
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [activeConversation.id, activeConversation.messages.length, isTyping, lastMessage?.id, scrollToBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollContainerRef} onScroll={updateScrollToBottomVisibility} className="chat-scrollbar h-full overflow-y-auto px-8 py-8 lg:px-16 lg:py-8 xl:px-20">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/68">
                {selectedProjectName ?? "Workspace"}
              </p>
              <h1 className="mt-2 text-[34px] font-semibold tracking-tight text-white/95">
                {activeConversation.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClearActiveChat}
                className="interactive-button flex items-center gap-2 rounded-2xl border border-[#d4af37]/30 bg-[#101827]/75 px-4 py-2.5 text-sm font-medium text-[#f6edd0] hover:border-[#d4af37]/55 hover:bg-[#13233f] hover:text-white"
              >
                <Eraser className="h-4 w-4" />
                <span>Clear chat</span>
              </button>

              <div className="relative" ref={workspaceMenuRef}>
                <button
                  type="button"
                  aria-label="Chat options"
                  onClick={onToggleWorkspaceMenu}
                  className="interactive-button flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/28 bg-[#101827]/75 text-[#f6edd0] hover:border-[#d4af37]/52 hover:bg-[#13233f] hover:text-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {isWorkspaceMenuOpen && (
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-[#d4af37]/26 bg-[#0b111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
                    <ConversationMenuItem icon={<Link2 className="h-4 w-4" />} label="Share" onClick={() => onShareConversation(activeConversation)} />
                    <ConversationMenuItem icon={<Pencil className="h-4 w-4" />} label="Rename" onClick={() => onRenameConversation(activeConversation)} />
                    <ConversationMenuItem
                      icon={activeConversation.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      label={activeConversation.pinned ? "Unpin chat" : "Pin chat"}
                      onClick={() => onPinConversation(activeConversation.id)}
                    />
                    <ConversationMenuItem
                      icon={<ArchiveIcon className="h-4 w-4" />}
                      label={activeConversation.archived ? "Unarchive" : "Archive"}
                      onClick={() => onArchiveConversation(activeConversation.id, !activeConversation.archived)}
                    />
                    <ConversationMenuItem icon={<Trash2 className="h-4 w-4" />} label="Delete" danger onClick={() => onDeleteConversation(activeConversation.id)} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onStartNewChat}
                className="interactive-button rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] lg:hidden"
              >
                New chat
              </button>
            </div>
          </div>

          {activeConversation.messages.map((message) => (
            <ChatMessageBubble key={message.id} formatFileSize={formatFileSize} message={message} />
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-rise">
              <div className="rounded-[26px] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] px-7 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.065),0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]/14 font-bold text-[#f4e4a4]">
                    AI
                  </span>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#d4af37]/70" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#d4af37]/70 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#d4af37]/70 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showScrollToBottom && (
        <button
          type="button"
          aria-label="Scroll to latest message"
          onClick={() => scrollToBottom("smooth")}
          className="interactive-button absolute bottom-5 left-1/2 z-20 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-[#d4af37]/24 bg-[#0b111a]/88 text-[#f6edd0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_45px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:border-[#d4af37]/48 hover:bg-[#13233f]/94 hover:text-white"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function ChatMessageBubble({
  formatFileSize,
  message,
}: {
  formatFileSize: (bytes: number) => string;
  message: Message;
}) {
  return (
    <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-rise`}>
      <div
        className={`max-w-[80%] rounded-[26px] px-7 py-6 backdrop-blur-xl ${
          message.sender === "user"
            ? "border border-[#9bbaff]/12 bg-[linear-gradient(145deg,rgba(78,119,213,0.92),rgba(38,67,134,0.96))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_42px_rgba(23,61,139,0.24)]"
            : "border border-white/[0.075] bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.065),0_18px_45px_rgba(0,0,0,0.18)]"
        }`}
      >
        <div className="mb-4 flex items-center gap-2 text-xs text-white/42">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${message.sender === "user" ? "bg-white/20 text-white" : "bg-[#d4af37]/14 text-[#f4e4a4]"}`}
          >
            {message.sender === "user" ? "U" : "AI"}
          </span>
          {message.timestamp.toLocaleTimeString()}
        </div>
        <div className="text-[15px] leading-8">{message.content}</div>
        {message.files && message.files.length > 0 && (
          <div className="mt-5 space-y-2">
            {message.files.map((file) => (
              <div key={`${message.id}-${file.name}`} className="flex items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.055] px-3 py-2.5">
                {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <span className="text-xs text-white/50">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
