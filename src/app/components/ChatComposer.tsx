"use client";

import type { ChangeEvent, FormEvent, ReactNode, RefObject } from "react";
import { FileText, Image as ImageIcon, Plus, Send, Sparkles } from "lucide-react";

import type { UploadedFile } from "./chatPageTypes";

interface ChatComposerProps {
  attachedFiles: UploadedFile[];
  attachmentMenuRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  imageInputRef: RefObject<HTMLInputElement>;
  inputMessage: string;
  inputTextClassName: string;
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
  inputTextClassName,
  isAttachmentMenuOpen,
  isTyping,
  onFileSelect,
  onInputMessageChange,
  onSubmit,
  setIsAttachmentMenuOpen,
}: ChatComposerProps) {
  const canSubmit = (inputMessage.trim().length > 0 || attachedFiles.length > 0) && !isTyping;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const closeAttachmentMenu = () => setIsAttachmentMenuOpen(false);

  return (
    <form
      onSubmit={handleSubmit}
      className="group relative"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
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

      <div className="mx-auto flex items-center gap-3 rounded-2xl border border-white/[0.13] bg-white/[0.04] px-3 py-2.5 shadow-none backdrop-blur-lg transition group-focus-within:border-[#7c5cff] group-focus-within:shadow-[0_0_0_4px_rgba(124,92,255,0.28)]">
        <div className="relative" ref={attachmentMenuRef}>
          {isAttachmentMenuOpen && (
            <div className="absolute bottom-[calc(100%+14px)] left-0 z-20 w-64 rounded-2xl border border-white/[0.13] bg-[#0b111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
              <SidebarAction
                icon={<ImageIcon className="h-5 w-5" />}
                label="Upload photos"
                caption="Add images to your message"
                onClick={() => {
                  imageInputRef.current?.click();
                  closeAttachmentMenu();
                }}
              />
              <SidebarAction
                icon={<FileText className="h-5 w-5" />}
                label="Upload files"
                caption="Attach documents and spreadsheets"
                onClick={() => {
                  fileInputRef.current?.click();
                  closeAttachmentMenu();
                }}
              />
              <SidebarAction
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
            className={`interactive-button flex h-10 w-10 items-center justify-center rounded-full border text-[#e6e9f5] shadow-none ${isAttachmentMenuOpen ? "border-[#7c5cff]/42 bg-[#7c5cff]/15 text-[#a78bfa]" : "border-white/[0.13] bg-white/[0.05] hover:border-[#7c5cff]/35 hover:bg-[#7c5cff]/15 hover:text-[#a78bfa]"}`}
          >
            <Plus className={`h-[18px] w-[18px] transition-transform duration-300 ${isAttachmentMenuOpen ? "rotate-45" : ""}`} />
          </button>
        </div>

        <input
          type="text"
          value={inputMessage}
          onChange={(event) => onInputMessageChange(event.target.value)}
          placeholder="Ask anything"
          className={inputTextClassName}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="interactive-button flex h-11 w-11 items-center justify-center rounded-xl border border-transparent bg-[#2e2bff] text-white shadow-[0_8px_20px_rgba(46,43,255,0.35)] hover:bg-[#2120e0] hover:shadow-[0_12px_28px_rgba(46,43,255,0.45)] disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-white/32 disabled:shadow-none"
        >
          <Send className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="mt-3 text-center font-sans text-xs text-[#7a80a3]">
        Press <kbd className="rounded border border-white/[0.13] bg-white/[0.06] px-1.5 py-px text-[11px] text-[#e6e9f5]">Enter</kbd> to send
      </div>
    </form>
  );
}
function SidebarAction({
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
      className="interactive-button flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white hover:bg-[#162235]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7c5cff]/25 bg-[#101827] text-[#a78bfa]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-[#d8dbe3]/42">{caption}</span>
      </span>
    </button>
  );
}
