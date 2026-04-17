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

// Positions API integration (GET/POST/GET by ID/PUT/DELETE) with env-based base URL and optional bearer token.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://trimerge-iq.onrender.com";

interface PositionApiModel {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  responsibility?: string[];
  responsibilities?: string[];
  skills?: string[];
  skillIds?: string[];
  createdAt?: string;
}

interface PositionListResponseEnvelope {
  data?: PositionApiModel[];
  positions?: PositionApiModel[];
  items?: PositionApiModel[];
}

class PositionApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getPositionAuthToken() {
  if (typeof window === "undefined") return "";

  const tokenKeys = ["trimerge_access_token", "accessToken", "token"];
  const token = tokenKeys
    .map((key) => localStorage.getItem(key) ?? "")
    .find((value) => value.trim().length > 0);

  return token ?? "";
}

function getPositionRefreshToken() {
  if (typeof window === "undefined") return "";

  const refreshTokenKeys = ["trimerge_refresh_token", "refreshToken"];
  const refreshToken = refreshTokenKeys
    .map((key) => localStorage.getItem(key) ?? "")
    .find((value) => value.trim().length > 0);

  return refreshToken ?? "";
}

async function refreshPositionAccessToken() {
  const refreshToken = getPositionRefreshToken();
  if (!refreshToken) return "";

  const parseTokens = (
    payload: {
      access_token?: string;
      accessToken?: string;
      token?: string;
      refresh_token?: string;
      refreshToken?: string;
      data?: {
        access_token?: string;
        accessToken?: string;
        token?: string;
        refresh_token?: string;
        refreshToken?: string;
      };
    },
  ) => {
    const source = payload.data ?? payload;
    return {
      accessToken: source.access_token ?? source.accessToken ?? source.token ?? "",
      nextRefreshToken: source.refresh_token ?? source.refreshToken ?? "",
    };
  };

  const tryRefresh = async (includeAuthHeader: boolean) => fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(includeAuthHeader ? { Authorization: `Bearer ${refreshToken}` } : {}),
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
      refreshToken,
      token: refreshToken,
    }),
  });

  let response = await tryRefresh(true);
  if (!response.ok) {
    response = await tryRefresh(false);
  }

  if (!response.ok) return "";

  const data = (await response.json()) as {
    access_token?: string;
    accessToken?: string;
    token?: string;
    refresh_token?: string;
    refreshToken?: string;
    data?: {
      access_token?: string;
      accessToken?: string;
      token?: string;
      refresh_token?: string;
      refreshToken?: string;
    };
  };

  const { accessToken, nextRefreshToken } = parseTokens(data);

  if (!accessToken) return "";

  localStorage.setItem("trimerge_access_token", accessToken);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("token", accessToken);

  if (nextRefreshToken) {
    localStorage.setItem("trimerge_refresh_token", nextRefreshToken);
    localStorage.setItem("refreshToken", nextRefreshToken);
  }

  return accessToken;
}

function toPositionItem(position: PositionApiModel): PositionItem {
  const createdAt = position.createdAt ? new Date(position.createdAt) : new Date();
  const responsibilities = Array.isArray(position.responsibilities)
    ? position.responsibilities
    : (Array.isArray(position.responsibility) ? position.responsibility : []);
  const skills = Array.isArray(position.skillIds)
    ? position.skillIds
    : (Array.isArray(position.skills) ? position.skills : []);

  return {
    id: position._id ?? position.id ?? crypto.randomUUID(),
    title: position.title ?? position.name ?? "Untitled Position",
    description: position.description ?? "",
    responsibilities,
    skillIds: skills,
    createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
  };
}

function toPositionApiPayload(
  payload: Omit<PositionItem, "id" | "createdAt">,
  availableSkills: SkillItem[],
) {
  const skillNames = payload.skillIds
    .map((skillId) => availableSkills.find((skill) => skill.id === skillId)?.name ?? skillId)
    .filter(Boolean);

  return {
    name: payload.title,
    description: payload.description,
    responsibility: payload.responsibilities,
    skills: skillNames,
  };
}

function normalizePositionListResponse(
  response: PositionApiModel[] | PositionListResponseEnvelope,
): PositionApiModel[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.positions)) {
    return response.positions;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

async function requestPositions<T>(path: string, init?: RequestInit, canRetry = true): Promise<T> {
  const token = getPositionAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401 && canRetry) {
    const refreshedToken = await refreshPositionAccessToken();
    if (refreshedToken) {
      return requestPositions<T>(path, init, false);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new PositionApiError(
      response.status,
      errorText || `Positions API request failed (${response.status})`,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
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
  const [isPositionsLoading, setIsPositionsLoading] = useState(false);
  const [positionsApiError, setPositionsApiError] = useState("");
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [isPositionEditLoading, setIsPositionEditLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    if (storedEmail) setLoggedInEmail(storedEmail);
  }, []);

  useEffect(() => {
    let active = true;

    // GET /positions: load all positions for the management table.
    const loadPositions = async () => {
      setIsPositionsLoading(true);
      try {
        const response = await requestPositions<PositionApiModel[] | PositionListResponseEnvelope>("/positions");
        const records = normalizePositionListResponse(response);
        if (!active) return;

        setPositions(records.map(toPositionItem));
        setPositionsApiError("");
      } catch (error) {
        console.error("Failed to load positions from API", error);
        if (!active) return;

        const status = error instanceof PositionApiError ? error.status : 0;
        const message = error instanceof Error ? error.message : "";
        setPositionsApiError(
          status === 401
            ? "Unauthorized: please sign in to load positions."
            : status === 403
              ? "Forbidden: your account does not have permission to view positions."
              : status === 0
                ? `Could not load positions API. ${message}`
                : `Could not load positions API (status ${status}). ${message}`,
        );
      } finally {
        if (active) setIsPositionsLoading(false);
      }
    };

    void loadPositions();

    return () => {
      active = false;
    };
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
        .map((skillId) => skills.find((skill) => skill.id === skillId)?.name ?? skillId)
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
  const removePosition = async (positionId: string) => {
    // DELETE /positions/{id}: remove a position by id.
    try {
      await requestPositions(`/positions/${positionId}`, { method: "DELETE" });
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
      setPositionsApiError("");
    } catch (error) {
      console.error("Failed to delete position", error);
      const status = error instanceof PositionApiError ? error.status : 0;
      setPositionsApiError(
        status === 400
          ? "Invalid position ID."
          : status === 401
            ? "Unauthorized: please sign in to delete positions."
            : status === 403
              ? "Forbidden: staff or admin access is required."
              : status === 404
                ? "Position not found."
                : "Delete failed: position API is unavailable.",
      );
    }
  };

  const startEditPosition = async (positionId: string) => {
    // GET /positions/{id}: fetch one position before opening edit modal.
    setIsPositionEditLoading(true);
    try {
      const response = await requestPositions<PositionApiModel | { data?: PositionApiModel }>(`/positions/${positionId}`);
      const details = (response as { data?: PositionApiModel }).data ?? (response as PositionApiModel);
      setEditingPosition(toPositionItem(details));
      setPositionsApiError("");
    } catch (error) {
      console.error("Failed to fetch position details", error);
      const status = error instanceof PositionApiError ? error.status : 0;
      setPositionsApiError(
        status === 400
          ? "Invalid position ID."
          : status === 401
            ? "Unauthorized: please sign in to access position details."
            : status === 404
              ? "Position not found."
              : "Edit failed: could not load position details from API.",
      );
    } finally {
      setIsPositionEditLoading(false);
    }
  };

  const savePositionUpdate = async (positionId: string, payload: Omit<PositionItem, "id" | "createdAt">) => {
    // PUT /positions/{id}: persist updates from the edit modal.
    try {
      const response = await requestPositions<PositionApiModel | { data?: PositionApiModel }>(`/positions/${positionId}`, {
        method: "PUT",
        body: JSON.stringify(toPositionApiPayload(payload, skills)),
      });

      const updated = (response as { data?: PositionApiModel }).data ?? (response as PositionApiModel);
      const normalized = toPositionItem({ ...updated, _id: updated._id ?? updated.id ?? positionId });

      setPositions((current) =>
        current.map((item) => (item.id === positionId ? { ...normalized, id: positionId } : item)),
      );

      setPositionsApiError("");
      setEditingPosition(null);
    } catch (error) {
      console.error("Failed to update position", error);
      const status = error instanceof PositionApiError ? error.status : 0;
      setPositionsApiError(
        status === 400
          ? "Invalid ID or no valid fields to update."
          : status === 401
            ? "Unauthorized: please sign in to update positions."
            : status === 403
              ? "Forbidden: staff or admin access is required."
              : status === 404
                ? "Position not found."
                : "Update failed: position API is unavailable.",
      );
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
            <>
              {positionsApiError && (
                <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {positionsApiError}
                </p>
              )}

              {isPositionsLoading ? (
                <div className="rounded-2xl border border-[#e6edf8] bg-white px-6 py-5 text-sm text-[#5f6b7c]">
                  Loading positions...
                </div>
              ) : (
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
                            return (
                              <span
                                key={skillId}
                                className="rounded-full border border-[#d9e2f0] bg-[#f7faff] px-3 py-1 text-xs font-medium text-[#3b4f6b]"
                              >
                                {skill?.name ?? skillId}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <EditButton
                            onClick={() => void startEditPosition(position.id)}
                            disabled={isPositionEditLoading}
                          />
                          <DeleteButton onClick={() => void removePosition(position.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </ManagementTable>
              )}
            </>
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
          title="Add New Position"
          onClose={() => setOpenModal(null)}
          onSave={async (payload) => {
            // POST /positions: create a new position from modal form values.
            try {
              const response = await requestPositions<PositionApiModel | { data?: PositionApiModel }>("/positions", {
                method: "POST",
                body: JSON.stringify(toPositionApiPayload(payload, skills)),
              });

              const created = (response as { data?: PositionApiModel }).data ?? (response as PositionApiModel);
              setPositions((current) => [...current, toPositionItem(created)]);
              setPositionsApiError("");
              setOpenModal(null);
            } catch (error) {
              console.error("Failed to create position", error);
              setPositionsApiError("Create failed: position API is unavailable or unauthorized.");
            }
          }}
        />
      )}

      {editingPosition && (
        <PositionModal
          skills={skills}
          title="Edit Position"
          initialValues={editingPosition}
          submitLabel="Update"
          onClose={() => setEditingPosition(null)}
          onSave={async (payload) => {
            await savePositionUpdate(editingPosition.id, payload);
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

function EditButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
  title,
  initialValues,
  submitLabel,
  onSave,
  onClose,
}: {
  skills: SkillItem[];
  title: string;
  initialValues?: Omit<PositionItem, "createdAt">;
  submitLabel?: string;
  onSave: (payload: Omit<PositionItem, "id" | "createdAt">) => void | Promise<void>;
  onClose: () => void;
}) {
  const [positionTitle, setPositionTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialValues?.responsibilities.length ? initialValues.responsibilities : [""],
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialValues?.skillIds ?? []);

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
    <BaseModal title={title} onClose={onClose} maxWidthClass="max-w-[760px]">
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

        <ModalActions onClose={onClose} submitLabel={submitLabel} />
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
  submitLabel = "Save",
}: {
  onClose: () => void;
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
        className="interactive-button flex-1 rounded-xl bg-[#2865ba] px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(40,101,186,0.22)] hover:bg-[#2159a8]"
      >
        {submitLabel}
      </button>
    </div>
  );
}
