"use client";

import { Check, Pencil, X } from "lucide-react";

interface RenameDialogProps {
  error?: string;
  isSaving?: boolean;
  label: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  value: string;
}

export default function RenameDialog({
  error = "",
  isSaving = false,
  label,
  onChange,
  onClose,
  onSubmit,
  title,
  value,
}: RenameDialogProps) {
  const trimmedValue = value.trim();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-4 backdrop-blur-sm">
      <div className="w-full max-w-[460px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,27,39,0.98),rgba(10,15,23,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_30px_90px_rgba(0,0,0,0.52)] animate-fade-rise">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/22 bg-[#d4af37]/10 text-[#f4df91]">
              <Pencil className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d98a]/58">{label}</p>
              <h2 className="mt-1 truncate text-[19px] font-medium tracking-tight text-white">{title}</h2>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close rename dialog"
            onClick={onClose}
            disabled={isSaving}
            className="interactive-button flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/78 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="block text-sm font-semibold text-white/82" htmlFor="rename-dialog-input">
            Name
          </label>
          <input
            id="rename-dialog-input"
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="interactive-input mt-3 w-full rounded-[18px] border border-white/[0.08] bg-black/[0.18] px-4 py-3.5 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035),inset_0_-1px_0_rgba(0,0,0,0.20)] outline-none placeholder:text-[#c5c9d3]/40 focus:border-[#d4af37]/42 focus:bg-[#101827]/75 focus:ring-2 focus:ring-[#d4af37]/10"
            placeholder="Enter a clear name"
          />
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="interactive-button rounded-full border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white/68 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !trimmedValue}
              className="interactive-button flex items-center gap-2 rounded-full border border-[#f1d46a]/24 bg-[linear-gradient(180deg,#e2be4b,#c79d22)] px-5 py-2.5 text-sm font-semibold text-[#111214] shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_28px_rgba(212,175,55,0.22)] hover:bg-[linear-gradient(180deg,#edcb62,#d4af37)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-none disabled:bg-white/[0.07] disabled:text-white/32 disabled:shadow-none"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
