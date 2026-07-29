import { ManagementTable, DeleteButton, EditButton } from "./AdminPrimitives";
import AdminMockModulePanel from "./AdminMockModulePanel";
import styles from "./AdminPage.module.css";
import type {
  AdminSection,
  ClientItem,
  PositionItem,
  ServiceItem,
  SkillItem,
  StaffMember,
} from "./adminTypes";

interface AdminSectionContentProps {
  activeSection: AdminSection;
  adminMembers: StaffMember[];
  clientError: string;
  clients: ClientItem[];
  companyDetails: any[];
  detailError: string;
  filteredAdmins: StaffMember[];
  filteredClients: ClientItem[];
  filteredPositions: PositionItem[];
  filteredServices: ServiceItem[];
  filteredSkills: SkillItem[];
  filteredStaff: StaffMember[];
  isLoadingClients: boolean;
  isLoadingDetail: boolean;
  isLoadingPlatforms: boolean;
  isLoadingPositions: boolean;
  isLoadingServices: boolean;
  isLoadingSkillDetails: boolean;
  isLoadingSkills: boolean;
  isLoadingStaff: boolean;
  isLoadingUsers: boolean;
  openEditClientModal: (clientId: string) => void;
  openEditDetailModal: (detail: any) => void;
  openEditPlatformModal: (platform: any) => void;
  openEditPositionModal: (positionId: string) => void;
  openEditSkillModal: (skill: SkillItem) => void;
  openEditStaffModal: (staffId: string) => void;
  platforms: any[];
  positionError: string;
  positions: PositionItem[];
  removeClient: (clientId: string) => void;
  removeDetail: (detailId: string) => void;
  removePlatform: (platformId: string) => void;
  removePosition: (positionId: string) => void;
  removeService: (serviceId: string) => void;
  removeSkill: (skillId: string) => void;
  removeStaff: (staffId: string) => void;
  searchQuery: string;
  serviceError: string;
  skillError: string;
  skills: SkillItem[];
  staffError: string;
  toolsError: string;
  userError: string;
}

export default function AdminSectionContent({
  activeSection,
  adminMembers,
  clientError,
  clients,
  companyDetails,
  detailError,
  filteredAdmins,
  filteredClients,
  filteredPositions,
  filteredServices,
  filteredSkills,
  filteredStaff,
  isLoadingClients,
  isLoadingDetail,
  isLoadingPlatforms,
  isLoadingPositions,
  isLoadingServices,
  isLoadingSkillDetails,
  isLoadingSkills,
  isLoadingStaff,
  isLoadingUsers,
  openEditClientModal,
  openEditDetailModal,
  openEditPlatformModal,
  openEditPositionModal,
  openEditSkillModal,
  openEditStaffModal,
  platforms,
  positionError,
  positions,
  removeClient,
  removeDetail,
  removePlatform,
  removePosition,
  removeService,
  removeSkill,
  removeStaff,
  searchQuery,
  serviceError,
  skillError,
  skills,
  staffError,
  toolsError,
  userError,
}: AdminSectionContentProps) {
  return (
    <div className={styles.content}>
      {activeSection === "skills" && skillError && (
        <div className={styles.errorBanner}>{skillError}</div>
      )}
      {activeSection === "position" && positionError && (
        <div className={styles.errorBanner}>{positionError}</div>
      )}
      {activeSection === "services" && serviceError && (
        <div className={styles.errorBanner}>{serviceError}</div>
      )}
      {activeSection === "clients" && clientError && (
        <div className={styles.errorBanner}>{clientError}</div>
      )}
      {activeSection === "staff" && staffError && (
        <div className={styles.errorBanner}>{staffError}</div>
      )}
      {activeSection === "admin" && userError && (
        <div className={styles.infoBanner}>{userError}</div>
      )}
      {activeSection === "company_overview" && detailError && (
        <div className={styles.infoBanner}>{detailError}</div>
      )}
      {activeSection === "platforms" && toolsError && (
        <div className={styles.infoBanner}>{toolsError}</div>
      )}

      <AdminMockModulePanel activeSection={activeSection} searchQuery={searchQuery} />

      {[
        "projects",
        "contracts",
        "corporate_experience",
        "opportunities",
        "partners",
        "proposals",
        "business_operations",
        "lessons_learned",
        "methodologies",
      ].includes(activeSection) && (
        <div className={styles.infoBanner}>
          This is a frontend mockup page for supervisor review. These records are not connected to backend create,
          edit, or delete endpoints yet.
        </div>
      )}

      {activeSection === "staff" && (
        <ManagementTable
          headers={["Fullname", "Email", "Position", "Created", "Actions"]}
          emptyMessage={isLoadingStaff ? "Loading staff..." : "No staff members found."}
        >
          {filteredStaff.map((member) => (
            <tr key={member._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{member.fullname ?? member.name}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{member.email}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                {positions.find((p) => p._id === (member.positionId ?? member.position))?.title ?? "Unassigned"}
              </td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                {new Date(member.created ?? member.createdAt ?? "").toLocaleDateString()}
              </td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <div className={styles.actionsRow}>
                  <EditButton onClick={() => openEditStaffModal(member._id)} />
                  <DeleteButton onClick={() => void removeStaff(member._id)} />
                </div>
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "admin" && (
        <ManagementTable
          headers={["Name", "Email", "Created"]}
          emptyMessage={isLoadingUsers ? "Loading admins..." : "No admin members found."}
        >
          {filteredAdmins.map((member) => (
            <tr key={member._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{member.fullname ?? member.name}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{member.email}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                {new Date(member.created ?? member.createdAt ?? "").toLocaleDateString()}
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "platforms" && (
        <ManagementTable
          headers={["Title", "Description", "URL", "Created", "Actions"]}
          emptyMessage={isLoadingPlatforms ? "Loading platforms..." : "No platforms found."}
        >
          {platforms.map((platform) => (
            <tr key={platform._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{platform.name}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{platform.description}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                <a href={platform.url} target="_blank">
                  {platform.url}
                </a>
              </td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{new Date(platform.created).toLocaleDateString()}</td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <div className={styles.actionsRow}>
                  <EditButton disabled={isLoadingPlatforms} onClick={() => void openEditPlatformModal(platform)} />
                  <DeleteButton onClick={() => void removePlatform(platform._id)} />
                </div>
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "skills" && (
        <ManagementTable
          headers={["Title", "Description", "Created", "Actions"]}
          emptyMessage={isLoadingSkills ? "Loading skills..." : "No skills found."}
        >
          {filteredSkills.map((skill) => (
            <tr key={skill._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{skill.title ?? skill.name}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{skill.description}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                {new Date(skill.created ?? skill.createdAt ?? "").toLocaleDateString()}
              </td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <div className={styles.actionsRow}>
                  <EditButton disabled={isLoadingSkillDetails} onClick={() => void openEditSkillModal(skill)} />
                  <DeleteButton onClick={() => void removeSkill(skill._id)} />
                </div>
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "company_overview" && (
        <ManagementTable
          headers={["Title", "Detail", "Created", "Actions"]}
          emptyMessage={isLoadingDetail ? "Loading details..." : "No details found."}
        >
          {companyDetails.map((detail) => (
            <tr key={detail._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{detail.title}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{detail.detail}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{new Date(detail.created).toLocaleDateString()}</td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <div className={styles.actionsRow}>
                  <EditButton disabled={isLoadingDetail} onClick={() => void openEditDetailModal(detail)} />
                  <DeleteButton onClick={() => void removeDetail(detail._id)} />
                </div>
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "services" && (
        <ManagementTable
          headers={["Title", "Description", "Skills", "Positions", "Created", "Actions"]}
          emptyMessage={isLoadingServices ? "Loading services..." : "No services found."}
        >
          {filteredServices.map((service) => (
            <tr key={service._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{service.title ?? service.name}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{service.description}</td>
              <td className={styles.td}>
                <div className={styles.pillsWrap}>
                  {(service.skills?.length ?? 0) > 0 ? (
                    service.skills!.map((skillId) => {
                      const skill = skills.find((s) => s._id === skillId);
                      if (!skill) return null;
                      return (
                        <span key={skillId} className={styles.pill}>
                          {skill.title ?? skill.name}
                        </span>
                      );
                    })
                  ) : (
                    <span className={styles.tdMuted}>None</span>
                  )}
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.pillsWrap}>
                  {(service.positions?.length ?? 0) > 0 ? (
                    service.positions!.map((positionId) => {
                      const position = positions.find((p) => p._id === positionId);
                      if (!position) return null;
                      return (
                        <span key={positionId} className={styles.pill}>
                          {position.title}
                        </span>
                      );
                    })
                  ) : (
                    <span className={styles.tdMuted}>None</span>
                  )}
                </div>
              </td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                {new Date(service.created ?? service.createdAt ?? "").toLocaleDateString()}
              </td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <DeleteButton onClick={() => void removeService(service._id)} />
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "clients" && (
        <ManagementTable
          headers={["Name", "About", "Created", "Actions"]}
          emptyMessage={isLoadingClients ? "Loading clients..." : "No clients found."}
        >
          {filteredClients.map((client) => (
            <tr key={client._id}>
              <td className={`${styles.td} ${styles.tdName}`}>{client.name}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{client.about || "None"}</td>
              <td className={`${styles.td} ${styles.tdMuted}`}>
                {new Date(client.created ?? client.createdAt ?? "").toLocaleDateString()}
              </td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <div className={styles.actionsRow}>
                  <EditButton onClick={() => openEditClientModal(client._id)} />
                  <DeleteButton onClick={() => void removeClient(client._id)} />
                </div>
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}

      {activeSection === "position" && (
        <ManagementTable
          headers={["Name", "Description", "Skills", "Actions"]}
          emptyMessage={isLoadingPositions ? "Loading positions..." : "No positions found."}
        >
          {filteredPositions.map((position) => (
            <tr key={position._id}>
              <td className={styles.td}>
                <span className={styles.tdName}>{position.title}</span>
                <div className={styles.respList}>
                  {position.responsibilities.map((responsibility) => (
                    <div key={`${position._id}-${responsibility}`} className={styles.respListItem}>
                      <span className={styles.respDot} />
                      <span>{responsibility}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className={`${styles.td} ${styles.tdMuted}`}>{position.description}</td>
              <td className={styles.td}>
                <div className={styles.pillsWrap}>
                  {position.skills?.map((skillId) => {
                    const skill = skills.find((s) => s._id === skillId);
                    if (!skill) return null;
                    return (
                      <span key={skillId} className={styles.pill}>
                        {skill.title ?? skill.name}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className={`${styles.td} ${styles.tdActions}`}>
                <div className={styles.actionsRow}>
                  <EditButton onClick={() => openEditPositionModal(position._id)} />
                  <DeleteButton onClick={() => void removePosition(position._id)} />
                </div>
              </td>
            </tr>
          ))}
        </ManagementTable>
      )}
    </div>
  );
}
