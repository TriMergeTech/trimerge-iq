"use client";

import type { ReactNode } from "react";

interface ConversationMenuItemProps {
  danger?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export default function ConversationMenuItem({
  danger = false,
  icon,
  label,
  onClick,
}: ConversationMenuItemProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={`interactive-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white hover:bg-[#162235]"}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-current">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
