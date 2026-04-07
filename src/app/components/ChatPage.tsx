"use client";

import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, Send, X } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  files?: UploadedFile[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your TriMerge AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    "Explain our strategic consulting services",
    "How can we improve operational efficiency?",
    "What are the latest digital transformation trends?",
    "Help me with financial analysis",
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const nextFiles = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setAttachedFiles((current) => [...current, ...nextFiles]);
  };

  const sendMessage = (prompt?: string) => {
    const content = prompt ?? inputMessage;
    if (!content.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: content || "Shared files",
      sender: "user",
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((current) => [...current, userMessage]);
    setInputMessage("");
    setAttachedFiles([]);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: userMessage.id + 1,
          content: getAIResponse(content, userMessage.files?.length ?? 0),
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 px-4 py-8">
      <div className="mx-auto flex h-[calc(100vh-120px)] max-w-5xl flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-white">AI Chat Assistant</h1>
          <p className="mt-2 text-blue-200">Powered by TriMerge Intelligence</p>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-[#1e5ba8] to-[#2667b8] text-white"
                      : "border border-white/20 bg-white/5 text-white"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        message.sender === "user"
                          ? "bg-white/20"
                          : "bg-[#d4af37] text-gray-900"
                      }`}
                    >
                      {message.sender === "user" ? "U" : "AI"}
                    </div>
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="leading-relaxed">{message.content}</div>

                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file) => (
                        <div
                          key={`${message.id}-${file.name}`}
                          className="flex items-center gap-2 rounded-lg bg-white/10 p-2"
                        >
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="flex-1 truncate text-xs">
                            {file.name}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37] text-sm font-bold text-gray-900">
                      AI
                    </div>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <div className="mb-3 text-sm text-white/60">Suggested prompts:</div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {attachedFiles.length > 0 && (
            <div className="px-6 pb-2">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-white" />
                    ) : (
                      <FileText className="h-4 w-4 text-white" />
                    )}
                    <span className="max-w-[150px] truncate text-sm text-white">
                      {file.name}
                    </span>
                    <span className="text-xs text-white/60">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachedFiles((current) =>
                          current.filter((item) => item.name !== file.name),
                        )
                      }
                      className="rounded p-1 transition-colors hover:bg-white/20"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/20 bg-white/5 p-6">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-white/20 bg-white/10 px-4 py-4 text-white transition-all hover:bg-white/20"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                placeholder="Type your message or attach files..."
                className="flex-1 rounded-xl border-2 border-white/20 bg-white/5 px-6 py-4 text-white outline-none placeholder:text-blue-200 focus:ring-2 focus:ring-[#1e5ba8]"
              />
              <button
                type="submit"
                disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isTyping}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#174a8f] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-[#174a8f] hover:to-[#0f3d7a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function getAIResponse(userMessage: string, fileCount: number): string {
  if (fileCount > 0) {
    return `I've received your message and ${fileCount} file(s). I can help you analyze these documents and provide insights based on their content.`;
  }

  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes("strategic") || lowerMessage.includes("consulting")) {
    return "Our strategic consulting services help organizations transform their business through data-driven strategies and actionable insights.";
  }
  if (lowerMessage.includes("operational") || lowerMessage.includes("efficiency")) {
    return "Improving operational efficiency involves streamlining processes, eliminating waste, and implementing lean management principles.";
  }
  if (lowerMessage.includes("digital") || lowerMessage.includes("transformation")) {
    return "Digital transformation is reshaping how businesses operate through cloud adoption, AI integration, automation, and stronger analytics.";
  }
  if (lowerMessage.includes("financial") || lowerMessage.includes("analysis")) {
    return "Financial analysis is crucial for informed decision-making. We provide modeling, performance analysis, and strategic recommendations.";
  }

  return `I understand you're asking about "${userMessage}". I can help you with strategic consulting, operational efficiency, digital transformation, and financial analysis.`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
