function SidebarAction({
  icon,
  label,
  caption,
  onClick,
}: {
  icon: React.ReactNode;
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

export default SidebarAction;
