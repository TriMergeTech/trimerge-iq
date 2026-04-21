"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  LogOut,
  Pencil,
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

interface PositionApiRecord {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  responsibility?: string[];
  responsibilities?: string[];
  skills?: string[];
  createdAt?: string;
  created_at?: string;
}

interface SkillApiRecord {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

const INITIAL_STAFF: StaffMember[] = [];

const INITIAL_ADMINS: StaffMember[] = [];

const INITIAL_SKILLS: SkillItem[] = [];

const INITIAL_SERVICES: ServiceItem[] = [];

const INITIAL_POSITIONS: PositionItem[] = [];
const API_BASE_URL = "https://trimerge-iq.onrender.com";

function mapSkillFromApi(skill: SkillApiRecord): SkillItem {
  return {
    id: skill.id ?? skill._id ?? `${skill.name ?? "skill"}-${skill.createdAt ?? skill.created_at ?? "local"}`,
    name: skill.name ?? "Untitled Skill",
    description: skill.description ?? "",
    createdAt: skill.createdAt || skill.created_at ? new Date(skill.createdAt ?? skill.created_at ?? "") : new Date(),
  };
}

function mapPositionFromApi(position: PositionApiRecord, skills: SkillItem[]): PositionItem {
  const skillIds = (position.skills ?? [])
    .map((skillName) => skills.find((skill) => skill.name === skillName)?.id)
    .filter((skillId): skillId is string => Boolean(skillId));

  return {
    id:
      position.id ??
      position._id ??
      `${position.name ?? position.title ?? "position"}-${position.createdAt ?? position.created_at ?? "local"}`,
    title: position.name ?? position.title ?? "Untitled Position",
    description: position.description ?? "",
    responsibilities: position.responsibility ?? position.responsibilities ?? [],
    skillIds,
    createdAt:
      position.createdAt || position.created_at
        ? new Date(position.createdAt ?? position.created_at ?? "")
        : new Date(),
  };
}

function extractPositionRecords(payload: unknown): PositionApiRecord[] {
  if (Array.isArray(payload)) return payload as PositionApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { data?: unknown; position?: unknown; positions?: unknown };
    if (Array.isArray(typedPayload.positions)) return typedPayload.positions as PositionApiRecord[];
    if (typedPayload.position && typeof typedPayload.position === "object") {
      return [typedPayload.position as PositionApiRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as PositionApiRecord[];

    if (data && typeof data === "object") return [data as PositionApiRecord];
    return [payload as PositionApiRecord];
  }

  return [];
}

function extractSkillRecords(payload: unknown): SkillApiRecord[] {
  if (Array.isArray(payload)) return payload as SkillApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { data?: unknown; skill?: unknown; skills?: unknown };
    if (Array.isArray(typedPayload.skills)) return typedPayload.skills as SkillApiRecord[];
    if (typedPayload.skill && typeof typedPayload.skill === "object") {
      return [typedPayload.skill as SkillApiRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as SkillApiRecord[];

    if (data && typeof data === "object") return [data as SkillApiRecord];
    return [payload as SkillApiRecord];
  }

  return [];
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return null;
  }
}

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
  const [accessToken, setAccessToken] = useState("");
  const [openModal, setOpenModal] = useState<CreateModal>(null);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [isLoadingSkillDetails, setIsLoadingSkillDetails] = useState(false);
  const [isSavingPosition, setIsSavingPosition] = useState(false);
  const [skillError, setSkillError] = useState("");
  const [positionError, setPositionError] = useState("");

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [adminMembers, setAdminMembers] = useState<StaffMember[]>(INITIAL_ADMINS);
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [positions, setPositions] = useState<PositionItem[]>(INITIAL_POSITIONS);

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    const storedAccessToken = localStorage.getItem("trimerge_admin_access_token");
    if (storedEmail) setLoggedInEmail(storedEmail);
    if (storedAccessToken) setAccessToken(storedAccessToken);
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadSkills = async () => {
      try {
        setIsLoadingSkills(true);
        setSkillError("");

        const response = await fetch(`${API_BASE_URL}/skills`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load skills (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const apiSkills = extractSkillRecords(payload).map(mapSkillFromApi);

        if (!ignore) {
          setSkills(apiSkills);
        }
      } catch (error) {
        if (!ignore) {
          setSkillError(error instanceof Error ? error.message : "Unable to load skills.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingSkills(false);
        }
      }
    };

    void loadSkills();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadPositions = async () => {
      try {
        setIsLoadingPositions(true);
        setPositionError("");

        const response = await fetch(`${API_BASE_URL}/positions`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load positions (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const apiPositions = extractPositionRecords(payload).map((position) =>
          mapPositionFromApi(position, skills),
        );

        if (!ignore) {
          setPositions(apiPositions);
        }
      } catch (error) {
        if (!ignore) {
          setPositionError(error instanceof Error ? error.message : "Unable to load positions.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingPositions(false);
        }
      }
    };

    void loadPositions();

    return () => {
      ignore = true;
    };
  }, [accessToken, skills]);

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

  const openCreateModal = () => {
    if (activeSection === "skills") {
      setEditingSkill(null);
      setSkillError("");
    }
    if (activeSection === "position") {
      setEditingPosition(null);
      setPositionError("");
    }
    setOpenModal(activeSection);
  };

  const saveSkill = async (payload: { name: string; description: string }) => {
    try {
      setIsSavingSkill(true);
      setSkillError("");

      if (editingSkill && accessToken) {
        const response = await fetch(`${API_BASE_URL}/skills/${editingSkill.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Unable to update skill (${response.status})`);
        }

        const updatedPayload = await parseJsonSafely(response);
        const updatedSkill = extractSkillRecords(updatedPayload)[0];

        if (updatedSkill) {
          const nextSkill = mapSkillFromApi(updatedSkill);
          setSkills((current) =>
            current.map((skill) => (skill.id === editingSkill.id ? nextSkill : skill)),
          );
        } else {
          setSkills((current) =>
            current.map((skill) =>
              skill.id === editingSkill.id ? { ...skill, ...payload } : skill,
            ),
          );
        }
      } else if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/skills`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Unable to create skill (${response.status})`);
        }

        const createdPayload = await parseJsonSafely(response);
        const createdSkill = extractSkillRecords(createdPayload)[0];

        setSkills((current) => [
          ...current,
          createdSkill
            ? mapSkillFromApi(createdSkill)
            : { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
        ]);
      } else if (editingSkill) {
        setSkills((current) =>
          current.map((skill) =>
            skill.id === editingSkill.id ? { ...skill, ...payload } : skill,
          ),
        );
      } else {
        setSkills((current) => [
          ...current,
          { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
        ]);
      }

      setEditingSkill(null);
      setOpenModal(null);
    } catch (error) {
      setSkillError(error instanceof Error ? error.message : "Unable to save skill.");
    } finally {
      setIsSavingSkill(false);
    }
  };

  const openEditSkillModal = async (skillId: string) => {
    try {
      setIsLoadingSkillDetails(true);
      setSkillError("");

      if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load skill (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const skill = extractSkillRecords(payload)[0];

        if (!skill) {
          throw new Error("Unable to load skill.");
        }

        setEditingSkill(mapSkillFromApi(skill));
      } else {
        const existingSkill = skills.find((item) => item.id === skillId);
        if (!existingSkill) {
          throw new Error("Unable to load skill.");
        }
        setEditingSkill(existingSkill);
      }

      setOpenModal("skills");
    } catch (error) {
      setSkillError(error instanceof Error ? error.message : "Unable to load skill.");
    } finally {
      setIsLoadingSkillDetails(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      setSkillError("");

      if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to delete skill (${response.status})`);
        }
      }

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
    } catch (error) {
      setSkillError(error instanceof Error ? error.message : "Unable to delete skill.");
    }
  };
  const removePosition = async (positionId: string) => {
    try {
      if (accessToken) {
        setPositionError("");

        const response = await fetch(`${API_BASE_URL}/positions/${positionId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to delete position (${response.status})`);
        }
      }

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
    } catch (error) {
      setPositionError(error instanceof Error ? error.message : "Unable to delete position.");
    }
  };

  const openEditPositionModal = (positionId: string) => {
    const existingPosition = positions.find((item) => item.id === positionId);
    if (!existingPosition) {
      setPositionError("Unable to load position.");
      return;
    }

    setPositionError("");
    setEditingPosition(existingPosition);
    setOpenModal("position");
  };

  const savePosition = async (payload: Omit<PositionItem, "id" | "createdAt">) => {
    try {
      setIsSavingPosition(true);
      setPositionError("");

      if (accessToken && editingPosition) {
        const response = await fetch(`${API_BASE_URL}/positions/${editingPosition.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.title,
            description: payload.description,
            responsibility: payload.responsibilities,
            skills: payload.skillIds
              .map((skillId) => skills.find((skill) => skill.id === skillId)?.name)
              .filter((skillName): skillName is string => Boolean(skillName)),
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to update position (${response.status})`);
        }

        const updatedPayload = await parseJsonSafely(response);
        const updatedPosition = extractPositionRecords(updatedPayload)[0];
        const nextPosition = updatedPosition
          ? mapPositionFromApi(updatedPosition, skills)
          : { ...editingPosition, ...payload };

        setPositions((current) =>
          current.map((position) => (position.id === editingPosition.id ? nextPosition : position)),
        );
      } else if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/positions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.title,
            description: payload.description,
            responsibility: payload.responsibilities,
            skills: payload.skillIds
              .map((skillId) => skills.find((skill) => skill.id === skillId)?.name)
              .filter((skillName): skillName is string => Boolean(skillName)),
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to create position (${response.status})`);
        }

        const createdPayload = await parseJsonSafely(response);
        const createdPosition = extractPositionRecords(createdPayload)[0];

        if (createdPosition) {
          setPositions((current) => [...current, mapPositionFromApi(createdPosition, skills)]);
        }
      } else if (editingPosition) {
        setPositions((current) =>
          current.map((position) =>
            position.id === editingPosition.id ? { ...position, ...payload } : position,
          ),
        );
      } else {
        setPositions((current) => [
          ...current,
          { id: crypto.randomUUID(), createdAt: new Date(), ...payload },
        ]);
      }

      setEditingPosition(null);
      setOpenModal(null);
    } catch (error) {
      setPositionError(error instanceof Error ? error.message : "Unable to save position.");
    } finally {
      setIsSavingPosition(false);
    }
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
          {activeSection === "skills" && skillError && (
            <div className="mb-5 rounded-2xl border border-[#f6c5cf] bg-[#fff5f7] px-5 py-4 text-sm text-[#a8485f]">
              {skillError}
            </div>
          )}

          {activeSection === "position" && positionError && (
            <div className="mb-5 rounded-2xl border border-[#f6c5cf] bg-[#fff5f7] px-5 py-4 text-sm text-[#a8485f]">
              {positionError}
            </div>
          )}

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
              emptyMessage={isLoadingSkills ? "Loading skills..." : "No skills found."}
            >
              {filteredSkills.map((skill) => (
                <tr key={skill.id} className="border-t border-[#eef2f8]">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{skill.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{skill.description}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{skill.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <EditButton
                        disabled={isLoadingSkillDetails}
                        onClick={() => {
                          void openEditSkillModal(skill.id);
                        }}
                      />
                      <DeleteButton
                        onClick={() => {
                          void removeSkill(skill.id);
                        }}
                      />
                    </div>
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
              emptyMessage={isLoadingPositions ? "Loading positions..." : "No positions found."}
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
                    <div className="flex justify-end gap-2">
                      <EditButton
                        onClick={() => {
                          openEditPositionModal(position.id);
                        }}
                      />
                      <DeleteButton onClick={() => { void removePosition(position.id); }} />
                    </div>
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
          title={editingSkill ? "Edit Skill" : "Add New Skill"}
          nameLabel="Title"
          initialDescription={editingSkill?.description ?? ""}
          initialName={editingSkill?.name ?? ""}
          isSaving={isSavingSkill}
          onClose={() => {
            setEditingSkill(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void saveSkill(payload);
          }}
          submitLabel={editingSkill ? "Save changes" : "Create skill"}
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
          initialDescription={editingPosition?.description ?? ""}
          initialResponsibilities={editingPosition?.responsibilities ?? [""]}
          initialSkillIds={editingPosition?.skillIds ?? []}
          initialTitle={editingPosition?.title ?? ""}
          isSaving={isSavingPosition}
          title={editingPosition ? "Edit Position" : "Add New Position"}
          onClose={() => {
            setEditingPosition(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void savePosition(payload);
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
      className="interactive-button rounded-full p-2 text-[#2865ba] hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Pencil className="h-4 w-4" />
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
  initialDescription = "",
  initialName = "",
  isSaving = false,
  title,
  nameLabel,
  onSave,
  onClose,
  submitLabel = "Save",
}: {
  initialDescription?: string;
  initialName?: string;
  isSaving?: boolean;
  title: string;
  nameLabel: string;
  onSave: (payload: { name: string; description: string }) => void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialDescription, initialName]);

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

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : submitLabel}
        />
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
  title,
  skills,
  initialTitle = "",
  initialDescription = "",
  initialResponsibilities = [""],
  initialSkillIds = [],
  isSaving = false,
  onSave,
  onClose,
}: {
  title?: string;
  skills: SkillItem[];
  initialTitle?: string;
  initialDescription?: string;
  initialResponsibilities?: string[];
  initialSkillIds?: string[];
  isSaving?: boolean;
  onSave: (payload: Omit<PositionItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [positionTitle, setPositionTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialResponsibilities.length > 0 ? initialResponsibilities : [""],
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialSkillIds);

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
    <BaseModal title={title ?? "Add New Position"} onClose={onClose} maxWidthClass="max-w-[760px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            title: positionTitle.trim(),
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
            value={positionTitle}
            onChange={(event) => setPositionTitle(event.target.value)}
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

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
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

function ModalActions({
  onClose,
  submitDisabled = false,
  submitLabel = "Save",
}: {
  onClose: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
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
        disabled={submitDisabled}
        className="interactive-button flex-1 rounded-xl bg-[#2865ba] px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(40,101,186,0.22)] hover:bg-[#2159a8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </div>
  );
}
