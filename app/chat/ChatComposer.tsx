"use client";

import type { ChangeEvent, FormEvent, ReactNode, RefObject } from "react";
import {
  FileText,
  Image as ImageIcon,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

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
  setIsAttachmentMenuOpen: (
    value: boolean | ((current: boolean) => boolean),
  ) => void;
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
  const canSubmit =
    (inputMessage.trim().length > 0 || attachedFiles.length > 0) && !isTyping;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const closeAttachmentMenu = () => setIsAttachmentMenuOpen(false);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-[34px] border border-[#d4af37]/34 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(12,17,24,0.94))] px-5 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
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

      <div className="flex items-center gap-3">
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
            className={`interactive-button flex h-12 w-12 items-center justify-center rounded-full border text-white ${isAttachmentMenuOpen ? "border-[#d4af37]/50 bg-[#162235]" : "border-[#d4af37]/30 bg-[#101827]/80 hover:bg-[#13233f]"}`}
          >
            <Plus
              className={`h-6 w-6 transition-transform duration-300 ${isAttachmentMenuOpen ? "rotate-45" : ""}`}
            />
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
          className="interactive-button flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37] text-[#111214] shadow-[0_12px_30px_rgba(212,175,55,0.3)] hover:bg-[#e0bc49] disabled:cursor-not-allowed disabled:opacity-50"
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
