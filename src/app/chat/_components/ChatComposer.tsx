"use client";

import type { ChangeEvent, FormEvent, ReactNode, RefObject } from "react";
import { FileText, Image as ImageIcon, Plus, Send, Sparkles } from "lucide-react";

import type { UploadedFile } from "./chatPageTypes";
import styles from "./ChatComposer.module.css";

interface ChatComposerProps {
  attachedFiles: UploadedFile[];
  attachmentMenuRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  imageInputRef: RefObject<HTMLInputElement>;
  inputMessage: string;
  isAttachmentMenuOpen: boolean;
  isTyping: boolean;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputMessageChange: (value: string) => void;
  onSubmit: () => void;
  setIsAttachmentMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
}

export default function ChatComposer({
  attachedFiles,
  attachmentMenuRef,
  fileInputRef,
  imageInputRef,
  inputMessage,
  isAttachmentMenuOpen,
  isTyping,
  onFileSelect,
  onInputMessageChange,
  onSubmit,
  setIsAttachmentMenuOpen,
}: ChatComposerProps) {
  const hasPendingRfp = attachedFiles.some((file) => file.extractionStatus === "pending");
  const hasErroredRfp = attachedFiles.some((file) => file.extractionStatus === "error");
  const hasUnprocessedRfp = hasPendingRfp || hasErroredRfp;
  const canSubmit =
    (inputMessage.trim().length > 0 || attachedFiles.length > 0) &&
    !isTyping &&
    !hasUnprocessedRfp;
  const sendButtonLabel = hasPendingRfp
    ? "Wait for RFP extraction to finish"
    : hasErroredRfp
      ? "Remove failed RFP before sending"
      : "Send message";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  };

  const closeAttachmentMenu = () => setIsAttachmentMenuOpen(false);

  return (
    <form onSubmit={handleSubmit} className={styles.composer}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf"
        onChange={onFileSelect}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*"
        onChange={onFileSelect}
      />

      <div className={styles.attachMenuWrap} ref={attachmentMenuRef}>
          {isAttachmentMenuOpen && (
            <div className={styles.attachMenu}>
              <AttachMenuItem
                icon={<ImageIcon className="h-5 w-5" />}
                label="Upload photos"
                caption="Add images to your message"
                onClick={() => {
                  imageInputRef.current?.click();
                  closeAttachmentMenu();
                }}
              />
              <AttachMenuItem
                icon={<FileText className="h-5 w-5" />}
                label="Upload an RFP"
                caption="Attach a PDF opportunity document"
                onClick={() => {
                  fileInputRef.current?.click();
                  closeAttachmentMenu();
                }}
              />
              <AttachMenuItem
                icon={<Sparkles className="h-5 w-5" />}
                label="Create prompt"
                caption="Insert a suggested request"
                onClick={() => {
                  onInputMessageChange("Help me create a client-ready plan.");
                  closeAttachmentMenu();
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsAttachmentMenuOpen((current) => !current)}
            className={`${styles.attach} ${isAttachmentMenuOpen ? styles.attachOpen : ""}`}
          >
            <Plus className={`${styles.attachIcon} ${isAttachmentMenuOpen ? styles.attachIconOpen : ""}`} />
          </button>
      </div>

      {attachedFiles.length > 0 && (
        <span className={`${styles.attachmentBadge} ${hasErroredRfp ? styles.attachmentBadgeError : ""}`}>
          {hasErroredRfp
            ? "RFP error"
            : hasPendingRfp
              ? "Extracting RFP"
              : attachedFiles.length === 1
                ? "RFP ready"
                : `${attachedFiles.length} RFPs ready`}
        </span>
      )}

      <input
        type="text"
        value={inputMessage}
        onChange={(event) => onInputMessageChange(event.target.value)}
        placeholder="Ask anything"
        className={styles.input}
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className={styles.send}
        aria-label={sendButtonLabel}
        title={sendButtonLabel}
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}

function AttachMenuItem({
  icon,
  label,
  caption,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  caption: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.menuItem}
    >
      <span className={styles.menuIcon}>
        {icon}
      </span>
      <span>
        <span className={styles.menuLabel}>{label}</span>
        <span className={styles.menuCaption}>{caption}</span>
      </span>
    </button>
  );
}
