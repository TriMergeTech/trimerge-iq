import { mockAdminModules } from "./adminMockModules";
import {
  ManagementTable,
  BaseModal,
  ModalField,
  ModalActions,
  EditButton,
} from "./AdminPrimitives";
import styles from "./AdminPage.module.css";
import type { AdminSection } from "./adminTypes";
import { useMemo, useState } from "react";

interface AdminMockModulePanelProps {
  activeSection: AdminSection;
  searchQuery: string;
}

export default function AdminMockModulePanel({
  activeSection,
  searchQuery,
}: AdminMockModulePanelProps) {
  const mockModule = mockAdminModules[activeSection];
  if (!mockModule) return null;

  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  const initialModule = useMemo(
    () => ({ ...mockModule, rows: [...mockModule.rows] }),
    [mockModule],
  );
  const [moduleData, setModuleData] = useState(initialModule);

  const query = searchQuery.trim().toLowerCase();
  const filteredRows = query
    ? moduleData.rows.filter((row) =>
        Object.values(row).some((value) => value.toLowerCase().includes(query)),
      )
    : moduleData.rows;

  const rowHeaders = Array.from(
    new Set(filteredRows.flatMap((row) => Object.keys(row))),
  ).slice(0, 6);

  function RowEditModal({
    index,
    onClose,
    onSave,
  }: {
    index: number;
    onClose: () => void;
    onSave: (updated: Record<string, string>) => void;
  }) {
    const row = moduleData.rows[index];
    const [local, setLocal] = useState<Record<string, string>>({ ...row });

    return (
      <BaseModal title={`Edit record ${index + 1}`} onClose={onClose} wide>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(local);
          }}
        >
          {rowHeaders.map((header) => (
            <ModalField key={header} label={header}>
              <input
                type="text"
                value={local[header] ?? ""}
                onChange={(ev) =>
                  setLocal((cur) => ({ ...cur, [header]: ev.target.value }))
                }
                className={styles.formInput}
              />
            </ModalField>
          ))}

          <ModalActions onClose={onClose} submitLabel="Save" />
        </form>
      </BaseModal>
    );
  }

  return (
    <div className={styles.mockModule}>
      <div className={styles.mockModuleHeader}>
        <div>
          <span className={styles.mockBadge}>Mockup</span>
          {editing ? (
            <div>
              <input
                value={moduleData.title}
                onChange={(e) =>
                  setModuleData((cur) => ({ ...cur, title: e.target.value }))
                }
                className={styles.formInput}
              />
              <textarea
                value={moduleData.purpose}
                onChange={(e) =>
                  setModuleData((cur) => ({ ...cur, purpose: e.target.value }))
                }
                className={styles.formTextarea}
                rows={3}
              />
            </div>
          ) : (
            <>
              <h2 className={styles.mockTitle}>{moduleData.title}</h2>
              <p className={styles.mockPurpose}>{moduleData.purpose}</p>
            </>
          )}
        </div>
        <div className={styles.mockStats}>
          <span>{moduleData.fields.length} fields</span>
          <span>{moduleData.rows.length} seed records</span>
        </div>
      </div>

      <div className={styles.mockFieldList}>
        {editing ? (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Fields (comma-separated)</label>
            <input
              value={moduleData.fields.join(", ")}
              onChange={(e) =>
                setModuleData((cur) => ({
                  ...cur,
                  fields: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              className={styles.formInput}
            />
          </div>
        ) : (
          moduleData.fields.map((field) => (
            <span key={field} className={styles.mockField}>
              {field}
            </span>
          ))
        )}
      </div>

      <div className={styles.mockActionsRow}>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={styles.btnSecondary}
        >
          {editing ? "Stop editing" : "Edit module"}
        </button>

        <button
          type="button"
          onClick={async () => {
            setIsSaving(true);
            try {
              await fetch(`/api/admin/mock-modules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  section: moduleData.id,
                  module: moduleData,
                }),
              });
              // optimistic: keep saved state
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error("Failed to save mock module", err);
            } finally {
              setIsSaving(false);
              setEditing(false);
            }
          }}
          className={styles.btnPrimary}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save to backend"}
        </button>
      </div>

      <ManagementTable
        headers={rowHeaders}
        emptyMessage="No mock records match your search."
      >
        {filteredRows.map((row, index) => (
          <tr key={`${mockModule.id}-${index}`}>
            {rowHeaders.map((header) => (
              <td
                key={`${mockModule.id}-${index}-${header}`}
                className={`${styles.td} ${index === 0 ? styles.tdName : ""}`}
              >
                {row[header] ?? ""}
              </td>
            ))}
            {editing && (
              <td className={styles.td}>
                <div className={styles.rowActions}>
                  <EditButton onClick={() => setEditingRowIndex(index)} />
                </div>
              </td>
            )}
          </tr>
        ))}
      </ManagementTable>

      {editing && (
        <div className={styles.mockActionsRow}>
          <button
            type="button"
            onClick={() =>
              setModuleData((cur) => ({
                ...cur,
                rows: [
                  ...cur.rows,
                  Object.fromEntries(rowHeaders.map((h) => [h, ""])),
                ],
              }))
            }
            className={styles.btnSecondary}
          >
            + Add record
          </button>
        </div>
      )}

      {editingRowIndex !== null && (
        <RowEditModal
          index={editingRowIndex}
          onClose={() => setEditingRowIndex(null)}
          onSave={(updated) => {
            setModuleData((cur) => ({
              ...cur,
              rows: cur.rows.map((r, i) =>
                i === editingRowIndex ? updated : r,
              ),
            }));
            setEditingRowIndex(null);
          }}
        />
      )}

      {mockModule.note && <p className={styles.mockNote}>{mockModule.note}</p>}
    </div>
  );
}
