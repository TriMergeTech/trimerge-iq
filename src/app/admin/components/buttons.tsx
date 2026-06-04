function SidebarButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
      }
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
    >
      <Trash2 />
    </button>
  );
}

function EditButton({
  disabled = false,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={styles.iconBtn}
    >
      <Pencil />
    </button>
  );
}

export { SidebarButton, DeleteButton, EditButton };
