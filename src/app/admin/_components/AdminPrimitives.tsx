import { Pencil, Trash2, X } from "lucide-react";
import styles from "./AdminPage.module.css";

export function SidebarButton({
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

export function ManagementTable({
  headers,
  children,
  emptyMessage,
}: {
  headers: string[];
  children: React.ReactNode;
  emptyMessage: string;
}) {
  const childCount = Array.isArray(children)
    ? children.length
    : children
      ? 1
      : 0;

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {headers.map((header) => (
                <th key={header} className={styles.th}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {childCount > 0 ? (
              children
            ) : (
              <tr>
                <td colSpan={headers.length} className={styles.emptyColspan}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DeleteButton({ onClick }: { onClick: () => void }) {
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

export function EditButton({
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

export function BaseModal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={wide ? `${styles.modal} ${styles.modalWide}` : styles.modal}>
        <div className={styles.modalHead}>
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}>
            <X />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

export function ModalField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      {children}
    </div>
  );
}

export function ModalActions({
  onClose,
  submitDisabled = false,
  submitLabel = "Save",
}: {
  onClose: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className={styles.formActions}>
      <button type="button" onClick={onClose} className={styles.btnCancel}>
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitDisabled}
        className={styles.btnSave}
      >
        {submitLabel}
      </button>
    </div>
  );
}
