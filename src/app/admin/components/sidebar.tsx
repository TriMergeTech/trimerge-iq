// components/AdminSidebar.tsx

"use client";

import {
  Building2,
  Briefcase,
  LogOut,
  Shield,
  User,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import styles from "../AdminPage.module.css";
import type { AdminSection } from "./types";

const SECTION_META: Record<
  AdminSection,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  skills: { label: "Skills Management", icon: Wrench },
  position: { label: "Position Management", icon: User },
  staff: { label: "Staff Management", icon: Users },
  services: { label: "Services Management", icon: Briefcase },
  clients: { label: "Clients Management", icon: Building2 },
  admin: { label: "Admin Management", icon: UserCog },
};

type Props = {
  activeSection: AdminSection;
  loggedInName: string;
  loggedInEmail: string;
  loggedInProfile: string;
  onLogout: () => void;
  onSectionChange: (section: AdminSection) => void;
};

export default function AdminSidebar({
  activeSection,
  loggedInName,
  loggedInEmail,
  loggedInProfile,
  onLogout,
  onSectionChange,
}: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.userCard}>
        <div className={styles.userAvatar}>
          <Shield />
        </div>

        <div>
          <div className={styles.userName}>{loggedInName}</div>

          <div className={styles.userRole}>Backend role: {loggedInProfile}</div>
        </div>
      </div>

      <nav className={styles.navList}>
        {(Object.keys(SECTION_META) as AdminSection[]).map((section) => {
          const item = SECTION_META[section];
          const Icon = item.icon;

          return (
            <button
              key={section}
              type="button"
              className={
                activeSection === section
                  ? styles.sidebarBtnActive
                  : styles.sidebarBtn
              }
              onClick={() => onSectionChange(section)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.sideBottom}>
        <div className={styles.session}>
          <div className={styles.sessionLabel}>Logged in as</div>

          <div className={styles.sessionEmail}>{loggedInEmail}</div>

          <div className={styles.sessionRole}>{loggedInProfile}</div>
        </div>

        <button type="button" className={styles.logoutBtn} onClick={onLogout}>
          <LogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}
