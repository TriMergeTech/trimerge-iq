"use client";

import type { ReactNode } from "react";
import { BarChart3, Monitor, Pin, ShieldCheck } from "lucide-react";

import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";

interface ProjectHomePanelProps {
  composer: ReactNode;
  onOpenConversation: (conversationId: ChatEntityId) => void;
  onProjectHomeTabChange: (tab: "chats" | "sources") => void;
  onSuggestedPrompt: (prompt: string) => void;
  projectHomeTab: "chats" | "sources";
  projectRecentConversations: Conversation[];
  selectedProject: Project | null;
}

export default function ProjectHomePanel({
  composer,
  onOpenConversation,
  onProjectHomeTabChange,
  onSuggestedPrompt,
  projectHomeTab,
  projectRecentConversations,
  selectedProject,
}: ProjectHomePanelProps) {
  const promptCards = [
    {
      icon: BarChart3,
      title: "Draft a strategy memo",
      caption: "Outline a quarterly plan from your latest goals doc.",
      prompt: "Draft a strategy memo with a quarterly plan based on our latest goals.",
    },
    {
      icon: Monitor,
      title: "Audit a tech stack",
      caption: "Find gaps and quick wins for digital transformation.",
      prompt: "Audit this tech stack and identify gaps, risks, and quick wins for digital transformation.",
    },
    {
      icon: ShieldCheck,
      title: "Optimize a workflow",
      caption: "Cut waste from your ops process in three steps.",
      prompt: "Optimize this workflow and recommend three practical steps to reduce waste.",
    },
  ];

  return (
    <div className="chat-scrollbar relative z-10 flex min-h-0 flex-1 overflow-y-auto px-6 py-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center justify-center text-center">
        <p className="mb-5 inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.32em] text-[#a78bfa] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#2bc5ff] before:shadow-[0_0_8px_#2bc5ff]">
          {selectedProject?.name ?? "Workspace"}
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-normal text-white md:text-5xl">
          {selectedProject ? (
            <>
              Ready inside <span className="bg-gradient-to-r from-[#7c5cff] via-[#4f7bff] to-[#2bc5ff] bg-clip-text text-transparent">{selectedProject.name}.</span>
            </>
          ) : (
            <>
              Ready when <span className="bg-gradient-to-r from-[#7c5cff] via-[#4f7bff] to-[#2bc5ff] bg-clip-text text-transparent">you are.</span>
            </>
          )}
        </h1>
        <p className="mt-4 max-w-[560px] font-sans text-base leading-7 text-[#7a80a3]">
          Ask anything about strategy, transformation, or operations. TriMerge AI is plugged into your workspace.
        </p>

        <div className="mt-9 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
          {promptCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                type="button"
                onClick={() => onSuggestedPrompt(card.prompt)}
                className="interactive-button rounded-[14px] border border-white/[0.13] bg-white/[0.03] p-[18px] text-left hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/10 hover:shadow-[0_12px_32px_rgba(124,92,255,0.15)]"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#7c5cff]/15 text-[#a78bfa]">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="block font-display text-[15px] font-semibold text-white">{card.title}</span>
                <span className="mt-1 block font-sans text-[13px] leading-5 text-[#7a80a3]">{card.caption}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-9 w-full max-w-[900px]">{composer}</div>

        {selectedProject && (
          <div className="mt-12 w-full max-w-[980px] text-left">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onProjectHomeTabChange("chats")}
                className={`interactive-button rounded-full px-7 py-3 text-base font-medium transition ${projectHomeTab === "chats" ? "bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]" : "text-white/60 hover:bg-white/[0.04] hover:text-white/85"}`}
              >
                Chats
              </button>
              <button
                type="button"
                onClick={() => onProjectHomeTabChange("sources")}
                className={`interactive-button rounded-full px-7 py-3 text-base font-medium transition ${projectHomeTab === "sources" ? "bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]" : "text-white/60 hover:bg-white/[0.04] hover:text-white/85"}`}
              >
                Sources
              </button>
            </div>

            {projectHomeTab === "chats" ? (
              <div className="mt-8 space-y-3">
                {projectRecentConversations.length > 0 ? (
                  projectRecentConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => onOpenConversation(conversation.id)}
                      className="interactive-button flex w-full items-center justify-between rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 text-left text-white/88 hover:border-[#d4af37]/28 hover:bg-white/[0.05]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-lg font-medium text-white/92">
                          {conversation.pinned && <Pin className="mr-2 inline h-4 w-4 text-[#a78bfa]" />}
                          {conversation.title}
                        </p>
                        <p className="mt-1 text-sm text-white/40">{conversation.messages.length} messages</p>
                      </div>
                      <span className="shrink-0 pl-6 text-sm text-white/42">
                        {conversation.updatedAt.toLocaleDateString()}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center text-white/46">
                    This project does not have recent chats yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center text-white/46">
                Sources for this project will appear here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
