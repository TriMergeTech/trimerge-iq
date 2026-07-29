"use client";

import {
  Building2,
  Briefcase,
  LogOut,
  Plus,
  Search,
  Shield,
  User,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import styles from "./AdminPage.module.css";
import AdminModalHost from "./AdminModalHost";
import { SidebarButton } from "./AdminPrimitives";
import AdminSectionContent from "./AdminSectionContent";
import type { AdminSection } from "./adminTypes";
import { useAdminPageController } from "./useAdminPageController";

interface AdminPageProps {
  onLogout: () => void;
}

const SECTION_META: Record<
  AdminSection,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    addLabel: string;
  }
> = {
  company_overview: {
    label: "Company Overview",
    icon: Users,
    addLabel: "Add New",
  },
  skills: { label: "Skills Management", icon: Wrench, addLabel: "Add New" },
  platforms: {
    label: "Platforms Management",
    icon: Wrench,
    addLabel: "Add New",
  },
  position: { label: "Position Management", icon: User, addLabel: "Add New" },
  staff: { label: "Staff Management", icon: Users, addLabel: "Add New" },
  services: {
    label: "Services Management",
    icon: Briefcase,
    addLabel: "Add New",
  },
  clients: {
    label: "Clients Management",
    icon: Building2,
    addLabel: "Add New",
  },
  admin: { label: "Admin Management", icon: UserCog, addLabel: "Add New" },
};

export default function AdminPage({ onLogout }: AdminPageProps) {
  const admin = useAdminPageController();
  const activeSectionMeta = SECTION_META[admin.activeSection];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            <Shield />
          </div>
          <div>
            <div className={styles.userName}>{admin.loggedInName}</div>
            <div className={styles.userRole}>
              Backend role: {admin.loggedInProfile}
            </div>
          </div>
        </div>

        <nav className={styles.navList}>
          {(Object.keys(SECTION_META) as AdminSection[]).map((section) => {
            const item = SECTION_META[section];
            return (
              <SidebarButton
                key={section}
                active={admin.activeSection === section}
                icon={item.icon}
                label={item.label}
                onClick={() => {
                  admin.setActiveSection(section);
                  admin.setSearchQuery("");
                }}
              />
            );
          })}
        </nav>

        <div className={styles.sideBottom}>
          <div className={styles.session}>
            <div className={styles.sessionLabel}>Logged in as</div>
            <div className={styles.sessionEmail}>{admin.loggedInEmail}</div>
            <div className={styles.sessionRole}>{admin.loggedInProfile}</div>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={onLogout}>
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.pageHead}>
          <div className={styles.headRow}>
            <div>
              <h1 className={styles.pageTitle}>{activeSectionMeta.label}</h1>
              <p className={styles.pageSub}>
                Manage {admin.activeCount} registry entries
              </p>
            </div>
            <button
              type="button"
              onClick={admin.openCreateModal}
              disabled={admin.activeSection === "admin"}
              className={styles.addBtn}
            >
              <Plus />
              <span>
                {admin.activeSection === "admin"
                  ? "View Only"
                  : activeSectionMeta.addLabel}
              </span>
            </button>
          </div>

          <div className={styles.searchRow}>
            <Search />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search..."
              value={admin.searchQuery}
              onChange={(event) => admin.setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <AdminSectionContent
          activeSection={admin.activeSection}
          adminMembers={admin.adminMembers}
          clientError={admin.clientError}
          clients={admin.clients}
          companyDetails={admin.company_details}
          detailError={admin.detail_error}
          filteredAdmins={admin.filteredAdmins}
          filteredClients={admin.filteredClients}
          filteredPositions={admin.filteredPositions}
          filteredServices={admin.filteredServices}
          filteredSkills={admin.filteredSkills}
          filteredStaff={admin.filteredStaff}
          isLoadingClients={admin.isLoadingClients}
          isLoadingDetail={admin.is_loading_detail}
          isLoadingPlatforms={admin.is_loading_platforms}
          isLoadingPositions={admin.isLoadingPositions}
          isLoadingServices={admin.isLoadingServices}
          isLoadingSkillDetails={admin.isLoadingSkillDetails}
          isLoadingSkills={admin.isLoadingSkills}
          isLoadingStaff={admin.isLoadingStaff}
          isLoadingUsers={admin.isLoadingUsers}
          openEditClientModal={admin.openEditClientModal}
          openEditDetailModal={admin.open_edit_detail_modal}
          openEditPlatformModal={admin.open_edit_platform_modal}
          openEditPositionModal={admin.openEditPositionModal}
          openEditSkillModal={admin.openEditSkillModal}
          openEditStaffModal={admin.openEditStaffModal}
          platforms={admin.platforms}
          positionError={admin.positionError}
          positions={admin.positions}
          removeClient={admin.removeClient}
          removeDetail={admin.remove_detail}
          removePlatform={admin.remove_platform}
          removePosition={admin.removePosition}
          removeService={admin.removeService}
          removeSkill={admin.removeSkill}
          removeStaff={admin.removeStaff}
          serviceError={admin.serviceError}
          skillError={admin.skillError}
          skills={admin.skills}
          staffError={admin.staffError}
          toolsError={admin.tools_error}
          userError={admin.userError}
        />
      </div>

      <AdminModalHost
        certifications={admin.certifications}
        editingClient={admin.editingClient}
        editingDetail={admin.editing_detail}
        editingPlatform={admin.editing_platform}
        editingPosition={admin.editingPosition}
        editingSkill={admin.editingSkill}
        editingStaff={admin.editingStaff}
        isSavingClient={admin.isSavingClient}
        isSavingDetail={admin.is_saving_detail}
        isSavingPlatform={admin.is_saving_platform}
        isSavingPosition={admin.isSavingPosition}
        isSavingService={admin.isSavingService}
        isSavingSkill={admin.isSavingSkill}
        isSavingStaff={admin.isSavingStaff}
        onAddAdmin={admin.addAdminMember}
        onCloseClient={admin.closeClientModal}
        onCloseDetail={admin.closeDetailModal}
        onCloseModal={() => admin.setOpenModal(null)}
        onClosePlatform={admin.closePlatformModal}
        onClosePosition={admin.closePositionModal}
        onCloseSkill={admin.closeSkillModal}
        onCloseStaff={admin.closeStaffModal}
        onSaveClient={(payload) => void admin.saveClient(payload)}
        onSaveDetail={(payload) => void admin.save_detail(payload)}
        onSavePlatform={(payload) => void admin.save_platform(payload)}
        onSavePosition={(payload) => void admin.savePosition(payload)}
        onSaveService={(payload) => void admin.saveService(payload)}
        onSaveSkill={(payload) => void admin.saveSkill(payload)}
        onSaveStaff={(payload) => void admin.saveStaff(payload)}
        openModal={admin.openModal}
        positions={admin.positions}
        skills={admin.skills}
        staffMembers={admin.staffMembers}
      />
    </div>
  );
}