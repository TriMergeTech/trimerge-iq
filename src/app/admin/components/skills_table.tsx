"use client";

import styles from "../AdminPage.module.css";

import type { SkillItem } from "../components/types";
import { DeleteButton, EditButton } from "./buttons";
import ManagementTable from "./management_table";

type SkillsTableProps = {
  skills: SkillItem[];
  loading?: boolean;

  onEdit: (skill: SkillItem) => void;
  onDelete: (skill: SkillItem) => void;
};

export default function SkillsTable({
  skills,
  loading,
  onEdit,
  onDelete,
}: SkillsTableProps) {
  return (
    <ManagementTable
      headers={["Name", "Description", "Created", "Actions"]}
      emptyMessage={loading ? "Loading skills..." : "No skills found."}
    >
      {skills.map((skill) => (
        <tr key={skill._id}>
          <td className={`${styles.td} ${styles.tdName}`}>{skill.name}</td>

          <td className={`${styles.td} ${styles.tdMuted}`}>
            {skill.description}
          </td>

          <td className={`${styles.td} ${styles.tdMuted}`}>
            {new Date(skill.created).toLocaleDateString()}
          </td>

          <td className={`${styles.td} ${styles.tdActions}`}>
            <div className={styles.actionsRow}>
              <EditButton onClick={() => onEdit(skill)} />

              <DeleteButton onClick={() => onDelete(skill)} />
            </div>
          </td>
        </tr>
      ))}
    </ManagementTable>
  );
}
