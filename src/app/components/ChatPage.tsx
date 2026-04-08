"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, FileText, Image as ImageIcon, MessageSquarePlus, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus, Search, Send, Sparkles, X } from "lucide-react";

interface UploadedFile { name: string; size: number; type: string; }
interface Message { id: number; content: string; sender: "user" | "ai"; timestamp: Date; files?: UploadedFile[]; }
interface Conversation { id: number; title: string; updatedAt: Date; messages: Message[]; pinned?: boolean; archived?: boolean; }

const suggestedPrompts = [
  "Explain our strategic consulting services",
  "How can we improve operational efficiency?",
  "What are the latest digital transformation trends?",
  "Help me with financial analysis",
];

const initialConversations: Conversation[] = [
  { id: 1, title: "Digital Transformation Roadmap", updatedAt: new Date("2026-04-08T09:15:00"), messages: [{ id: 1, content: "Can you outline a three-phase digital transformation roadmap for a mid-sized company?", sender: "user", timestamp: new Date("2026-04-08T09:15:00") }, { id: 2, content: "Absolutely. Start with assessment and prioritization, then move into process redesign and system rollout, and finally scale with automation, analytics, and governance.", sender: "ai", timestamp: new Date("2026-04-08T09:16:00") }] },
  { id: 2, title: "Q2 Operations Review", updatedAt: new Date("2026-04-07T16:20:00"), messages: [{ id: 1, content: "What should I include in an operations review for regional managers?", sender: "user", timestamp: new Date("2026-04-07T16:20:00") }, { id: 2, content: "Focus on throughput, utilization, service levels, bottlenecks, staffing trends, and a short action plan with owners and deadlines.", sender: "ai", timestamp: new Date("2026-04-07T16:21:00") }] },
  { id: 3, title: "Financial Model Support", updatedAt: new Date("2026-04-05T11:05:00"), messages: [{ id: 1, content: "Help me structure a simple cash flow forecast model.", sender: "user", timestamp: new Date("2026-04-05T11:05:00") }, { id: 2, content: "Use three sections: cash in, cash out, and net position. Then layer assumptions by month and scenario so you can compare base, upside, and downside outcomes.", sender: "ai", timestamp: new Date("2026-04-05T11:06:00") }] },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversationSearch, setConversationSearch] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [openConversationMenuId, setOpenConversationMenuId] = useState<number | null>(null);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const conversationMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(() => conversations.find((c) => c.id === activeConversationId) ?? null, [activeConversationId, conversations]);
  const filteredConversations = useMemo(() => {
    const base = conversations.filter((c) => !c.archived);
    if (!conversationSearch.trim()) return base;
    return base.filter((c) => c.title.toLowerCase().includes(conversationSearch.toLowerCase()));
  }, [conversationSearch, conversations]);
  const visibleConversations = useMemo(() => [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  }), [filteredConversations]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) setIsAttachmentMenuOpen(false);
      if (conversationMenuRef.current && !conversationMenuRef.current.contains(event.target as Node)) setOpenConversationMenuId(null);
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) setIsWorkspaceMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setAttachedFiles((current) => [...current, ...Array.from(files).map((file) => ({ name: file.name, size: file.size, type: file.type }))]);
    event.target.value = "";
  };

  const startNewChat = () => {
    setActiveConversationId(null); setInputMessage(""); setAttachedFiles([]); setIsTyping(false); setIsAttachmentMenuOpen(false); setOpenConversationMenuId(null);
  };

  const updateConversation = (conversationId: number, updater: (conversation: Conversation) => Conversation | null) => {
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? updater(conversation) : conversation).filter(Boolean) as Conversation[]);
  };

  const handleRenameConversation = (conversation: Conversation) => {
    const nextTitle = window.prompt("Rename conversation", conversation.title)?.trim();
    if (!nextTitle) return;
    updateConversation(conversation.id, (current) => ({ ...current, title: nextTitle, updatedAt: new Date() }));
    setOpenConversationMenuId(null);
  };
  const handleDeleteConversation = (conversationId: number) => {
    updateConversation(conversationId, () => null);
    if (activeConversationId === conversationId) setActiveConversationId(null);
    setOpenConversationMenuId(null);
  };
  const handlePinConversation = (conversationId: number) => {
    updateConversation(conversationId, (current) => ({ ...current, pinned: !current.pinned, updatedAt: new Date() }));
    setOpenConversationMenuId(null);
  };
  const handleArchiveConversation = (conversationId: number) => {
    updateConversation(conversationId, (current) => ({ ...current, archived: true, updatedAt: new Date() }));
    if (activeConversationId === conversationId) setActiveConversationId(null);
    setOpenConversationMenuId(null);
  };
  const handleShareConversation = async (conversation: Conversation) => {
    const shareLabel = `TriMerge chat: ${conversation.title}`;
    try { await navigator.clipboard.writeText(shareLabel); } catch { window.prompt("Copy this conversation label", shareLabel); }
    setOpenConversationMenuId(null);
  };

  const handleClearActiveChat = () => {
    if (!activeConversation) return;
    updateConversation(activeConversation.id, (current) => ({ ...current, messages: [], updatedAt: new Date() }));
    setIsWorkspaceMenuOpen(false);
  };

  const sendMessage = (prompt?: string) => {
    const content = (prompt ?? inputMessage).trim();
    if (!content && attachedFiles.length === 0) return;
    const conversationId = activeConversationId ?? Date.now();
    const isNewConversation = activeConversationId === null;
    const newTitle = content ? content.slice(0, 38) + (content.length > 38 ? "..." : "") : "Shared files";
    const userMessage: Message = { id: Date.now(), content: content || "Shared files", sender: "user", timestamp: new Date(), files: attachedFiles.length > 0 ? [...attachedFiles] : undefined };

    setConversations((current) => {
      const existingConversation = current.find((conversation) => conversation.id === conversationId);
      if (!existingConversation) {
        return [{ id: conversationId, title: newTitle, updatedAt: new Date(), messages: [userMessage] }, ...current];
      }
      return current.map((conversation) => conversation.id === conversationId ? { ...conversation, title: conversation.title === "New chat" && content ? newTitle : conversation.title, updatedAt: new Date(), messages: [...conversation.messages, userMessage] } : conversation).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    setActiveConversationId(conversationId);
    setInputMessage(""); setAttachedFiles([]); setIsAttachmentMenuOpen(false); setOpenConversationMenuId(null); setIsTyping(true);

    window.setTimeout(() => {
      const aiMessage: Message = { id: Date.now() + 1, content: getAIResponse(content, userMessage.files?.length ?? 0), sender: "ai", timestamp: new Date() };
      setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, updatedAt: new Date(), messages: [...conversation.messages, aiMessage] } : conversation).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      setIsTyping(false);
    }, isNewConversation ? 1000 : 1200);
  };

  return (
    <section className="relative h-[calc(100vh-81px)] overflow-hidden bg-[#202123] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-9rem] top-12 h-80 w-80 rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute right-[-5rem] top-0 h-[28rem] w-[28rem] rounded-full bg-slate-400/[0.04] blur-3xl" />
      </div>

      <div className="relative flex h-full w-full">
        <aside className={`chat-scrollbar h-full shrink-0 overflow-y-scroll bg-[#171717] transition-[width] duration-300 ${isSidebarOpen ? "w-[290px]" : "w-[76px]"}`}>
          <div className="border-b border-white/6 px-5 py-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((current) => !current)}
                className="interactive-button rounded-full bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </button>
            </div>

            <button type="button" onClick={startNewChat} className={`interactive-button flex w-full items-center rounded-2xl border border-white/6 bg-white/[0.04] py-3.5 text-left text-white/92 hover:bg-white/[0.07] ${isSidebarOpen ? "gap-3 px-4" : "justify-center px-0"}`}>
              <MessageSquarePlus className="h-5 w-5 text-white/68" />
              {isSidebarOpen && <span className="font-medium">New chat</span>}
            </button>
            {isSidebarOpen ? (
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" />
                <input type="text" value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder="Search chats" className="interactive-input w-full rounded-2xl border border-white/6 bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/12 focus:ring-0" />
              </div>
            ) : (
              <button type="button" aria-label="Search chats" className="interactive-button mt-4 flex w-full items-center justify-center rounded-2xl border border-white/6 bg-white/[0.035] py-3.5 text-white/68 hover:bg-white/[0.07]">
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 px-4 py-5">
            {isSidebarOpen && <div className="mb-5 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/28">Recents</div>}
            {isSidebarOpen && <div className="space-y-2">
              {visibleConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                return (
                  <div key={conversation.id} className={`group relative rounded-2xl ${isActive ? "bg-white/[0.06]" : ""}`}>
                    <button type="button" onClick={() => { setActiveConversationId(conversation.id); setIsAttachmentMenuOpen(false); setOpenConversationMenuId(null); }} className={`interactive-button flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 pr-12 text-left ${isActive ? "" : "hover:bg-white/[0.04]"}`}>
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-white/26" />
                      {isSidebarOpen && (
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/86">{conversation.pinned ? "📌 " : ""}{conversation.title}</p>
                          <p className="mt-1 text-xs text-white/30">{conversation.updatedAt.toLocaleDateString()}</p>
                        </div>
                      )}
                    </button>

                    {isSidebarOpen && (
                    <div className="absolute right-2 top-2" ref={openConversationMenuId === conversation.id ? conversationMenuRef : undefined}>
                      <button type="button" aria-label="Conversation options" onClick={() => setOpenConversationMenuId((current) => current === conversation.id ? null : conversation.id)} className={`interactive-button flex h-8 w-8 items-center justify-center rounded-full text-white/46 ${openConversationMenuId === conversation.id ? "bg-white/[0.09]" : "opacity-0 group-hover:opacity-100 hover:bg-white/[0.07]"}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openConversationMenuId === conversation.id && (
                        <div className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-white/8 bg-[#111214] p-2 shadow-2xl animate-fade-rise">
                          <ConversationMenuItem emoji="🔗" label="Share" onClick={() => handleShareConversation(conversation)} />
                          <ConversationMenuItem emoji="✏️" label="Rename" onClick={() => handleRenameConversation(conversation)} />
                          <ConversationMenuItem emoji={conversation.pinned ? "📍" : "📌"} label={conversation.pinned ? "Unpin chat" : "Pin chat"} onClick={() => handlePinConversation(conversation.id)} />
                          <ConversationMenuItem emoji="🗂️" label="Archive" onClick={() => handleArchiveConversation(conversation.id)} />
                          <ConversationMenuItem emoji="🗑️" label="Delete" danger onClick={() => handleDeleteConversation(conversation.id)} />
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                );
              })}

              {isSidebarOpen && visibleConversations.length === 0 && <div className="rounded-2xl border border-dashed border-white/8 px-4 py-6 text-sm text-white/36">No conversations match that search yet.</div>}
            </div>}
          </div>

        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#202123]">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {activeConversation ? (
              <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto px-8 py-8 lg:px-16 lg:py-8 xl:px-20">
                <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/26">Workspace</p>
                      <h1 className="mt-2 text-[34px] font-semibold tracking-tight text-white/95">{activeConversation.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleClearActiveChat}
                        className="interactive-button flex items-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-2.5 text-sm font-medium text-white/78 hover:bg-white/[0.06] hover:text-white"
                      >
                        <span>🧹</span>
                        <span>Clear chat</span>
                      </button>

                      <div className="relative" ref={workspaceMenuRef}>
                        <button
                          type="button"
                          aria-label="Chat options"
                          onClick={() => setIsWorkspaceMenuOpen((current) => !current)}
                          className="interactive-button flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {isWorkspaceMenuOpen && (
                          <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-white/8 bg-[#111214] p-2 shadow-2xl animate-fade-rise">
                            <ConversationMenuItem emoji="🔗" label="Share" onClick={() => handleShareConversation(activeConversation)} />
                            <ConversationMenuItem emoji="✏️" label="Rename" onClick={() => handleRenameConversation(activeConversation)} />
                            <ConversationMenuItem emoji={activeConversation.pinned ? "📍" : "📌"} label={activeConversation.pinned ? "Unpin chat" : "Pin chat"} onClick={() => handlePinConversation(activeConversation.id)} />
                            <ConversationMenuItem emoji="🗂️" label="Archive" onClick={() => handleArchiveConversation(activeConversation.id)} />
                            <ConversationMenuItem emoji="🗑️" label="Delete" danger onClick={() => handleDeleteConversation(activeConversation.id)} />
                          </div>
                        )}
                      </div>

                      <button type="button" onClick={startNewChat} className="interactive-button rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] lg:hidden">New chat</button>
                    </div>
                  </div>

                  {activeConversation.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-rise`}>
                      <div className={`max-w-[80%] rounded-[30px] px-7 py-6 ${message.sender === "user" ? "bg-[#2d5ea8] text-white shadow-[0_12px_30px_rgba(27,54,96,0.22)]" : "border border-white/7 bg-white/[0.03] text-white/88"}`}>
                        <div className="mb-4 flex items-center gap-2 text-xs text-white/42">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${message.sender === "user" ? "bg-white/20 text-white" : "bg-white/10 text-white/90"}`}>{message.sender === "user" ? "U" : "AI"}</span>
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
                      <div className="rounded-[30px] border border-white/7 bg-white/[0.03] px-7 py-6">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-bold text-white/90">AI</span>
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-8 py-12 lg:px-16 xl:px-20">
                <div className="flex w-full max-w-[1200px] flex-col items-center justify-center text-center">
                  <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/26">Workspace</p>
                  <p className="text-3xl font-light tracking-tight text-white/92 md:text-4xl">
                    Ready when you are.
                  </p>

                  <div className="mt-10 w-full max-w-[980px]">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        sendMessage();
                      }}
                      className="relative rounded-[34px] border border-white/7 bg-white/[0.035] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
                        onChange={handleFileSelect}
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />

                      <div className="flex items-center gap-3">
                        <div className="relative" ref={attachmentMenuRef}>
                          {isAttachmentMenuOpen && (
                            <div className="absolute bottom-[calc(100%+14px)] left-0 z-20 w-64 rounded-3xl border border-white/8 bg-[#111214] p-2 shadow-2xl animate-fade-rise">
                              <SidebarAction icon={<ImageIcon className="h-5 w-5" />} label="Upload photos" caption="Add images to your message" onClick={() => { imageInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} />
                              <SidebarAction icon={<FileText className="h-5 w-5" />} label="Upload files" caption="Attach documents and spreadsheets" onClick={() => { fileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} />
                              <SidebarAction icon={<Sparkles className="h-5 w-5" />} label="Create prompt" caption="Insert a suggested request" onClick={() => { setInputMessage("Help me create a client-ready plan."); setIsAttachmentMenuOpen(false); }} />
                            </div>
                          )}

                          <button type="button" onClick={() => setIsAttachmentMenuOpen((current) => !current)} className={`interactive-button flex h-12 w-12 items-center justify-center rounded-full border text-white ${isAttachmentMenuOpen ? "border-white/16 bg-white/[0.08]" : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                            <Plus className={`h-6 w-6 transition-transform duration-300 ${isAttachmentMenuOpen ? "rotate-45" : ""}`} />
                          </button>
                        </div>

                        <input type="text" value={inputMessage} onChange={(event) => setInputMessage(event.target.value)} placeholder="Ask anything" className="flex-1 bg-transparent px-3 py-3 text-[17px] font-light text-white outline-none placeholder:text-white/32" />
                        <button type="submit" disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isTyping} className="interactive-button flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#111214] shadow-[0_10px_24px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-5 w-5" /></button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {attachedFiles.length > 0 && (
              <div className="px-6 pb-3 lg:px-12">
                <div className="mx-auto flex max-w-[1160px] flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div key={file.name} className="flex items-center gap-2 rounded-2xl border border-white/7 bg-white/[0.03] px-3 py-2 text-white/88">
                      {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span className="max-w-[160px] truncate text-sm">{file.name}</span>
                      <button type="button" onClick={() => setAttachedFiles((current) => current.filter((item) => item.name !== file.name))} className="interactive-button rounded-full p-1 hover:bg-white/10"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConversation && (
              <div className="border-t border-white/6 bg-[#202123] px-8 pb-8 pt-5 lg:px-16 xl:px-20">
              <div className="mx-auto max-w-[1480px]">
                <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="relative rounded-[34px] border border-white/7 bg-white/[0.035] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <input ref={fileInputRef} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx" onChange={handleFileSelect} />
                  <input ref={imageInputRef} type="file" multiple className="hidden" accept="image/*" onChange={handleFileSelect} />

                  <div className="flex items-center gap-3">
                    <div className="relative" ref={attachmentMenuRef}>
                      {isAttachmentMenuOpen && (
                        <div className="absolute bottom-[calc(100%+14px)] left-0 z-20 w-64 rounded-3xl border border-white/8 bg-[#111214] p-2 shadow-2xl animate-fade-rise">
                          <SidebarAction icon={<ImageIcon className="h-5 w-5" />} label="Upload photos" caption="Add images to your message" onClick={() => { imageInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} />
                          <SidebarAction icon={<FileText className="h-5 w-5" />} label="Upload files" caption="Attach documents and spreadsheets" onClick={() => { fileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} />
                          <SidebarAction icon={<Sparkles className="h-5 w-5" />} label="Create prompt" caption="Insert a suggested request" onClick={() => { setInputMessage("Help me create a client-ready plan."); setIsAttachmentMenuOpen(false); }} />
                        </div>
                      )}

                      <button type="button" onClick={() => setIsAttachmentMenuOpen((current) => !current)} className={`interactive-button flex h-12 w-12 items-center justify-center rounded-full border text-white ${isAttachmentMenuOpen ? "border-white/16 bg-white/[0.08]" : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                        <Plus className={`h-6 w-6 transition-transform duration-300 ${isAttachmentMenuOpen ? "rotate-45" : ""}`} />
                      </button>
                    </div>

                    <input type="text" value={inputMessage} onChange={(event) => setInputMessage(event.target.value)} placeholder="Ask anything" className="flex-1 bg-transparent px-3 py-3 text-[22px] font-light text-white outline-none placeholder:text-white/32" />
                    <button type="submit" disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isTyping} className="interactive-button flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#111214] shadow-[0_10px_24px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-5 w-5" /></button>
                  </div>
                </form>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarAction({ icon, label, caption, onClick }: { icon: React.ReactNode; label: string; caption: string; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} className="interactive-button flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white hover:bg-white/[0.05]">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-white/82">{icon}</span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-white/40">{caption}</span>
      </span>
    </button>
  );
}

function ConversationMenuItem({ emoji, label, onClick, danger = false }: { emoji: string; label: string; onClick: () => void; danger?: boolean; }) {
  return (
    <button type="button" onClick={onClick} className={`interactive-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white hover:bg-white/[0.05]"}`}>
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function getAIResponse(userMessage: string, fileCount: number): string {
  if (fileCount > 0) return `I've received your message and ${fileCount} file(s). I can help you analyze these materials and turn them into a usable summary, plan, or recommendation.`;
  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes("strategic") || lowerMessage.includes("consulting")) return "A strong consulting response starts by clarifying the business objective, diagnosing the gap, prioritizing the highest-value opportunities, and then sequencing initiatives into an execution roadmap.";
  if (lowerMessage.includes("operational") || lowerMessage.includes("efficiency")) return "To improve operational efficiency, begin with process mapping, identify the biggest friction points, assign measurable targets, and then pair quick wins with one or two structural improvements.";
  if (lowerMessage.includes("digital") || lowerMessage.includes("transformation")) return "The latest transformation work usually blends automation, better internal data visibility, leaner workflows, and clearer governance so teams can scale without adding complexity.";
  if (lowerMessage.includes("financial") || lowerMessage.includes("analysis")) return "For financial analysis, I would frame the work around revenue drivers, margin pressure, cash timing, and scenario planning so leadership can make decisions with clearer tradeoffs.";
  return `I can help with that. If you want, I can turn "${userMessage}" into a structured answer, a client-ready summary, or a step-by-step plan.`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

