"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";

type AdminSection = "staff" | "admin" | "position" | "skills" | "services";
type CreateModal = AdminSection | null;

interface StaffMember {
  id: string;
  name: string;
  email: string;
  positionId?: string;
  createdAt: Date;
}

interface SkillItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  positionIds: string[];
  createdAt: Date;
}

interface PositionItem {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  skillIds: string[];
  createdAt: Date;
}

interface AdminPageProps {
  onLogout: () => void;
}

const INITIAL_STAFF: StaffMember[] = [];

const INITIAL_ADMINS: StaffMember[] = [];

const INITIAL_SKILLS: SkillItem[] = [];

const INITIAL_SERVICES: ServiceItem[] = [];

const INITIAL_POSITIONS: PositionItem[] = [];

const SECTION_META: Record<
  AdminSection,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    addLabel: string;
  }
> = {
  skills: { label: "Skills Management", icon: Wrench, addLabel: "Add New" },
  position: { label: "Position Management", icon: User, addLabel: "Add New" },
  staff: { label: "Staff Management", icon: Users, addLabel: "Add New" },
  services: { label: "Services Management", icon: Briefcase, addLabel: "Add New" },
  admin: { label: "Admin Management", icon: UserCog, addLabel: "Add New" },
};

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("admin@trimerge.com");
  const [openModal, setOpenModal] = useState<CreateModal>(null);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [adminMembers, setAdminMembers] = useState<StaffMember[]>(INITIAL_ADMINS);
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [positions, setPositions] = useState<PositionItem[]>(INITIAL_POSITIONS);

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    if (storedEmail) setLoggedInEmail(storedEmail);
  }, []);

  const loggedInName = useMemo(() => {
    const localPart = loggedInEmail.split("@")[0] ?? "";
    const normalizedParts = localPart
      .replace(/[0-9]+/g, " ")
      .split(/[._-]+|\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (normalizedParts.length === 0) return "Admin User";

    return normalizedParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, [loggedInEmail]);

  const activeSectionMeta = SECTION_META[activeSection];

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return staffMembers;
    return staffMembers.filter(
      (member) => {
        const positionName = positions.find((position) => position.id === member.positionId)?.title ?? "";
        return (
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          positionName.toLowerCase().includes(query)
        );
      },
    );
  }, [positions, searchQuery, staffMembers]);

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return adminMembers;
    return adminMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query),
    );
  }, [adminMembers, searchQuery]);

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return skills;
    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query),
    );
  }, [searchQuery, skills]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) => {
      const skillNames = service.skillIds
        .map((skillId) => skills.find((skill) => skill.id === skillId)?.name ?? "")
        .join(" ");
      const positionNames = service.positionIds
        .map((positionId) => positions.find((position) => position.id === positionId)?.title ?? "")
        .join(" ");
      return (
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        skillNames.toLowerCase().includes(query) ||
        positionNames.toLowerCase().includes(query)
      );
    });
  }, [positions, searchQuery, services, skills]);

  const filteredPositions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return positions;
    return positions.filter((position) => {
      const skillNames = position.skillIds
        .map((skillId) => skills.find((skill) => skill.id === skillId)?.name ?? "")
        .join(" ");
      return (
        position.title.toLowerCase().includes(query) ||
        position.description.toLowerCase().includes(query) ||
        position.responsibilities.join(" ").toLowerCase().includes(query) ||
        skillNames.toLowerCase().includes(query)
      );
    });
  }, [positions, searchQuery, skills]);

  const activeCount = {
    staff: staffMembers.length,
    admin: adminMembers.length,
    position: positions.length,
    skills: skills.length,
    services: services.length,
  }[activeSection];

  const openCreateModal = () => setOpenModal(activeSection);
  const removeSkill = (skillId: string) => {
    setSkills((current) => current.filter((item) => item.id !== skillId));
    setPositions((current) =>
      current.map((position) => ({
        ...position,
        skillIds: position.skillIds.filter((item) => item !== skillId),
      })),
    );
    setServices((current) =>
      current.map((service) => ({
        ...service,
        skillIds: service.skillIds.filter((item) => item !== skillId),
      })),
    );
  };
  const removePosition = (positionId: string) => {
    setPositions((current) => current.filter((item) => item.id !== positionId));
    setStaffMembers((current) =>
      current.map((member) =>
        member.positionId === positionId ? { ...member, positionId: undefined } : member,
      ),
    );
    setServices((current) =>
      current.map((service) => ({
        ...service,
        positionIds: service.positionIds.filter((item) => item !== positionId),
      })),
    );
  };

  return (
    <div className="page-shell min-h-[calc(100vh-80px)] bg-[#f6f8fc] xl:flex">
      <aside className="relative bg-[linear-gradient(180deg,#1f5fb5_0%,#255da7_56%,#25569a_100%)] text-white shadow-[8px_0_24px_rgba(10,31,68,0.12)] page-section xl:sticky xl:top-[81px] xl:h-[calc(100vh-81px)] xl:w-[270px]">
        <div className="border-b border-white/12 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0ca44] text-[#1e2838] shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-white">{loggedInName}</h2>
              <p className="text-xs text-white/64">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {(Object.keys(SECTION_META) as AdminSection[]).map((section) => {
            const item = SECTION_META[section];
            return (
              <SidebarButton
                key={section}
                active={activeSection === section}
                icon={item.icon}
                label={item.label}
                onClick={() => {
                  setActiveSection(section);
                  setSearchQuery("");
                }}
              />
            );
          })}
        </nav>

        <div className="border-t border-white/12 p-4 xl:absolute xl:bottom-0 xl:w-[270px]">
          <div className="rounded-2xl bg-white/[0.05] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Logged in as:</p>
            <p className="mt-2 break-all text-sm font-semibold text-white/94">{loggedInEmail}</p>
            <button
              type="button"
              onClick={onLogout}
              className="interactive-button mt-4 flex w-full items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/16"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-[#e3e8f2] bg-white shadow-[0_8px_18px_rgba(36,55,89,0.04)]">
          <div className="px-8 py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-[42px] font-semibold tracking-tight text-[#1e2431]">
                  {activeSectionMeta.label}
                </h1>
                <p className="mt-2 text-sm text-[#697587]">Manage {activeCount} registry</p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="interactive-button inline-flex items-center gap-2 rounded-xl bg-[#2865ba] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(40,101,186,0.24)] hover:bg-[#2159a8]"
              >
                <Plus className="h-4 w-4" />
                <span>{activeSectionMeta.addLabel}</span>
              </button>
            </div>

            <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1abbb]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="interactive-input w-full rounded-xl border border-[#e5e9f1] bg-white py-3.5 pl-11 pr-4 text-sm text-[#24324a] shadow-[0_4px_14px_rgba(34,54,88,0.05)] outline-none focus:ring-2 focus:ring-[#2865ba]"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 py-8">
          {activeSection === "staff" && (
            <ManagementTable
              headers={["Name", "Email", "Position", "Created", "Actions"]}
              emptyMessage="No staff members found."
            >
              {filteredStaff.map((member) => (
                <tr key={member.id} className="border-t border-[#eef2f8]">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{member.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{member.email}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">
                    {positions.find((position) => position.id === member.positionId)?.title ?? "Unassigned"}
                  </td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{member.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <DeleteButton onClick={() => setStaffMembers((current) => current.filter((item) => item.id !== member.id))} />
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "admin" && (
            <ManagementTable
              headers={["Name", "Email", "Created", "Actions"]}
              emptyMessage="No admin members found."
            >
              {filteredAdmins.map((member) => (
                <tr key={member.id} className="border-t border-[#eef2f8]">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{member.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{member.email}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{member.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <DeleteButton onClick={() => setAdminMembers((current) => current.filter((item) => item.id !== member.id))} />
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "skills" && (
            <ManagementTable
              headers={["Name", "Description", "Created", "Actions"]}
              emptyMessage="No skills found."
            >
              {filteredSkills.map((skill) => (
                <tr key={skill.id} className="border-t border-[#eef2f8]">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{skill.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{skill.description}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{skill.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <DeleteButton onClick={() => removeSkill(skill.id)} />
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "services" && (
            <ManagementTable
              headers={["Name", "Description", "Skills", "Positions", "Created", "Actions"]}
              emptyMessage="No services found."
            >
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-t border-[#eef2f8] align-top">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{service.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{service.description}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">
                    <div className="flex flex-wrap gap-2">
                      {service.skillIds.length > 0 ? service.skillIds.map((skillId) => {
                        const skill = skills.find((item) => item.id === skillId);
                        if (!skill) return null;
                        return (
                          <span key={skillId} className="rounded-full border border-[#d9e2f0] bg-[#f7faff] px-3 py-1 text-xs font-medium text-[#3b4f6b]">
                            {skill.name}
                          </span>
                        );
                      }) : <span className="text-[#8b97a7]">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">
                    <div className="flex flex-wrap gap-2">
                      {service.positionIds.length > 0 ? service.positionIds.map((positionId) => {
                        const position = positions.find((item) => item.id === positionId);
                        if (!position) return null;
                        return (
                          <span key={positionId} className="rounded-full border border-[#d9e2f0] bg-[#f7faff] px-3 py-1 text-xs font-medium text-[#3b4f6b]">
                            {position.title}
                          </span>
                        );
                      }) : <span className="text-[#8b97a7]">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{service.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <DeleteButton onClick={() => setServices((current) => current.filter((item) => item.id !== service.id))} />
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "position" && (
            <ManagementTable
              headers={["Name", "Description", "Skills", "Actions"]}
              emptyMessage="No positions found."
            >
              {filteredPositions.map((position) => (
                <tr key={position.id} className="border-t border-[#eef2f8] align-top">
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-[#263247]">{position.title}</p>
                    <div className="mt-4 space-y-1.5 text-sm text-[#5f6b7c]">
                      {position.responsibilities.map((responsibility) => (
                        <div key={`${position.id}-${responsibility}`} className="flex items-start gap-2">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#6d7a8c]" />
                          <span>{responsibility}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{position.description}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">
                    <div className="flex flex-wrap gap-2">
                      {position.skillIds.map((skillId) => {
                        const skill = skills.find((item) => item.id === skillId);
                        if (!skill) return null;
                        return (
                          <span
                            key={skillId}
                            className="rounded-full border border-[#d9e2f0] bg-[#f7faff] px-3 py-1 text-xs font-medium text-[#3b4f6b]"
                          >
                            {skill.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <DeleteButton onClick={() => removePosition(position.id)} />
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}
        </div>
      </div>

      {openModal === "staff" && (
        <PersonModal
          title="Add New Staff Member"
          positions={positions}
          onClose={() => setOpenModal(null)}
          onSave={(payload) => {
            setStaffMembers((current) => [
              ...current,
              { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
            ]);
            setOpenModal(null);
          }}
        />
      )}

      {openModal === "admin" && (
        <PersonModal
          title="Add New Admin Member"
          onClose={() => setOpenModal(null)}
          onSave={(payload) => {
            setAdminMembers((current) => [
              ...current,
              { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
            ]);
            setOpenModal(null);
          }}
        />
      )}

      {openModal === "skills" && (
        <RegistryModal
          title="Add New Skill"
          nameLabel="Title"
          onClose={() => setOpenModal(null)}
          onSave={(payload) => {
            setSkills((current) => [
              ...current,
              { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
            ]);
            setOpenModal(null);
          }}
        />
      )}

      {openModal === "services" && (
        <ServiceModal
          title="Add New Service"
          skills={skills}
          positions={positions}
          onClose={() => setOpenModal(null)}
          onSave={(payload) => {
            setServices((current) => [
              ...current,
              { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
            ]);
            setOpenModal(null);
          }}
        />
      )}

      {openModal === "position" && (
        <PositionModal
          skills={skills}
          onClose={() => setOpenModal(null)}
          onSave={(payload) => {
            setPositions((current) => [
              ...current,
              { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
            ]);
            setOpenModal(null);
          }}
        />
      )}
    </div>
  );
}

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
      className={`interactive-button flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
        active
          ? "bg-[#f0ca44] text-[#243145] shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          : "text-white/88 hover:bg-white/[0.08]"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function ManagementTable({
  headers,
  children,
  emptyMessage,
}: {
  headers: string[];
  children: React.ReactNode;
  emptyMessage: string;
}) {
  const childCount = Array.isArray(children) ? children.length : children ? 1 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(29,48,81,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-[#fbfcff]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#4f5d72]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {childCount > 0 ? (
              children
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-14 text-center text-sm text-[#7b8798]">
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

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="interactive-button rounded-full p-2 text-[#f26a8a] hover:bg-[#fff1f5]"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function PersonModal({
  title,
  positions,
  onSave,
  onClose,
}: {
  title: string;
  positions?: PositionItem[];
  onSave: (payload: { name: string; email: string; positionId?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [positionId, setPositionId] = useState("");

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), email: email.trim(), positionId: positionId || undefined });
        }}
        className="space-y-5"
      >
        <ModalField label="Name">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="interactive-input w-full rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalField label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="interactive-input w-full rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        {positions && (
          <ModalField label="Position">
            <select
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              className="interactive-input w-full rounded-xl border border-[#dfe5ef] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            >
              <option value="">{positions.length > 0 ? "No position assigned" : "Create a position first"}</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
            {positions.length === 0 && (
              <p className="mt-2 text-xs text-[#7b8798]">
                Positions created in `Position Management` will appear here automatically.
              </p>
            )}
          </ModalField>
        )}

        <ModalActions onClose={onClose} />
      </form>
    </BaseModal>
  );
}

function RegistryModal({
  title,
  nameLabel,
  onSave,
  onClose,
}: {
  title: string;
  nameLabel: string;
  onSave: (payload: { name: string; description: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), description: description.trim() });
        }}
        className="space-y-5"
      >
        <ModalField label={nameLabel}>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="interactive-input w-full rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalField label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="interactive-input w-full resize-none rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalActions onClose={onClose} />
      </form>
    </BaseModal>
  );
}

function ServiceModal({
  title,
  skills,
  positions,
  onSave,
  onClose,
}: {
  title: string;
  skills: SkillItem[];
  positions: PositionItem[];
  onSave: (payload: Omit<ServiceItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((current) =>
      current.includes(skillId) ? current.filter((item) => item !== skillId) : [...current, skillId],
    );
  };

  const togglePosition = (positionId: string) => {
    setSelectedPositionIds((current) =>
      current.includes(positionId) ? current.filter((item) => item !== positionId) : [...current, positionId],
    );
  };

  return (
    <BaseModal title={title} onClose={onClose} wide>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            name: name.trim(),
            description: description.trim(),
            skillIds: selectedSkillIds,
            positionIds: selectedPositionIds,
          });
        }}
        className="space-y-5"
      >
        <ModalField label="Title">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="interactive-input w-full rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalField label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="interactive-input w-full resize-none rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalField label="Skills">
          {skills.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {skills.map((skill) => (
                <label key={skill.id} className="flex items-center gap-3 rounded-xl border border-[#edf1f7] bg-white px-4 py-3 text-sm text-[#3e4b5f]">
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="h-4 w-4 rounded border-[#d6dce8]"
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d9e1ec] bg-[#fbfcff] px-4 py-4 text-sm text-[#7b8798]">
              No skills yet. Create skills first and they will appear here automatically.
            </p>
          )}
        </ModalField>

        <ModalField label="Positions">
          {positions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {positions.map((position) => (
                <label key={position.id} className="flex items-center gap-3 rounded-xl border border-[#edf1f7] bg-white px-4 py-3 text-sm text-[#3e4b5f]">
                  <input
                    type="checkbox"
                    checked={selectedPositionIds.includes(position.id)}
                    onChange={() => togglePosition(position.id)}
                    className="h-4 w-4 rounded border-[#d6dce8]"
                  />
                  <span>{position.title}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d9e1ec] bg-[#fbfcff] px-4 py-4 text-sm text-[#7b8798]">
              No positions yet. Create positions first and they will appear here automatically.
            </p>
          )}
        </ModalField>

        <ModalActions onClose={onClose} />
      </form>
    </BaseModal>
  );
}

function PositionModal({
  skills,
  onSave,
  onClose,
}: {
  skills: SkillItem[];
  onSave: (payload: Omit<PositionItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  const updateResponsibility = (index: number, value: string) => {
    setResponsibilities((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities((current) => (current.length === 1 ? [""] : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((current) =>
      current.includes(skillId) ? current.filter((item) => item !== skillId) : [...current, skillId],
    );
  };

  return (
    <BaseModal title="Add New Position" onClose={onClose} maxWidthClass="max-w-[760px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            title: title.trim(),
            description: description.trim(),
            responsibilities: responsibilities.map((item) => item.trim()).filter(Boolean),
            skillIds: selectedSkillIds,
          });
        }}
        className="space-y-5"
      >
        <ModalField label="Title">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="interactive-input w-full rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalField label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="interactive-input w-full resize-none rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
        </ModalField>

        <ModalField label="Responsibilities">
          <div className="space-y-3">
            {responsibilities.map((responsibility, index) => (
              <div key={`responsibility-${index}`} className="flex items-center gap-3">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(event) => updateResponsibility(index, event.target.value)}
                  placeholder={`Responsibility ${index + 1}`}
                  className="interactive-input flex-1 rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
                />
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className="interactive-button rounded-xl px-3 py-3 text-sm font-medium text-[#df5f7c] hover:bg-[#fff0f4]"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setResponsibilities((current) => [...current, ""])}
              className="interactive-button rounded-xl bg-[#2865ba] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2159a8]"
            >
              + Add responsibility
            </button>
          </div>
        </ModalField>

        <ModalField label="Skills">
          {skills.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {skills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-3 rounded-xl border border-[#edf1f7] bg-white px-4 py-3 text-sm text-[#3e4b5f]"
                >
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="h-4 w-4 rounded border-[#d6dce8]"
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d9e1ec] bg-[#fbfcff] px-4 py-4 text-sm text-[#7b8798]">
              No skills yet. Create skills first and then link them to this position.
            </p>
          )}
        </ModalField>

        <ModalActions onClose={onClose} />
      </form>
    </BaseModal>
  );
}

function BaseModal({
  title,
  onClose,
  children,
  wide = false,
  maxWidthClass,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  maxWidthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 p-3 backdrop-blur-[2px] sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          className={`my-4 w-full ${maxWidthClass ?? (wide ? "max-w-[960px]" : "max-w-[640px]")} overflow-hidden rounded-[22px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.18)]`}
        >
          <div className="flex items-center justify-between bg-[linear-gradient(90deg,#1f5fb5_0%,#2865ba_100%)] px-6 py-5">
            <h3 className="text-[28px] font-semibold tracking-tight text-white">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="interactive-button rounded-full p-1.5 text-white/90 hover:bg-white/12"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#4f5d72]">{label}</span>
      {children}
    </label>
  );
}

function ModalActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex gap-4 pt-3">
      <button
        type="button"
        onClick={onClose}
        className="interactive-button flex-1 rounded-xl border border-[#d9e1ec] bg-white px-4 py-3.5 text-base font-semibold text-[#5a6576] hover:bg-[#f8fafc]"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="interactive-button flex-1 rounded-xl bg-[#2865ba] px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(40,101,186,0.22)] hover:bg-[#2159a8]"
      >
        Save
      </button>
    </div>
  );
}
