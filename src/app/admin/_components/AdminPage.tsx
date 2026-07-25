"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import {
  readStoredAdminPeople,
  writeStoredAdminPeople,
  type StoredAdminPerson,
} from "../../_shared/adminRegistryState";
import {
  ADMIN_API_BASE_URL,
  API_BASE_URL,
  authenticatedAdminFetch,
  PROFILE_SERVICE,
} from "../../_shared/adminAuth";
import styles from "./AdminPage.module.css";
import {
  SidebarButton,
  ManagementTable,
  DeleteButton,
  EditButton,
} from "./AdminPrimitives";
import {
  PersonModal,
  PlatformModal,
  SkillModal,
  RegistryModal,
  ClientModal,
  ServiceModal,
  PositionModal,
  type Certification,
} from "./AdminModals";
import {
  uniqueById,
  mapUserFromApi,
  extractUserRecords,
  parseJsonSafely,
  type AdminSection,
  type CreateModal,
  type StaffMember,
  type SkillItem,
  type ServiceItem,
  type ClientItem,
  type PositionItem,
} from "./adminTypes";

interface AdminPageProps {
  onLogout: () => void;
}

const INITIAL_SKILLS: SkillItem[] = [];

const INITIAL_POSITIONS: PositionItem[] = [];

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
  const [activeSection, setActiveSection] = useState<AdminSection>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("admin@trimerge.com");
  const [loggedInProfile, setLoggedInProfile] = useState("checking");
  const [accessToken, setAccessToken] = useState("");
  const [openModal, setOpenModal] = useState<CreateModal>(null);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(
    null,
  );
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editing_detail, set_editing_detail] = useState<any>(null);
  const [editing_platform, set_editing_platform] = useState<any>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [is_loading_platforms, set_is_loading_platforms] = useState(false);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [is_saving_platform, set_is_saving_platform] = useState(false);
  const [is_saving_detail, set_is_saving_detail] = useState(false);
  const [is_loading_detail, set_is_loading_detail] = useState(false);
  const [isLoadingSkillDetails, setIsLoadingSkillDetails] = useState(false);
  const [isSavingPosition, setIsSavingPosition] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [skillError, setSkillError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [tools_error, set_platform_error] = useState("");
  const [detail_error, set_detail_error] = useState("");
  const [clientError, setClientError] = useState("");
  const [staffError, setStaffError] = useState("");
  const [userError, setUserError] = useState("");
  const [certifications, set_certifications] = useState<Certification[]>([]);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() =>
    readStoredAdminPeople()
      .filter((person) => person.role === "staff")
      .map((person) => ({ ...person, _id: person.id, fullname: person.name })),
  );
  const [adminMembers, setAdminMembers] = useState<StaffMember[]>(() =>
    readStoredAdminPeople()
      .filter((person) => person.role === "admin")
      .map((person) => ({ ...person, _id: person.id, fullname: person.name })),
  );
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [company_details, set_company_details] = useState<any[]>([]);
  const [platforms, set_platforms] = useState<any[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>(INITIAL_POSITIONS);

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    const storedAccessToken = localStorage.getItem(
      "trimerge_admin_access_token",
    );
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
        const currentProfile = (
          currentUser?.profile ??
          currentUser?.role ??
          "unknown"
        ).toLowerCase();
        const currentEmail = currentUser?.email;
        const currentStaffMember = currentUser
          ? mapUserFromApi(currentUser)
          : null;

        if (!ignore) {
          setLoggedInProfile(currentProfile);
          localStorage.setItem("trimerge_admin_profile", currentProfile);

          if (currentEmail) {
            setLoggedInEmail(currentEmail);
            localStorage.setItem("trimerge_admin_email", currentEmail);
          }

          if (currentStaffMember && currentProfile === "admin") {
            setAdminMembers((current) =>
              uniqueById([currentStaffMember, ...current]),
            );
          } else if (currentStaffMember && currentProfile === "staff") {
            setStaffMembers((current) =>
              uniqueById([currentStaffMember, ...current]),
            );
          }
        }
      } catch (error) {
        if (!ignore) {
          setLoggedInProfile("unknown");
          setUserError(
            error instanceof Error
              ? error.message
              : "Unable to verify current user.",
          );
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
      ...staffMembers.map((member) => ({
        id: member._id,
        name: member.fullname ?? member.name ?? "",
        email: member.email,
        positionId: member.positionId ?? member.position,
        role: "staff" as const,
        createdAt: member.createdAt ?? new Date(),
      })),
      ...adminMembers.map((member) => ({
        id: member._id,
        name: member.fullname ?? member.name ?? "",
        email: member.email,
        positionId: member.positionId ?? member.position,
        role: "admin" as const,
        createdAt: member.createdAt ?? new Date(),
      })),
    ];

    const uniquePeople = Array.from(
      new Map(people.map((person) => [person.id, person])).values(),
    );

    writeStoredAdminPeople(uniquePeople);
  }, [adminMembers, staffMembers]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadStaff = async () => {
      try {
        setIsLoadingStaff(true);
        setStaffError("");

        const response = await fetch(`${PROFILE_SERVICE}/get_profiles`, {
          method: "POST",
          headers: {
            "x-api-version": "v3",
            "x-api-key": process.env.NEXT_PUBLIC_PROFILE_API_KEY ?? "",
          },
          body: JSON.stringify({
            profile_type: process.env.NEXT_PUBLIC_STAFF_PROFILE_TYPE,
          }),
        });

        let reply = await response.json();

        if (reply.ok) {
          setStaffMembers(reply.data);
        } else throw new Error(reply.data);
      } catch (error) {
        if (!ignore) {
          setStaffError(
            error instanceof Error ? error.message : "Unable to load staff.",
          );
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

    const load_company_details = async () => {
      try {
        set_is_loading_detail(true);
        set_detail_error("");

        let response = await fetch(`${API_BASE_URL}/get_company_details`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        let payload = await response.json();

        if (!payload.ok) {
          throw new Error(payload.message);
        }

        if (!ignore && payload.ok) {
          set_company_details(payload.data);
        }
      } catch (error) {
        if (!ignore) {
          set_detail_error(
            error instanceof Error ? error.message : "Unable to load skills.",
          );
        }
      } finally {
        if (!ignore) {
          set_is_loading_detail(false);
        }
      }
    };

    load_company_details();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

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
          setAdminMembers((current) =>
            uniqueById([
              ...apiUsers.filter((user) => {
                const original = userRecords.find((item) => {
                  const itemId =
                    item._id ?? item.user_id ?? item.uuid ?? item.email;
                  return itemId === user._id;
                });
                const role = (
                  original?.profile ??
                  original?.role ??
                  ""
                ).toLowerCase();
                return role === "admin";
              }),
              ...current,
            ]),
          );
        }
      } catch (error) {
        if (!ignore) {
          setUserError(
            error instanceof Error ? error.message : "Unable to load users.",
          );
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

        const response = await fetch(`${API_BASE_URL}/get_skills`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load skills (${response.status})`);
        }

        const payload = await response.json();

        if (!ignore && payload.ok) {
          setSkills(payload.data);
        }
      } catch (error) {
        if (!ignore) {
          setSkillError(
            error instanceof Error ? error.message : "Unable to load skills.",
          );
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

    const load_platforms = async () => {
      try {
        set_is_loading_platforms(true);
        set_platform_error("");

        const response = await fetch(`${API_BASE_URL}/get_platforms`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let payload = await response.json();
        if (payload.ok) {
          set_platforms(payload.data);
        } else throw new Error(payload.message);
      } catch (error) {
        if (!ignore) {
          set_platform_error(
            error instanceof Error
              ? error.message
              : "Unable to load platforms.",
          );
        }
      } finally {
        if (!ignore) {
          set_is_loading_platforms(false);
        }
      }
    };

    void load_platforms();

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

        const response = await fetch(`${API_BASE_URL}/get_positions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let payload = await response.json();
        if (payload.ok) {
          setPositions(payload.data);
        } else throw new Error(payload.message);
      } catch (error) {
        if (!ignore) {
          setPositionError(
            error instanceof Error
              ? error.message
              : "Unable to load positions.",
          );
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
  }, [accessToken, adminFetch]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        setServiceError("");

        const response = await fetch(`${API_BASE_URL}/get_services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = await response.json();

        if (!ignore) {
          setServices((current) => [...(payload.data || []), ...current]);
        }
      } catch (error) {
        if (!ignore) {
          setServiceError(
            error instanceof Error ? error.message : "Unable to load services.",
          );
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

        const response = await fetch(`${API_BASE_URL}/get_clients`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let reply = await response.json();
        if (reply.ok) {
          setClients((current) => uniqueById([...reply.data, ...current]));
        } else {
          throw new Error(reply.message);
        }
      } catch (error) {
        if (!ignore) {
          setClientError(
            error instanceof Error ? error.message : "Unable to load clients.",
          );
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
  }, [accessToken]);

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
    return staffMembers.filter((member) => {
      const positionName =
        positions.find(
          (position) => position._id === (member.positionId ?? member.position),
        )?.title ?? "";
      return (
        (member.fullname ?? member.name ?? "").toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        positionName.toLowerCase().includes(query)
      );
    });
  }, [positions, searchQuery, staffMembers]);

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return adminMembers;
    return adminMembers.filter(
      (member) =>
        (member.fullname ?? member.name ?? "").toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );
  }, [adminMembers, searchQuery]);

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return skills;
    return skills.filter(
      (skill) =>
        (skill.title ?? skill.name ?? "").toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query),
    );
  }, [searchQuery, skills]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // normalize and dedupe services by a stable key (_id or fallback)
    const uniqueMap = new Map<string, (typeof services)[number]>();
    for (const s of services) {
      const key =
        (s as any)._id ??
        `${(s as any).title ?? (s as any).name ?? "service"}-${(s as any).created ?? (s as any).createdAt ?? "local"}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, s);
    }
    const uniqueServices = Array.from(uniqueMap.values());

    if (!query) return uniqueServices;

    return uniqueServices.filter((service) => {
      const skillNames = (
        (service as any).skills ??
        []
      )
        .map(
          (skillId: string) =>
            skills.find((skill) => (skill as any)._id === skillId)?.title ??
            "",
        )
        .join(" ");
      const positionNames = (
        (service as any).positions ??
        []
      )
        .map(
          (positionId: string) =>
            positions.find((position) => (position as any)._id === positionId)
              ?.title ?? "",
        )
        .join(" ");
      const title = ((service as any).title ?? (service as any).name ?? "")
        .toString()
        .toLowerCase();
      const description = (
        (service as any).description ??
        (service as any).descriptions ??
        ""
      )
        .toString()
        .toLowerCase();

      return (
        title.includes(query) ||
        description.includes(query) ||
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
        client.name.toLowerCase().includes(query) ||
        client.about.toLowerCase().includes(query),
    );
  }, [clients, searchQuery]);

  const filteredPositions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return positions;
    return positions.filter((position) => {
      const skillNames = position.skillIds
        .map(
          (skillId) =>
            skills.find((skill) => skill._id === skillId)?.title ?? "",
        )
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
    company_overview: company_details.length,
    platforms: platforms.length,
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

  const saveStaff = async (payload: {
    fullname: string;
    email: string;
    positionId?: string;
  }) => {
    try {
      setIsSavingStaff(true);
      setStaffError("");
      if (!accessToken) throw new Error("Sign in before saving staff.");
      if (!payload.positionId)
        throw new Error("Choose a position before saving staff.");

      if (editingStaff) {
        const response = await fetch(`${PROFILE_SERVICE}/edit_profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-version": "v3",
            "x-api-key": process.env.NEXT_PUBLIC_PROFILE_API_KEY ?? "",
          },
          body: JSON.stringify({
            profle_id: editingStaff._id,
            profle_type: process.env.NEXT_PUBLIC_STAFF_PROFILE_TYPE,
            update: {
              fullname: payload.fullname,
              email: payload.email,
              position: payload.positionId,
            },
          }),
        });

        let res = await response.json();

        if (res.ok) {
          setStaffMembers((current) =>
            current.map((member) =>
              member._id === editingStaff._id ? res.data : member,
            ),
          );
        } else throw new Error(res.message);
      } else {
        const response = await fetch(`${PROFILE_SERVICE}/add_profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-version": "v3",
            "x-api-key": process.env.NEXT_PUBLIC_PROFILE_API_KEY ?? "",
          },
          body: JSON.stringify({
            profile_type: process.env.NEXT_PUBLIC_STAFF_PROFILE_TYPE,
            password: "@ABC-123",
            details: {
              fullname: payload.fullname,
              email: payload.email,
              position: payload.positionId,
            },
          }),
        });

        let reply = await response.json();
        if (reply.ok) {
          setStaffMembers((current) => uniqueById([...current, reply.data]));
        } else throw new Error(reply.message);
      }

      setEditingStaff(null);
      setOpenModal(null);
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Unable to save staff.",
      );
    } finally {
      setIsSavingStaff(false);
    }
  };

  const openEditStaffModal = (staffId: string) => {
    const existingStaff = staffMembers.find((item) => item._id === staffId);
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

      setStaffMembers((current) =>
        current.filter((item) => item._id !== staffId),
      );
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Unable to delete staff.",
      );
    }
  };

  const save_platform = async (payload: {
    name: string;
    url: string;
    description: string;
  }) => {
    try {
      set_is_saving_platform(true);
      set_platform_error("");

      if (!accessToken) throw new Error("Sign in before saving Tools.");

      if (editing_platform) {
        const response = await fetch(`${API_BASE_URL}/update_platform`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            platform: editing_platform._id,
            name: payload.name,
            description: payload.description,
            url: payload.url,
          }),
        });
        const reply = await response.json();

        if (reply.ok) {
          set_platforms((current) =>
            current.map((detail) =>
              detail._id === editing_platform._id ? reply.data : detail,
            ),
          );
        } else {
          set_platforms((current) =>
            current.map((detail) =>
              detail._id === editing_platform._id
                ? { ...editing_platform }
                : detail,
            ),
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_platform`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.name,
            description: payload.description,
            url: payload.url,
          }),
        });

        const reply = await response.json();

        if (reply.ok) {
          set_platforms((current) => [...current, reply.data]);
        } else throw new Error(reply.message);
      }

      set_editing_platform(null);
      setOpenModal(null);
    } catch (error) {
      set_platform_error(
        error instanceof Error ? error.message : "Unable to save skill.",
      );
    } finally {
      set_is_saving_platform(false);
    }
  };

  const remove_platform = async (tool_id: string) => {
    try {
      set_platform_error("");
      if (!accessToken) throw new Error("Sign in before deleting platform.");

      const response = await fetch(`${API_BASE_URL}/remove_platform`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ platform: tool_id }),
      });

      let repl = await response.json();
      if (repl?.ok) {
        set_platforms((current) =>
          current.filter((item) => item._id !== tool_id),
        );
      } else {
        throw new Error(repl.message);
      }
    } catch (error) {
      set_platform_error(
        error instanceof Error ? error.message : "Unable to delete platform.",
      );
    }
  };

  const save_detail = async (payload: { name: string; description: string }) => {
    try {
      set_is_saving_detail(true);
      set_detail_error("");

      if (!accessToken) throw new Error("Sign in before saving details.");

      if (editing_detail) {
        const response = await fetch(`${API_BASE_URL}/update_detail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            detail: editing_detail._id,
            title: payload.name,
            description: payload.description,
          }),
        });
        const reply = await response.json();

        if (reply.ok) {
          set_company_details((current) =>
            current.map((detail) =>
              detail._id === editing_detail._id ? reply.data : detail,
            ),
          );
        } else {
          set_company_details((current) =>
            current.map((detail) =>
              detail._id === editing_detail._id
                ? { ...editing_detail }
                : detail,
            ),
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_detail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: payload.name,
            detail: payload.description,
          }),
        });

        const reply = await response.json();

        if (reply.ok) {
          set_company_details((current) => [...current, reply.data]);
        } else throw new Error(reply.message);
      }

      set_editing_detail(null);
      setOpenModal(null);
    } catch (error) {
      set_detail_error(
        error instanceof Error ? error.message : "Unable to save skill.",
      );
    } finally {
      set_is_saving_detail(false);
    }
  };

  const remove_detail = async (detail_id: string) => {
    try {
      set_detail_error("");
      if (!accessToken) throw new Error("Sign in before deleting details.");

      const response = await fetch(`${API_BASE_URL}/remove_detail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ detail: detail_id }),
      });

      let repl = await response.json();
      if (repl?.ok) {
        set_company_details((current) =>
          current.filter((item) => item._id !== detail_id),
        );
      } else {
        throw new Error(repl.message);
      }
    } catch (error) {
      set_detail_error(
        error instanceof Error ? error.message : "Unable to delete detail.",
      );
    }
  };

  const saveSkill = async (payload: { name: string; description: string }) => {
    try {
      setIsSavingSkill(true);
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before saving skills.");

      if (editingSkill) {
        const response = await adminFetch(`${API_BASE_URL}/update_skill`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            skill: editingSkill._id,
            title: payload.name,
            description: payload.description,
          }),
        });
        const reply = await response.json();

        if (reply.ok) {
          setSkills((current) =>
            current.map((skill) =>
              skill._id === editingSkill._id ? reply.data : skill,
            ),
          );
        } else {
          setSkills((current) =>
            current.map((skill) =>
              skill._id === editingSkill._id ? { ...editingSkill } : skill,
            ),
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_skill`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: payload.name,
            description: payload.description,
          }),
        });

        const reply = await response.json();

        if (reply.ok) {
          setSkills((current) => [...current, reply.data]);
        }
      }

      setEditingSkill(null);
      setOpenModal(null);
    } catch (error) {
      setSkillError(
        error instanceof Error ? error.message : "Unable to save skill.",
      );
    } finally {
      setIsSavingSkill(false);
    }
  };

  const open_edit_detail_modal = async (detail: any) => {
    try {
      set_is_loading_detail(true);
      set_detail_error("");
      if (!accessToken) throw new Error("Sign in before loading details.");

      set_editing_detail(detail);

      setOpenModal("company_overview");
    } catch (error) {
      set_detail_error(
        error instanceof Error ? error.message : "Unable to load detail.",
      );
    } finally {
      set_is_loading_detail(false);
    }
  };

  const open_edit_platform_modal = async (platform: any) => {
    try {
      set_is_loading_platforms(true);
      set_platform_error("");
      if (!accessToken) throw new Error("Sign in before loading details.");

      set_editing_platform(platform);

      setOpenModal("platforms");
    } catch (error) {
      set_platform_error(
        error instanceof Error ? error.message : "Unable to load platform.",
      );
    } finally {
      set_is_loading_platforms(false);
    }
  };

  const openEditSkillModal = async (skill: SkillItem) => {
    try {
      setIsLoadingSkillDetails(true);
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before loading skills.");

      setEditingSkill(skill);

      setOpenModal("skills");
    } catch (error) {
      setSkillError(
        error instanceof Error ? error.message : "Unable to load skill.",
      );
    } finally {
      setIsLoadingSkillDetails(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before deleting skills.");

      const response = await fetch(`${API_BASE_URL}/remove_skill`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ skill: skillId }),
      });

      let reply = await response.json();

      if (reply.ok) {
        setSkills((current) => current.filter((item) => item._id !== skillId));
      } else throw new Error(reply.message);
    } catch (error) {
      setSkillError(
        error instanceof Error ? error.message : "Unable to delete skill.",
      );
    }
  };

  const removePosition = async (positionId: string) => {
    try {
      setPositionError("");
      if (!accessToken) throw new Error("Sign in before deleting positions.");

      const response = await fetch(`${API_BASE_URL}/remove_position`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ position: positionId }),
      });

      let reply = await response.json();

      if (reply.ok) {
        setPositions((current) =>
          current.filter((item) => item._id !== positionId),
        );
      } else {
        throw new Error(reply.message);
      }
    } catch (error) {
      setPositionError(
        error instanceof Error ? error.message : "Unable to delete position.",
      );
    }
  };

  const openEditPositionModal = (positionId: string) => {
    const existingPosition = positions.find((item) => item._id === positionId);
    if (!existingPosition) {
      setPositionError("Unable to load position.");
      return;
    }

    setPositionError("");
    setEditingPosition(existingPosition);
    setOpenModal("position");
  };

  const savePosition = async (
    payload: Omit<PositionItem, "_id" | "createdAt">,
  ) => {
    try {
      setIsSavingPosition(true);
      setPositionError("");
      if (!accessToken) throw new Error("Sign in before saving positions.");

      if (editingPosition) {
        const response = await fetch(`${API_BASE_URL}/update_position`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            position: editingPosition?._id,
            title: payload.title,
            description: payload.description,
            responsibilities: payload.responsibilities,
            skills: payload.skillIds,
          }),
        });

        let reply = await response.json();

        if (reply.ok) {
          setPositions((current) =>
            current.map((position) =>
              position._id === editingPosition._id ? reply.data : position,
            ),
          );
        } else {
          throw new Error(reply.message);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_position`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            responsibilities: payload.responsibilities,
            skills: payload.skillIds,
          }),
        });

        let reply = await response.json();

        if (reply.ok) {
          setPositions((current) => [...current, reply.data]);
        } else throw new Error(reply.message);
      }

      setEditingPosition(null);
      setOpenModal(null);
    } catch (error) {
      setPositionError(
        error instanceof Error ? error.message : "Unable to save position.",
      );
    } finally {
      setIsSavingPosition(false);
    }
  };

  const saveService = async (
    payload: Omit<ServiceItem, "_id" | "createdAt">,
  ) => {
    try {
      setIsSavingService(true);
      setServiceError("");
      if (!accessToken) throw new Error("Sign in before saving services.");

      let bdy = {
        title: payload.title,
        description: payload.description,
        skills: (payload.skills ?? [])
          .map(
            (skillId: string) =>
              skills.find((skill) => skill._id === skillId)?._id,
          )
          .filter((skillName: string | undefined): skillName is string =>
            Boolean(skillName),
          ),
      };
      const response = await fetch(`${API_BASE_URL}/add_service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bdy),
      });

      const resp = await response.json();

      if (resp?.ok) {
        setServices((current) => [...current, resp.data]);
      } else throw new Error(resp.message);

      setOpenModal(null);
    } catch (error) {
      setServiceError(
        error instanceof Error ? error.message : "Unable to save service.",
      );
    } finally {
      setIsSavingService(false);
    }
  };

  const removeService = async (serviceId: string) => {
    try {
      setServiceError("");
      if (!accessToken) throw new Error("Sign in before deleting services.");

      const response = await fetch(`${API_BASE_URL}/remove_service`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ service: serviceId }),
      });

      let repl = await response.json();
      if (repl?.ok) {
        setServices((current) =>
          current.filter((item) => item._id !== serviceId),
        );
      } else {
        throw new Error(repl.message);
      }
    } catch (error) {
      setServiceError(
        error instanceof Error ? error.message : "Unable to delete service.",
      );
    }
  };

  const openEditClientModal = (clientId: string) => {
    const existingClient = clients.find((item) => item._id === clientId);
    if (!existingClient) {
      setClientError("Unable to load client.");
      return;
    }

    setClientError("");
    setEditingClient(existingClient);
    setOpenModal("clients");
  };

  const saveClient = async (payload: Omit<ClientItem, "_id" | "createdAt">) => {
    try {
      setIsSavingClient(true);
      setClientError("");
      if (!accessToken) throw new Error("Sign in before saving clients.");

      if (editingClient) {
        const response = await fetch(`${API_BASE_URL}/edit_client`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            client: editingClient?._id,
            name: payload.name,
            description: payload.about,
          }),
        });

        let reply = await response.json();
        if (reply.ok) {
          setClients((current) =>
            current.map((client) =>
              client._id === editingClient._id ? reply.data : client,
            ),
          );
        } else throw new Error(reply.data);
      } else {
        const response = await fetch(`${API_BASE_URL}/add_client`, {
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

        let reply = await response.json();
        if (reply.ok) {
          setClients((current) => [...current, reply.data]);
        } else throw new Error(reply.message);
      }

      setEditingClient(null);
      setOpenModal(null);
    } catch (error) {
      setClientError(
        error instanceof Error ? error.message : "Unable to save client.",
      );
    } finally {
      setIsSavingClient(false);
    }
  };

  const removeClient = async (clientId: string) => {
    try {
      setClientError("");
      if (!accessToken) throw new Error("Sign in before deleting clients.");

      const response = await fetch(`${API_BASE_URL}/remove_client`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ client: clientId }),
      });

      let reply = await response.json();
      if (reply.ok)
        setClients((current) =>
          current.filter((item) => item._id !== clientId),
        );
      else throw new Error(reply.message);
    } catch (error) {
      setClientError(
        error instanceof Error ? error.message : "Unable to delete client.",
      );
    }
  };

  return (
    <div className={styles.shell}>
      {/* ---- SIDEBAR ---- */}
      <aside className={styles.sidebar}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            <Shield />
          </div>
          <div>
            <div className={styles.userName}>{loggedInName}</div>
            <div className={styles.userRole}>
              Backend role: {loggedInProfile}
            </div>
          </div>
        </div>

        <nav className={styles.navList}>
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

      {/* ---- MAIN ---- */}
      <div className={styles.main}>
        <div className={styles.pageHead}>
          <div className={styles.headRow}>
            <div>
              <h1 className={styles.pageTitle}>{activeSectionMeta.label}</h1>
              <p className={styles.pageSub}>
                Manage {activeCount} registry entries
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              disabled={activeSection === "admin"}
              className={styles.addBtn}
            >
              <Plus />
              <span>
                {activeSection === "admin"
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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

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
          {activeSection === "company_overview" && userError && (
            <div className={styles.infoBanner}>{detail_error}</div>
          )}
          {activeSection === "platforms" && userError && (
            <div className={styles.infoBanner}>{tools_error}</div>
          )}

          {activeSection === "staff" && (
            <ManagementTable
              headers={["Fullname", "Email", "Position", "Created", "Actions"]}
              emptyMessage={
                isLoadingStaff ? "Loading staff..." : "No staff members found."
              }
            >
              {filteredStaff.map((member) => (
                <tr key={member._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {member.fullname ?? member.name}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {member.email}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {positions.find(
                      (p) => p._id === (member.positionId ?? member.position),
                    )?.title ?? "Unassigned"}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {new Date(
                      member.created ?? member.createdAt ?? "",
                    ).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div className={styles.actionsRow}>
                      <EditButton
                        onClick={() => openEditStaffModal(member._id)}
                      />
                      <DeleteButton
                        onClick={() => {
                          void removeStaff(member._id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "admin" && (
            <ManagementTable
              headers={["Name", "Email", "Created"]}
              emptyMessage={
                isLoadingUsers ? "Loading admins..." : "No admin members found."
              }
            >
              {filteredAdmins.map((member) => (
                <tr key={member._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {member.fullname ?? member.name}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {member.email}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {new Date(
                      member.created ?? member.createdAt ?? "",
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "platforms" && (
            <ManagementTable
              headers={["Title", "Description", "URL", "Created", "Actions"]}
              emptyMessage={
                is_loading_platforms
                  ? "Loading platforms..."
                  : "No platforms found."
              }
            >
              {platforms.map((platform) => (
                <tr key={platform._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {platform.name}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {platform.description}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    <a href={platform.url} target="_blank">
                      {platform.url}
                    </a>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {new Date(platform.created).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div className={styles.actionsRow}>
                      <EditButton
                        disabled={is_loading_platforms}
                        onClick={() => {
                          void open_edit_platform_modal(platform);
                        }}
                      />
                      <DeleteButton
                        onClick={() => {
                          void remove_platform(platform._id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "skills" && (
            <ManagementTable
              headers={["Title", "Description", "Created", "Actions"]}
              emptyMessage={
                isLoadingSkills ? "Loading skills..." : "No skills found."
              }
            >
              {filteredSkills.map((skill) => (
                <tr key={skill._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {skill.title ?? skill.name}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {skill.description}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {new Date(
                      skill.created ?? skill.createdAt ?? "",
                    ).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div className={styles.actionsRow}>
                      <EditButton
                        disabled={isLoadingSkillDetails}
                        onClick={() => {
                          void openEditSkillModal(skill);
                        }}
                      />
                      <DeleteButton
                        onClick={() => {
                          void removeSkill(skill._id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "company_overview" && (
            <ManagementTable
              headers={["Title", "Detail", "Created", "Actions"]}
              emptyMessage={
                isLoadingSkills ? "Loading details..." : "No details found."
              }
            >
              {company_details.map((detail) => (
                <tr key={detail._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {detail.title}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {detail.detail}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {new Date(detail.created).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div className={styles.actionsRow}>
                      <EditButton
                        disabled={is_loading_detail}
                        onClick={() => {
                          void open_edit_detail_modal(detail);
                        }}
                      />
                      <DeleteButton
                        onClick={() => {
                          void remove_detail(detail._id);
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
              headers={[
                "Title",
                "Description",
                "Skills",
                "Positions",
                "Created",
                "Actions",
              ]}
              emptyMessage={
                isLoadingServices ? "Loading services..." : "No services found."
              }
            >
              {filteredServices.map((service) => (
                <tr key={service._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {service.title ?? service.name}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {service.description}
                  </td>
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
                          const position = positions.find(
                            (p) => p._id === positionId,
                          );
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
                    {new Date(
                      service.created ?? service.createdAt ?? "",
                    ).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <DeleteButton
                      onClick={() => {
                        void removeService(service._id);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "clients" && (
            <ManagementTable
              headers={["Name", "About", "Created", "Actions"]}
              emptyMessage={
                isLoadingClients ? "Loading clients..." : "No clients found."
              }
            >
              {filteredClients.map((client) => (
                <tr key={client._id}>
                  <td className={`${styles.td} ${styles.tdName}`}>
                    {client.name}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {client.about || "None"}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {new Date(
                      client.created ?? client.createdAt ?? "",
                    ).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div className={styles.actionsRow}>
                      <EditButton
                        onClick={() => openEditClientModal(client._id)}
                      />
                      <DeleteButton
                        onClick={() => {
                          void removeClient(client._id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}

          {activeSection === "position" && (
            <ManagementTable
              headers={["Name", "Description", "Skills", "Actions"]}
              emptyMessage={
                isLoadingPositions
                  ? "Loading positions..."
                  : "No positions found."
              }
            >
              {filteredPositions.map((position) => (
                <tr key={position._id}>
                  <td className={styles.td}>
                    <span className={styles.tdName}>{position.title}</span>
                    <div className={styles.respList}>
                      {position.responsibilities.map((r) => (
                        <div
                          key={`${position._id}-${r}`}
                          className={styles.respListItem}
                        >
                          <span className={styles.respDot} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {position.description}
                  </td>
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
                      <EditButton
                        onClick={() => openEditPositionModal(position._id)}
                      />
                      <DeleteButton
                        onClick={() => {
                          void removePosition(position._id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </ManagementTable>
          )}
        </div>
      </div>

      {/* ---- MODALS ---- */}
      {openModal === "staff" && (
        <PersonModal
          initialEmail={editingStaff?.email ?? ""}
          initialName={editingStaff?.fullname ?? editingStaff?.name ?? ""}
          initialPositionId={
            editingStaff?.positionId ?? editingStaff?.position ?? ""
          }
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
              {
                _id: crypto.randomUUID(),
                createdAt: new Date(),
                email: payload.email,
                fullname: payload.fullname,
                name: payload.fullname,
              },
            ]);
            setOpenModal(null);
          }}
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
          onClose={() => {
            setEditingSkill(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void saveSkill(payload);
          }}
          submitLabel={editingSkill ? "Save Changes" : "Create Skill"}
        />
      )}

      {openModal === "platforms" && (
        <PlatformModal
          title={editing_platform ? "Edit Platform" : "Add New Platform"}
          nameLabel="Name"
          initialDescription={editing_platform?.description ?? ""}
          initialName={editing_platform?.title ?? ""}
          initialUrl={editing_platform?.url ?? ""}
          isSaving={is_saving_platform}
          onClose={() => {
            set_editing_platform(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void save_platform(payload);
          }}
          submitLabel={editing_platform ? "Save changes" : "Create Platform"}
        />
      )}

      {openModal === "company_overview" && (
        <RegistryModal
          title={editing_detail ? "Edit Detail" : "Add New Detail"}
          nameLabel="Title"
          initialDescription={editing_detail?.detail ?? ""}
          initialName={editing_detail?.title ?? ""}
          isSaving={is_saving_detail}
          onClose={() => {
            set_editing_detail(null);
            setOpenModal(null);
          }}
          onSave={(payload) => {
            void save_detail(payload);
          }}
          submitLabel={editing_detail ? "Save changes" : "Add Detail"}
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
