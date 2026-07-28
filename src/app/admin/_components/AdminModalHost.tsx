import {
  ClientModal,
  PersonModal,
  PlatformModal,
  PositionModal,
  RegistryModal,
  ServiceModal,
  SkillModal,
  type Certification,
} from "./AdminModals";
import type {
  ClientItem,
  CreateModal,
  PositionItem,
  ServiceItem,
  SkillItem,
  StaffMember,
} from "./adminTypes";

interface AdminModalHostProps {
  certifications: Certification[];
  editingClient: ClientItem | null;
  editingDetail: any;
  editingPlatform: any;
  editingPosition: PositionItem | null;
  editingSkill: SkillItem | null;
  editingStaff: StaffMember | null;
  isSavingClient: boolean;
  isSavingDetail: boolean;
  isSavingPlatform: boolean;
  isSavingPosition: boolean;
  isSavingService: boolean;
  isSavingSkill: boolean;
  isSavingStaff: boolean;
  onAddAdmin: (payload: { fullname: string; email: string }) => void;
  onCloseClient: () => void;
  onCloseDetail: () => void;
  onCloseModal: () => void;
  onClosePlatform: () => void;
  onClosePosition: () => void;
  onCloseSkill: () => void;
  onCloseStaff: () => void;
  onSaveClient: (payload: Omit<ClientItem, "_id" | "createdAt">) => void;
  onSaveDetail: (payload: { name: string; description: string }) => void;
  onSavePlatform: (payload: { name: string; url: string; description: string }) => void;
  onSavePosition: (payload: Omit<PositionItem, "_id" | "createdAt">) => void;
  onSaveService: (payload: Omit<ServiceItem, "_id" | "createdAt">) => void;
  onSaveSkill: (payload: { name: string; description: string; [key: string]: any }) => void;
  onSaveStaff: (payload: { fullname: string; email: string; positionId?: string }) => void;
  openModal: CreateModal;
  positions: PositionItem[];
  skills: SkillItem[];
  staffMembers: StaffMember[];
}

export default function AdminModalHost({
  certifications,
  editingClient,
  editingDetail,
  editingPlatform,
  editingPosition,
  editingSkill,
  editingStaff,
  isSavingClient,
  isSavingDetail,
  isSavingPlatform,
  isSavingPosition,
  isSavingService,
  isSavingSkill,
  isSavingStaff,
  onAddAdmin,
  onCloseClient,
  onCloseDetail,
  onCloseModal,
  onClosePlatform,
  onClosePosition,
  onCloseSkill,
  onCloseStaff,
  onSaveClient,
  onSaveDetail,
  onSavePlatform,
  onSavePosition,
  onSaveService,
  onSaveSkill,
  onSaveStaff,
  openModal,
  positions,
  skills,
  staffMembers,
}: AdminModalHostProps) {
  return (
    <>
      {openModal === "staff" && (
        <PersonModal
          initialEmail={editingStaff?.email ?? ""}
          initialName={editingStaff?.fullname ?? editingStaff?.name ?? ""}
          initialPositionId={editingStaff?.positionId ?? editingStaff?.position ?? ""}
          isSaving={isSavingStaff}
          title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
          positions={positions}
          onClose={onCloseStaff}
          onSave={(payload) => void onSaveStaff(payload)}
        />
      )}

      {openModal === "admin" && (
        <PersonModal
          title="Add New Admin Member"
          onClose={onCloseModal}
          onSave={onAddAdmin}
        />
      )}

      {openModal === "skills" && (
        <SkillModal
          title={editingSkill ? "Edit Skill" : "Add New Skill"}
          initialValues={
            editingSkill
              ? {
                  name: editingSkill.name ?? editingSkill.title,
                  category: editingSkill.category,
                  description: editingSkill.description,
                  certificationIds: editingSkill.certificationIds ?? [],
                  staffMemberIds: editingSkill.staffMemberIds ?? [],
                  proficiencyLevel: editingSkill.proficiencyLevel ?? "",
                }
              : undefined
          }
          certifications={certifications}
          staffMembers={staffMembers}
          isSaving={isSavingSkill}
          onClose={onCloseSkill}
          onSave={(payload) => void onSaveSkill(payload)}
          submitLabel={editingSkill ? "Save Changes" : "Create Skill"}
        />
      )}

      {openModal === "platforms" && (
        <PlatformModal
          title={editingPlatform ? "Edit Platform" : "Add New Platform"}
          nameLabel="Name"
          initialDescription={editingPlatform?.description ?? ""}
          initialName={editingPlatform?.title ?? ""}
          initialUrl={editingPlatform?.url ?? ""}
          isSaving={isSavingPlatform}
          onClose={onClosePlatform}
          onSave={(payload) => void onSavePlatform(payload)}
          submitLabel={editingPlatform ? "Save changes" : "Create Platform"}
        />
      )}

      {openModal === "company_overview" && (
        <RegistryModal
          title={editingDetail ? "Edit Detail" : "Add New Detail"}
          nameLabel="Title"
          initialDescription={editingDetail?.detail ?? ""}
          initialName={editingDetail?.title ?? ""}
          isSaving={isSavingDetail}
          onClose={onCloseDetail}
          onSave={(payload) => void onSaveDetail(payload)}
          submitLabel={editingDetail ? "Save changes" : "Add Detail"}
        />
      )}

      {openModal === "services" && (
        <ServiceModal
          title="Add New Service"
          skills={skills}
          positions={positions}
          onClose={onCloseModal}
          onSave={(payload) => void onSaveService(payload)}
          isSaving={isSavingService}
        />
      )}

      {openModal === "clients" && (
        <ClientModal
          initialAbout={editingClient?.about ?? ""}
          initialName={editingClient?.name ?? ""}
          isSaving={isSavingClient}
          title={editingClient ? "Edit Client" : "Add New Client"}
          onClose={onCloseClient}
          onSave={(payload) => void onSaveClient(payload)}
        />
      )}

      {openModal === "position" && (
        <PositionModal
          skills={skills}
          initialDescription={editingPosition?.description ?? ""}
          initialResponsibilities={editingPosition?.responsibilities ?? [""]}
          initialSkillIds={editingPosition?.skillIds ?? []}
          initialTitle={editingPosition?.title ?? ""}
          isSaving={isSavingPosition}
          title={editingPosition ? "Edit Position" : "Add New Position"}
          onClose={onClosePosition}
          onSave={(payload) => void onSavePosition(payload)}
        />
      )}
    </>
  );
}
