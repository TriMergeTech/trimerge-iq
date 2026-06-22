"use client";

import type { ReactNode } from "react";

import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";
import styles from "./ProjectHomePanel.module.css";

interface ProjectHomePanelProps {
  composer: ReactNode;
  onOpenConversation: (conversationId: ChatEntityId) => void;
  onProjectHomeTabChange: (tab: "chats" | "sources") => void;
  projectHomeTab: "chats" | "sources";
  projectRecentConversations: Conversation[];
  selectedProject: Project | null;
}

export default function ProjectHomePanel({
  composer,
  onOpenConversation,
  onProjectHomeTabChange,
  projectHomeTab,
  projectRecentConversations,
  selectedProject,
}: ProjectHomePanelProps) {
  return (
    <div className={styles.greeting}>
      <div className={styles.workspaceTag}>
        {selectedProject?.name ?? "Workspace"}
      </div>
      <h1 className={styles.h1}>
        {selectedProject ? (
          <>
            Ready to chat inside{" "}
            <span className={styles.accent}>{selectedProject.name}.</span>
          </>
        ) : (
          <>
            Organizational Intelligence at{" "}
            <span className={styles.accent}>Your Fingertips.</span>
          </>
        )}
      </h1>
      <p className={styles.desc}>
        Ask questions about opportunities, projects, clients, staff expertise,
        past performance, policies, procedures, templates, and organizational
        knowledge across TriMergeIQ.
      </p>

      <div className={styles.suggested}>
        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18" />
              <path d="M12 3v18" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Find Relevant Past Performance</h4>
          <p className={styles.promptDesc}>
            Show all FEMA-related projects completed by TriMerge.
          </p>
        </button>

        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="3" />
              <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Search Staff Expertise</h4>
          <p className={styles.promptDesc}>
            Find team members with grant compliance experience.
          </p>
        </button>

        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Find Proposal Resources</h4>
          <p className={styles.promptDesc}>
            Locate past performance examples for local government clients.
          </p>
        </button>

        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>
            Search Organizational Knowledge
          </h4>
          <p className={styles.promptDesc}>
            Find SOPs related to financial management and internal controls.
          </p>
        </button>

        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10a8 8 0 1 0-9 7.7" />
              <path d="M22 22l-4.3-4.3" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Explore Opportunities</h4>
          <p className={styles.promptDesc}>
            Show active opportunities due within the next 30 days.
          </p>
        </button>

        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h18" />
              <path d="M3 12h18" />
              <path d="M3 17h18" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Search Client History</h4>
          <p className={styles.promptDesc}>
            Show all projects performed for local governments.
          </p>
        </button>
      </div>

      {/* <div className={styles.suggested}>
        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M7 21V13" />
              <path d="M12 21V9" />
              <path d="M17 21V5" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Draft a strategy memo</h4>
          <p className={styles.promptDesc}>Outline a quarterly plan from your latest goals doc.</p>
        </button>
        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Audit a tech stack</h4>
          <p className={styles.promptDesc}>Find gaps and quick wins for digital transformation.</p>
        </button>
        <button type="button" className={styles.promptCard}>
          <div className={styles.promptIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
            </svg>
          </div>
          <h4 className={styles.promptTitle}>Optimize a workflow</h4>
          <p className={styles.promptDesc}>Cut waste from your ops process in three steps.</p>
        </button>
      </div> */}

      <div className={styles.composerWrap}>{composer}</div>
      <div className={styles.composerHint}>
        Press <kbd>Enter</kbd> to send · <kbd>Shift</kbd> + <kbd>Enter</kbd> for
        new line
      </div>

      {selectedProject && (
        <div className={styles.projectSection}>
          <div className={styles.tabRow}>
            <button
              type="button"
              onClick={() => onProjectHomeTabChange("chats")}
              className={`${styles.tabBtn} ${projectHomeTab === "chats" ? styles.tabBtnActive : ""}`}
            >
              Chats
            </button>
            <button
              type="button"
              onClick={() => onProjectHomeTabChange("sources")}
              className={`${styles.tabBtn} ${projectHomeTab === "sources" ? styles.tabBtnActive : ""}`}
            >
              Sources
            </button>
          </div>

          {projectHomeTab === "chats" ? (
            <div className={styles.convList}>
              {projectRecentConversations.length > 0 ? (
                projectRecentConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onOpenConversation(conversation.id)}
                    className={styles.convItem}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p className={styles.convTitle}>
                        {conversation.pinned ? "📌 " : ""}
                        {conversation.title}
                      </p>
                      <p className={styles.convMeta}>
                        {conversation.messages.length} messages
                      </p>
                    </div>
                    <span className={styles.convDate}>
                      {conversation.updatedAt.toLocaleDateString()}
                    </span>
                  </button>
                ))
              ) : (
                <div className={styles.emptyConv}>
                  This project does not have recent chats yet.
                </div>
              )}
            </div>
          ) : (
            <div className={`${styles.convList} ${styles.emptyConv}`}>
              Sources for this project will appear here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
