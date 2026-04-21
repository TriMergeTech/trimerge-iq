"use client";

import type { RefObject } from "react";
import { FileText, Image as ImageIcon, MoreHorizontal } from "lucide-react";

import ConversationMenuItem from "./ConversationMenuItem";
import type { Conversation } from "./chatPageTypes";

interface ConversationViewProps {
  activeConversation: Conversation;
  formatFileSize: (bytes: number) => string;
  isTyping: boolean;
  isWorkspaceMenuOpen: boolean;
  onArchiveConversation: (conversationId: number) => void;
  onClearActiveChat: () => void;
  onDeleteConversation: (conversationId: number) => void;
  onPinConversation: (conversationId: number) => void;
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
  return (
    <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto px-8 py-8 lg:px-16 lg:py-8 xl:px-20">
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
              <span>🧹</span>
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
                  <ConversationMenuItem emoji="🔗" label="Share" onClick={() => onShareConversation(activeConversation)} />
                  <ConversationMenuItem emoji="✏️" label="Rename" onClick={() => onRenameConversation(activeConversation)} />
                  <ConversationMenuItem
                    emoji={activeConversation.pinned ? "📍" : "📌"}
                    label={activeConversation.pinned ? "Unpin chat" : "Pin chat"}
                    onClick={() => onPinConversation(activeConversation.id)}
                  />
                  <ConversationMenuItem emoji="🗂️" label="Archive" onClick={() => onArchiveConversation(activeConversation.id)} />
                  <ConversationMenuItem emoji="🗑️" label="Delete" danger onClick={() => onDeleteConversation(activeConversation.id)} />
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
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-rise`}
          >
            <div
              className={`max-w-[80%] rounded-[30px] px-7 py-6 ${message.sender === "user" ? "border border-[#7aa7ff]/20 bg-[linear-gradient(180deg,#295dba_0%,#1c427f_100%)] text-white shadow-[0_20px_48px_rgba(30,91,168,0.24)]" : "border border-[#d4af37]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] text-white/88 shadow-[0_16px_40px_rgba(0,0,0,0.16)]"}`}
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
                    <div key={`${message.id}-${file.name}`} className="flex items-center gap-2 rounded-2xl bg-white/8 px-3 py-2.5">
                      {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span className="flex-1 truncate text-sm">{file.name}</span>
                      <span className="text-xs text-white/50">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-rise">
            <div className="rounded-[30px] border border-[#d4af37]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-7 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
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
  );
}
