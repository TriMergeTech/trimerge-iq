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
      className="group relative rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,25,38,0.90),rgba(10,15,23,0.94))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),inset_0_-1px_0_rgba(0,0,0,0.24),0_22px_56px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition focus-within:border-[#d4af37]/34 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(212,175,55,0.08),0_24px_64px_rgba(0,0,0,0.30)]"
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

      <div className="flex items-center gap-3 rounded-[22px] border border-white/[0.055] bg-black/[0.10] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition group-focus-within:border-white/[0.09] group-focus-within:bg-black/[0.14]">
        <div className="relative" ref={attachmentMenuRef}>
          {isAttachmentMenuOpen && (
            <div className="absolute bottom-[calc(100%+14px)] left-0 z-20 w-64 rounded-3xl border border-[#d4af37]/26 bg-[#0b111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-fade-rise">
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
            className={`interactive-button flex h-11 w-11 items-center justify-center rounded-full border text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] ${isAttachmentMenuOpen ? "border-[#d4af37]/42 bg-white/[0.08]" : "border-white/[0.075] bg-white/[0.035] hover:border-[#d4af37]/26 hover:bg-white/[0.07]"}`}
          >
            <Plus className={`h-6 w-6 transition-transform duration-300 ${isAttachmentMenuOpen ? "rotate-45" : ""}`} />
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
          className="interactive-button flex h-12 w-12 items-center justify-center rounded-full border border-[#f1d46a]/24 bg-[linear-gradient(180deg,#e2be4b,#c79d22)] text-[#111214] shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_28px_rgba(212,175,55,0.26)] hover:bg-[linear-gradient(180deg,#edcb62,#d4af37)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-none disabled:bg-white/[0.07] disabled:text-white/32 disabled:shadow-none"
        >
          <Send className="h-5 w-5" />
        </button>
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
      className="interactive-button flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white hover:bg-[#162235]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d4af37]/18 bg-[#101827] text-[#f2e7bb]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-[#d8dbe3]/42">{caption}</span>
      </span>
    </button>
  );
}
