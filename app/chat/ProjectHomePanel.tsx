"use client";

import { useState, type ReactNode } from "react";

import type { Conversation, Project } from "./chatPageTypes";

interface ProjectHomePanelProps {
  composer: ReactNode;
  onOpenConversation: (conversationId: number) => void;
  onProjectHomeTabChange: (tab: "chats" | "sources") => void;
  projectHomeTab: "chats" | "sources";
  selectedProject: Project | null;
}

export default function ProjectHomePanel({
  composer,
  onOpenConversation,
  onProjectHomeTabChange,
  projectHomeTab,
  selectedProject,
}: ProjectHomePanelProps) {
  let [projectRecentConversations, set_project_recent_conversations] = useState(
    [],
  );

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12 lg:px-16 xl:px-20">
      <div className="flex w-full max-w-[1200px] flex-col items-center justify-center text-center">
        <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/68">
          {selectedProject?.name ?? "Workspace"}
        </p>
        <p className="text-3xl font-light tracking-tight text-white/92 md:text-4xl">
          {selectedProject
            ? `Ready to chat inside ${selectedProject.name}.`
            : "Ready when you are."}
        </p>

        <div className="mt-10 w-full max-w-[980px]">{composer}</div>

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
                          {conversation.pinned ? "📌 " : ""}
                          {conversation.title}
                        </p>
                        <p className="mt-1 text-sm text-white/40">
                          {conversation.messages.length} messages
                        </p>
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
