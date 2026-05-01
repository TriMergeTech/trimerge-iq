"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
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

import {
  readStoredAdminPeople,
  writeStoredAdminPeople,
  type StoredAdminPerson,
} from "./adminRegistryState";
import { ADMIN_API_BASE_URL, authenticatedAdminFetch } from "./adminAuth";

type AdminSection = "staff" | "admin" | "position" | "skills" | "services" | "clients";
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

interface ClientItem {
  id: string;
  name: string;
  about: string;
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

interface ServiceApiRecord {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  descriptions?: string;
  description?: string;
  skills?: string[];
  createdAt?: string;
  created_at?: string;
}

interface ClientApiRecord {
  id?: string;
  _id?: string;
  name?: string;
  about?: string;
  createdAt?: string;
  created_at?: string;
}

interface StaffApiRecord {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  position?: string | { id?: string; _id?: string; name?: string; title?: string };
  createdAt?: string;
  created_at?: string;
}

interface UserApiRecord {
  id?: string;
  _id?: string;
  user_id?: string;
  uuid?: string;
  fullName?: string;
  full_name?: string;
  name?: string;
  email?: string;
  profile?: string;
  role?: string;
  createdAt?: string;
  created_at?: string;
}

const INITIAL_SKILLS: SkillItem[] = [];

const INITIAL_POSITIONS: PositionItem[] = [];
const API_BASE_URL = ADMIN_API_BASE_URL;

function uniqueById<T extends { id: string }>(records: T[]) {
  const seenIds = new Set<string>();
  return records.filter((record) => {
    if (seenIds.has(record.id)) return false;
    seenIds.add(record.id);
    return true;
  });
}

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

function mapServiceFromApi(service: ServiceApiRecord, skills: SkillItem[]): ServiceItem {
  const skillIds = (service.skills ?? [])
    .map((skillNameOrId) => {
      const normalizedSkill = skillNameOrId.toLowerCase();
      return skills.find(
        (skill) => skill.id === skillNameOrId || skill.name.toLowerCase() === normalizedSkill,
      )?.id;
    })
    .filter((skillId): skillId is string => Boolean(skillId));

  return {
    id:
      service.id ??
      service._id ??
      `${service.title ?? service.name ?? "service"}-${service.createdAt ?? service.created_at ?? "local"}`,
    name: service.title ?? service.name ?? "Untitled Service",
    description: service.descriptions ?? service.description ?? "",
    skillIds,
    positionIds: [],
    createdAt:
      service.createdAt || service.created_at
        ? new Date(service.createdAt ?? service.created_at ?? "")
        : new Date(),
  };
}

function mapClientFromApi(client: ClientApiRecord): ClientItem {
  return {
    id: client.id ?? client._id ?? `${client.name ?? "client"}-${client.createdAt ?? client.created_at ?? "local"}`,
    name: client.name ?? "Untitled Client",
    about: client.about ?? "",
    createdAt:
      client.createdAt || client.created_at
        ? new Date(client.createdAt ?? client.created_at ?? "")
        : new Date(),
  };
}

function getPositionIdFromApi(position: StaffApiRecord["position"]) {
  if (typeof position === "string") return position;
  if (position && typeof position === "object") return position.id ?? position._id;
  return undefined;
}

function mapStaffFromApi(staff: StaffApiRecord): StaffMember {
  return {
    id: staff.id ?? staff._id ?? staff.email ?? `${staff.name ?? "staff"}-${staff.createdAt ?? staff.created_at ?? "local"}`,
    name: staff.name ?? staff.email ?? "Unnamed staff",
    email: staff.email ?? "",
    positionId: getPositionIdFromApi(staff.position),
    createdAt:
      staff.createdAt || staff.created_at
        ? new Date(staff.createdAt ?? staff.created_at ?? "")
        : new Date(),
  };
}

function mapUserFromApi(user: UserApiRecord): StaffMember {
  const email = user.email ?? "";
  const fallbackName = email ? email.split("@")[0]?.replace(/[._-]+/g, " ") : "Unnamed user";

  return {
    id: user.id ?? user._id ?? user.user_id ?? user.uuid ?? email,
    name: user.fullName ?? user.full_name ?? user.name ?? fallbackName,
    email,
    createdAt:
      user.createdAt || user.created_at
        ? new Date(user.createdAt ?? user.created_at ?? "")
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

function extractServiceRecords(payload: unknown): ServiceApiRecord[] {
  if (Array.isArray(payload)) return payload as ServiceApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { data?: unknown; service?: unknown; services?: unknown };
    if (Array.isArray(typedPayload.services)) return typedPayload.services as ServiceApiRecord[];
    if (typedPayload.service && typeof typedPayload.service === "object") {
      return [typedPayload.service as ServiceApiRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as ServiceApiRecord[];

    if (data && typeof data === "object") return [data as ServiceApiRecord];
    return [payload as ServiceApiRecord];
  }

  return [];
}

function extractClientRecords(payload: unknown): ClientApiRecord[] {
  if (Array.isArray(payload)) return payload as ClientApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { data?: unknown; client?: unknown; clients?: unknown };
    if (Array.isArray(typedPayload.clients)) return typedPayload.clients as ClientApiRecord[];
    if (typedPayload.client && typeof typedPayload.client === "object") {
      return [typedPayload.client as ClientApiRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as ClientApiRecord[];

    if (data && typeof data === "object") return [data as ClientApiRecord];
    return [payload as ClientApiRecord];
  }

  return [];
}

function extractStaffRecords(payload: unknown): StaffApiRecord[] {
  if (Array.isArray(payload)) return payload as StaffApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { data?: unknown; staff?: unknown; staffs?: unknown; members?: unknown };
    if (Array.isArray(typedPayload.staff)) return typedPayload.staff as StaffApiRecord[];
    if (Array.isArray(typedPayload.staffs)) return typedPayload.staffs as StaffApiRecord[];
    if (Array.isArray(typedPayload.members)) return typedPayload.members as StaffApiRecord[];
    if (typedPayload.staff && typeof typedPayload.staff === "object") {
      return [typedPayload.staff as StaffApiRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as StaffApiRecord[];
    if (data && typeof data === "object") return [data as StaffApiRecord];
    return [payload as StaffApiRecord];
  }

  return [];
}

function extractUserRecords(payload: unknown): UserApiRecord[] {
  if (Array.isArray(payload)) return payload as UserApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { data?: unknown; user?: unknown; users?: unknown; profile?: unknown };
    if (Array.isArray(typedPayload.users)) return typedPayload.users as UserApiRecord[];
    if (typedPayload.user && typeof typedPayload.user === "object") return [typedPayload.user as UserApiRecord];
    if (typedPayload.profile && typeof typedPayload.profile === "object") return [typedPayload.profile as UserApiRecord];

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as UserApiRecord[];

    if (data && typeof data === "object") return [data as UserApiRecord];
    return [payload as UserApiRecord];
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
  clients: { label: "Clients Management", icon: Building2, addLabel: "Add New" },
  admin: { label: "Admin Management", icon: UserCog, addLabel: "Add New" },
};

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("admin@trimerge.com");
  const [loggedInProfile, setLoggedInProfile] = useState("checking");
  const [accessToken, setAccessToken] = useState("");
  const [openModal, setOpenModal] = useState<CreateModal>(null);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [isLoadingSkillDetails, setIsLoadingSkillDetails] = useState(false);
  const [isSavingPosition, setIsSavingPosition] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [skillError, setSkillError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [clientError, setClientError] = useState("");
  const [staffError, setStaffError] = useState("");
  const [userError, setUserError] = useState("");

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() =>
    readStoredAdminPeople().filter((person) => person.role === "staff"),
  );
  const [adminMembers, setAdminMembers] = useState<StaffMember[]>(() =>
    readStoredAdminPeople().filter((person) => person.role === "admin"),
  );
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>(INITIAL_POSITIONS);

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    const storedAccessToken = localStorage.getItem("trimerge_admin_access_token");
    const storedProfile = localStorage.getItem("trimerge_admin_profile");
    if (storedEmail) setLoggedInEmail(storedEmail);
    if (storedAccessToken) setAccessToken(storedAccessToken);
    if (storedProfile) setLoggedInProfile(storedProfile);
  }, []);

  const adminFetch = useCallback(
    (pathOrUrl: string, init?: RequestInit) =>
      authenticatedAdminFetch(pathOrUrl, {
        ...init,
        onTokenRefresh: setAccessToken,
      }),
    [],
  );

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadCurrentUser = async () => {
      try {
        const response = await adminFetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to verify current user (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const currentUser = extractUserRecords(payload)[0];
        const currentProfile = (currentUser?.profile ?? currentUser?.role ?? "unknown").toLowerCase();
        const currentEmail = currentUser?.email;
        const currentStaffMember = currentUser ? mapUserFromApi(currentUser) : null;

        if (!ignore) {
          setLoggedInProfile(currentProfile);
          localStorage.setItem("trimerge_admin_profile", currentProfile);

          if (currentEmail) {
            setLoggedInEmail(currentEmail);
            localStorage.setItem("trimerge_admin_email", currentEmail);
          }

          if (currentStaffMember && currentProfile === "admin") {
            setAdminMembers((current) => uniqueById([currentStaffMember, ...current]));
          } else if (currentStaffMember && currentProfile === "staff") {
            setStaffMembers((current) => uniqueById([currentStaffMember, ...current]));
          }
        }
      } catch (error) {
        if (!ignore) {
          setLoggedInProfile("unknown");
          setUserError(error instanceof Error ? error.message : "Unable to verify current user.");
        }
      }
    };

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch]);

  useEffect(() => {
    const people: StoredAdminPerson[] = [
      ...staffMembers.map((member) => ({ ...member, role: "staff" as const })),
      ...adminMembers.map((member) => ({ ...member, role: "admin" as const })),
    ];

    writeStoredAdminPeople(uniqueById(people));
  }, [adminMembers, staffMembers]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadStaff = async () => {
      try {
        setIsLoadingStaff(true);
        setStaffError("");

        const response = await adminFetch(`${API_BASE_URL}/staff`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load staff (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const apiStaff = extractStaffRecords(payload).map(mapStaffFromApi);

        if (!ignore) {
          setStaffMembers(apiStaff);
        }
      } catch (error) {
        if (!ignore) {
          setStaffError(error instanceof Error ? error.message : "Unable to load staff.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingStaff(false);
        }
      }
    };

    void loadStaff();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        setUserError("");

        const response = await adminFetch(`${API_BASE_URL}/auth/admin/users`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 403) {
          if (!ignore) {
            setAdminMembers([]);
            setUserError(
              `Admin Management is available only for backend admins. Your current backend role is "${loggedInProfile}".`,
            );
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Unable to load users (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const userRecords = extractUserRecords(payload);
        const apiUsers = userRecords.map(mapUserFromApi);

        if (!ignore) {
          setAdminMembers((current) => uniqueById([
            ...apiUsers.filter((user) => {
              const original = userRecords.find((item) => {
                const itemId = item.id ?? item._id ?? item.user_id ?? item.uuid ?? item.email;
                return itemId === user.id;
              });
              const role = (original?.profile ?? original?.role ?? "").toLowerCase();
              return role === "admin";
            }),
            ...current,
          ]));
        }
      } catch (error) {
        if (!ignore) {
          setUserError(error instanceof Error ? error.message : "Unable to load users.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingUsers(false);
        }
      }
    };

    void loadUsers();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch, loggedInProfile]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadSkills = async () => {
      try {
        setIsLoadingSkills(true);
        setSkillError("");

        const response = await adminFetch(`${API_BASE_URL}/skills`, {
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
  }, [accessToken, adminFetch]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadPositions = async () => {
      try {
        setIsLoadingPositions(true);
        setPositionError("");

        const response = await adminFetch(`${API_BASE_URL}/positions`, {
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
  }, [accessToken, adminFetch, skills]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        setServiceError("");

        const response = await adminFetch(`${API_BASE_URL}/services`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load services (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const apiServices = extractServiceRecords(payload).map((service) =>
          mapServiceFromApi(service, skills),
        );

        if (!ignore) {
          setServices((current) => uniqueById([...apiServices, ...current]));
        }
      } catch (error) {
        if (!ignore) {
          setServiceError(error instanceof Error ? error.message : "Unable to load services.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingServices(false);
        }
      }
    };

    void loadServices();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch, skills]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        setClientError("");

        const response = await adminFetch(`${API_BASE_URL}/clients`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load clients (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const apiClients = extractClientRecords(payload).map(mapClientFromApi);

        if (!ignore) {
          setClients((current) => uniqueById([...apiClients, ...current]));
        }
      } catch (error) {
        if (!ignore) {
          setClientError(error instanceof Error ? error.message : "Unable to load clients.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingClients(false);
        }
      }
    };

    void loadClients();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch]);

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

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) || client.about.toLowerCase().includes(query),
    );
  }, [clients, searchQuery]);

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
    clients: clients.length,
  }[activeSection];

  const openCreateModal = () => {
    if (activeSection === "staff") {
      setEditingStaff(null);
      setStaffError("");
    }
    if (activeSection === "skills") {
      setEditingSkill(null);
      setSkillError("");
    }
    if (activeSection === "position") {
      setEditingPosition(null);
      setPositionError("");
    }
    if (activeSection === "clients") {
      setEditingClient(null);
      setClientError("");
    }
    setOpenModal(activeSection);
  };

  const saveStaff = async (payload: { name: string; email: string; positionId?: string }) => {
    try {
      setIsSavingStaff(true);
      setStaffError("");
      if (!accessToken) throw new Error("Sign in before saving staff.");
      if (!payload.positionId) throw new Error("Choose a position before saving staff.");

      if (editingStaff) {
        const response = await adminFetch(`${API_BASE_URL}/staff/${editingStaff.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            position: payload.positionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to update staff (${response.status})`);
        }

        const updatedPayload = await parseJsonSafely(response);
        const updatedStaff = extractStaffRecords(updatedPayload)[0];
        const nextStaff = updatedStaff ? mapStaffFromApi(updatedStaff) : { ...editingStaff, ...payload };

        setStaffMembers((current) =>
          current.map((member) => (member.id === editingStaff.id ? nextStaff : member)),
        );
      } else {
        const response = await adminFetch(`${API_BASE_URL}/staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            position: payload.positionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to create staff (${response.status})`);
        }

        const createdPayload = await parseJsonSafely(response);
        const createdStaff = extractStaffRecords(createdPayload)[0];

        if (createdStaff) {
          setStaffMembers((current) => uniqueById([...current, mapStaffFromApi(createdStaff)]));
        }
      }

      setEditingStaff(null);
      setOpenModal(null);
    } catch (error) {
      setStaffError(error instanceof Error ? error.message : "Unable to save staff.");
    } finally {
      setIsSavingStaff(false);
    }
  };

  const openEditStaffModal = (staffId: string) => {
    const existingStaff = staffMembers.find((item) => item.id === staffId);
    if (!existingStaff) {
      setStaffError("Unable to load staff.");
      return;
    }

    setStaffError("");
    setEditingStaff(existingStaff);
    setOpenModal("staff");
  };

  const removeStaff = async (staffId: string) => {
    try {
      setStaffError("");
      if (!accessToken) throw new Error("Sign in before deleting staff.");

      const response = await adminFetch(`${API_BASE_URL}/staff/${staffId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to delete staff (${response.status})`);
      }

      setStaffMembers((current) => current.filter((item) => item.id !== staffId));
    } catch (error) {
      setStaffError(error instanceof Error ? error.message : "Unable to delete staff.");
    }
  };

  const saveSkill = async (payload: { name: string; description: string }) => {
    try {
      setIsSavingSkill(true);
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before saving skills.");

      if (editingSkill) {
        const response = await adminFetch(`${API_BASE_URL}/skills/${editingSkill.id}`, {
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
      } else {
        const response = await adminFetch(`${API_BASE_URL}/skills`, {
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

        if (createdSkill) {
          setSkills((current) => [...current, mapSkillFromApi(createdSkill)]);
        }
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
      if (!accessToken) throw new Error("Sign in before loading skills.");

      const response = await adminFetch(`${API_BASE_URL}/skills/${skillId}`, {
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
      if (!accessToken) throw new Error("Sign in before deleting skills.");

      const response = await adminFetch(`${API_BASE_URL}/skills/${skillId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to delete skill (${response.status})`);
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
      setPositionError("");
      if (!accessToken) throw new Error("Sign in before deleting positions.");

      const response = await adminFetch(`${API_BASE_URL}/positions/${positionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to delete position (${response.status})`);
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
      if (!accessToken) throw new Error("Sign in before saving positions.");

      if (editingPosition) {
        const response = await adminFetch(`${API_BASE_URL}/positions/${editingPosition.id}`, {
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
      } else {
        const response = await adminFetch(`${API_BASE_URL}/positions`, {
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
      }

      setEditingPosition(null);
      setOpenModal(null);
    } catch (error) {
      setPositionError(error instanceof Error ? error.message : "Unable to save position.");
    } finally {
      setIsSavingPosition(false);
    }
  };

  const saveService = async (payload: Omit<ServiceItem, "id" | "createdAt">) => {
    try {
      setIsSavingService(true);
      setServiceError("");
      if (!accessToken) throw new Error("Sign in before saving services.");

      const response = await adminFetch(`${API_BASE_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: payload.name,
          descriptions: payload.description,
          skills: payload.skillIds
            .map((skillId) => skills.find((skill) => skill.id === skillId)?.name)
            .filter((skillName): skillName is string => Boolean(skillName)),
        }),
      });

      if (!response.ok) {
        throw new Error(`Unable to create service (${response.status})`);
      }

      const createdPayload = await parseJsonSafely(response);
      const createdService = extractServiceRecords(createdPayload)[0];

      if (createdService) {
        setServices((current) => [...current, mapServiceFromApi(createdService, skills)]);
      }

      setOpenModal(null);
    } catch (error) {
      setServiceError(error instanceof Error ? error.message : "Unable to save service.");
    } finally {
      setIsSavingService(false);
    }
  };

  const removeService = async (serviceId: string) => {
    try {
      setServiceError("");
      if (!accessToken) throw new Error("Sign in before deleting services.");

      const response = await adminFetch(`${API_BASE_URL}/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to delete service (${response.status})`);
      }

      setServices((current) => current.filter((item) => item.id !== serviceId));
    } catch (error) {
      setServiceError(error instanceof Error ? error.message : "Unable to delete service.");
    }
  };

  const openEditClientModal = (clientId: string) => {
    const existingClient = clients.find((item) => item.id === clientId);
    if (!existingClient) {
      setClientError("Unable to load client.");
      return;
    }

    setClientError("");
    setEditingClient(existingClient);
    setOpenModal("clients");
  };

  const saveClient = async (payload: Omit<ClientItem, "id" | "createdAt">) => {
    try {
      setIsSavingClient(true);
      setClientError("");
      if (!accessToken) throw new Error("Sign in before saving clients.");

      if (editingClient) {
        const response = await adminFetch(`${API_BASE_URL}/clients/${editingClient.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.name,
            about: payload.about,
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to update client (${response.status})`);
        }

        const updatedPayload = await parseJsonSafely(response);
        const updatedClient = extractClientRecords(updatedPayload)[0];
        const nextClient = updatedClient ? mapClientFromApi(updatedClient) : { ...editingClient, ...payload };

        setClients((current) =>
          current.map((client) => (client.id === editingClient.id ? nextClient : client)),
        );
      } else {
        const response = await adminFetch(`${API_BASE_URL}/clients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.name,
            about: payload.about,
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to create client (${response.status})`);
        }

        const createdPayload = await parseJsonSafely(response);
        const createdClient = extractClientRecords(createdPayload)[0];

        if (createdClient) {
          setClients((current) => [...current, mapClientFromApi(createdClient)]);
        }
      }

      setEditingClient(null);
      setOpenModal(null);
    } catch (error) {
      setClientError(error instanceof Error ? error.message : "Unable to save client.");
    } finally {
      setIsSavingClient(false);
    }
  };

  const removeClient = async (clientId: string) => {
    try {
      setClientError("");
      if (!accessToken) throw new Error("Sign in before deleting clients.");

      const response = await adminFetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to delete client (${response.status})`);
      }

      setClients((current) => current.filter((item) => item.id !== clientId));
    } catch (error) {
      setClientError(error instanceof Error ? error.message : "Unable to delete client.");
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
              <p className="text-xs text-white/64">Backend role: {loggedInProfile}</p>
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
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#f0ca44]">
              {loggedInProfile}
            </p>
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
                disabled={activeSection === "admin"}
                className="interactive-button inline-flex items-center gap-2 rounded-xl bg-[#2865ba] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(40,101,186,0.24)] hover:bg-[#2159a8] disabled:cursor-not-allowed disabled:bg-[#8ba0c8] disabled:shadow-none"
              >
                <Plus className="h-4 w-4" />
                <span>{activeSection === "admin" ? "View Only" : activeSectionMeta.addLabel}</span>
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

          {activeSection === "services" && serviceError && (
            <div className="mb-5 rounded-2xl border border-[#f6c5cf] bg-[#fff5f7] px-5 py-4 text-sm text-[#a8485f]">
              {serviceError}
            </div>
          )}

          {activeSection === "clients" && clientError && (
            <div className="mb-5 rounded-2xl border border-[#f6c5cf] bg-[#fff5f7] px-5 py-4 text-sm text-[#a8485f]">
              {clientError}
            </div>
          )}

          {activeSection === "staff" && staffError && (
            <div className="mb-5 rounded-2xl border border-[#f6c5cf] bg-[#fff5f7] px-5 py-4 text-sm text-[#a8485f]">
              {staffError}
            </div>
          )}

          {activeSection === "admin" && userError && (
            <div className="mb-5 rounded-2xl border border-[#d8e2f1] bg-[#f7faff] px-5 py-4 text-sm text-[#53657d]">
              {userError}
            </div>
          )}

          {activeSection === "staff" && (
            <ManagementTable
              headers={["Name", "Email", "Position", "Created", "Actions"]}
              emptyMessage={isLoadingStaff ? "Loading staff..." : "No staff members found."}
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
                    <div className="flex justify-end gap-2">
                      <EditButton
                        onClick={() => {
                          openEditStaffModal(member.id);
                        }}
                      />
                      <DeleteButton onClick={() => { void removeStaff(member.id); }} />
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
                <tr key={member.id} className="border-t border-[#eef2f8]">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{member.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{member.email}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{member.createdAt.toLocaleDateString()}</td>
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
              emptyMessage={isLoadingServices ? "Loading services..." : "No services found."}
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
                    <DeleteButton onClick={() => { void removeService(service.id); }} />
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
                <tr key={client.id} className="border-t border-[#eef2f8] align-top">
                  <td className="px-6 py-5 text-sm font-semibold text-[#263247]">{client.name}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{client.about || "None"}</td>
                  <td className="px-6 py-5 text-sm text-[#5f6b7c]">{client.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <EditButton
                        onClick={() => {
                          openEditClientModal(client.id);
                        }}
                      />
                      <DeleteButton onClick={() => { void removeClient(client.id); }} />
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
          initialEmail={editingStaff?.email ?? ""}
          initialName={editingStaff?.name ?? ""}
          initialPositionId={editingStaff?.positionId ?? ""}
          isSaving={isSavingStaff}
          title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
          positions={positions}
          onClose={() => {
            setEditingStaff(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void saveStaff(payload);
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
            void saveService(payload);
          }}
          isSaving={isSavingService}
        />
      )}

      {openModal === "clients" && (
        <ClientModal
          initialAbout={editingClient?.about ?? ""}
          initialName={editingClient?.name ?? ""}
          isSaving={isSavingClient}
          title={editingClient ? "Edit Client" : "Add New Client"}
          onClose={() => {
            setEditingClient(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void saveClient(payload);
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
  initialEmail = "",
  initialName = "",
  initialPositionId = "",
  isSaving = false,
  title,
  positions,
  onSave,
  onClose,
}: {
  initialEmail?: string;
  initialName?: string;
  initialPositionId?: string;
  isSaving?: boolean;
  title: string;
  positions?: PositionItem[];
  onSave: (payload: { name: string; email: string; positionId?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [positionId, setPositionId] = useState(initialPositionId);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setPositionId(initialPositionId);
  }, [initialEmail, initialName, initialPositionId]);

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
            disabled={isSaving}
          />
        </ModalField>

        <ModalField label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="interactive-input w-full rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
            disabled={isSaving}
          />
        </ModalField>

        {positions && (
          <ModalField label="Position">
            <select
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              className="interactive-input w-full rounded-xl border border-[#dfe5ef] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
              required
              disabled={isSaving}
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

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
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

function ClientModal({
  initialAbout = "",
  initialName = "",
  isSaving = false,
  title,
  onSave,
  onClose,
}: {
  initialAbout?: string;
  initialName?: string;
  isSaving?: boolean;
  title: string;
  onSave: (payload: Omit<ClientItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [about, setAbout] = useState(initialAbout);

  useEffect(() => {
    setName(initialName);
    setAbout(initialAbout);
  }, [initialAbout, initialName]);

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), about: about.trim() });
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

        <ModalField label="About">
          <textarea
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            rows={4}
            className="interactive-input w-full resize-none rounded-xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2865ba]"
            required
          />
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

function ServiceModal({
  title,
  skills,
  positions,
  isSaving = false,
  onSave,
  onClose,
}: {
  title: string;
  skills: SkillItem[];
  positions: PositionItem[];
  isSaving?: boolean;
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

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
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
