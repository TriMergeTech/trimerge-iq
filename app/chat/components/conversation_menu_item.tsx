function ConversationMenuItem({
  emoji,
  label,
  onClick,
  danger = false,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`interactive-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white hover:bg-[#162235]"}`}
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

export default ConversationMenuItem;
