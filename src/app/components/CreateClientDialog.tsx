"use client";

import { Building2, Loader2, X } from "lucide-react";

interface CreateClientDialogProps {
  about: string;
  error: string;
  isSaving: boolean;
  name: string;
  onAboutChange: (value: string) => void;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
}

export default function CreateClientDialog({
  about,
  error,
  isSaving,
  name,
  onAboutChange,
  onClose,
  onNameChange,
  onSubmit,
}: CreateClientDialogProps) {
  const canSubmit = Boolean(name.trim()) && Boolean(about.trim()) && !isSaving;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,27,39,0.98),rgba(10,15,23,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_30px_90px_rgba(0,0,0,0.52)] animate-fade-rise">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/22 bg-[#d4af37]/10 text-[#f4df91]">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/58">New client</p>
              <h2 className="mt-1 text-[19px] font-medium tracking-tight text-white">Create client</h2>
              <p className="mt-1 text-sm leading-6 text-white/52">Add a backend client and select it for this project.</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close create client dialog"
            onClick={onClose}
            className="interactive-button flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/78 hover:bg-white/[0.07]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="client-name" className="mb-2 block text-sm font-medium text-white/88">
              Client name
            </label>
            <input
              id="client-name"
              autoFocus
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Acme Holdings"
              className="interactive-input w-full rounded-[16px] border border-white/[0.08] bg-black/[0.18] px-4 py-3 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none placeholder:text-white/30 focus:border-[#d4af37]/38 focus:ring-2 focus:ring-[#d4af37]/10"
            />
          </div>

          <div>
            <label htmlFor="client-about" className="mb-2 block text-sm font-medium text-white/88">
              About
            </label>
            <textarea
              id="client-about"
              value={about}
              onChange={(event) => onAboutChange(event.target.value)}
              placeholder="Short context about the client."
              rows={4}
              className="interactive-input w-full resize-none rounded-[16px] border border-white/[0.08] bg-black/[0.18] px-4 py-3 text-[15px] leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none placeholder:text-white/30 focus:border-[#d4af37]/38 focus:ring-2 focus:ring-[#d4af37]/10"
            />
          </div>

          {error && (
            <div className="rounded-[14px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/[0.07] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="interactive-button rounded-full border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white/68 hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="interactive-button flex items-center gap-2 rounded-full border border-[#f1d46a]/24 bg-[linear-gradient(180deg,#e2be4b,#c79d22)] px-5 py-2.5 text-sm font-semibold text-[#111214] shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_28px_rgba(212,175,55,0.22)] hover:bg-[linear-gradient(180deg,#edcb62,#d4af37)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-none disabled:bg-white/[0.07] disabled:text-white/32 disabled:shadow-none"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create client
          </button>
        </div>
      </div>
    </div>
  );
}

