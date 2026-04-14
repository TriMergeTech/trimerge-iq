function ActionIconButton({ color, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${
        color === "blue"
          ? "text-[#1e5ba8] hover:bg-blue-50"
          : "text-red-600 hover:bg-red-50"
      }`}
    >
      {children}
    </button>
  );
}

export default ActionIconButton;
