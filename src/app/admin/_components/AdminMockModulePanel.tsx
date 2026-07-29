import { mockAdminModules } from "./adminMockModules";
import { ManagementTable } from "./AdminPrimitives";
import styles from "./AdminPage.module.css";
import type { AdminSection } from "./adminTypes";

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

  const query = searchQuery.trim().toLowerCase();
  const filteredRows = query
    ? mockModule.rows.filter((row) =>
        Object.values(row).some((value) => value.toLowerCase().includes(query)),
      )
    : mockModule.rows;
  const rowHeaders = Array.from(
    new Set(filteredRows.flatMap((row) => Object.keys(row))),
  ).slice(0, 6);

  return (
    <div className={styles.mockModule}>
      <div className={styles.mockModuleHeader}>
        <div>
          <span className={styles.mockBadge}>Mockup</span>
          <h2 className={styles.mockTitle}>{mockModule.title}</h2>
          <p className={styles.mockPurpose}>{mockModule.purpose}</p>
        </div>
        <div className={styles.mockStats}>
          <span>{mockModule.fields.length} fields</span>
          <span>{mockModule.rows.length} seed records</span>
        </div>
      </div>

      <div className={styles.mockFieldList}>
        {mockModule.fields.map((field) => (
          <span key={field} className={styles.mockField}>
            {field}
          </span>
        ))}
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
          </tr>
        ))}
      </ManagementTable>

      {mockModule.note && <p className={styles.mockNote}>{mockModule.note}</p>}
    </div>
  );
}
