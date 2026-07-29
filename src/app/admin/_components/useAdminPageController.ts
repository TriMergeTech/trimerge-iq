import { useEffect, useState } from "react";

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
import { type Certification } from "./AdminModals";
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
import { useAdminFilters } from "./useAdminFilters";
import { useAdminCompanyResources } from "./useAdminCompanyResources";
import { useAdminSession } from "./useAdminSession";
import { useAdminSkills } from "./useAdminSkills";

const INITIAL_POSITIONS: PositionItem[] = [];

export function useAdminPageController() {
  const [activeSection, setActiveSection] = useState<AdminSection>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState<CreateModal>(null);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(
    null,
  );
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSavingPosition, setIsSavingPosition] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [positionError, setPositionError] = useState("");
  const [serviceError, setServiceError] = useState("");
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
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>(INITIAL_POSITIONS);

  const { accessToken, adminFetch, loggedInEmail, loggedInName, loggedInProfile } = useAdminSession({
    setAdminMembers,
    setStaffMembers,
    setUserError,
  });

  const {
    closeDetailModal,
    closePlatformModal,
    company_details,
    detail_error,
    editing_detail,
    editing_platform,
    is_loading_detail,
    is_loading_platforms,
    is_saving_detail,
    is_saving_platform,
    open_edit_detail_modal,
    open_edit_platform_modal,
    platforms,
    remove_detail,
    remove_platform,
    save_detail,
    save_platform,
    tools_error,
  } = useAdminCompanyResources({
    accessToken,
    setOpenModal,
  });

  const {
    closeSkillModal,
    editingSkill,
    isLoadingSkillDetails,
    isLoadingSkills,
    isSavingSkill,
    openEditSkillModal,
    removeSkill,
    saveSkill,
    skillError,
    skills,
  } = useAdminSkills({
    accessToken,
    adminFetch,
    setOpenModal,
  });

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

  const {
    filteredAdmins,
    filteredClients,
    filteredPositions,
    filteredServices,
    filteredSkills,
    filteredStaff,
  } = useAdminFilters({
    adminMembers,
    clients,
    positions,
    searchQuery,
    services,
    skills,
    staffMembers,
  });
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
      closeSkillModal();
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

  const addAdminMember = (payload: { fullname: string; email: string }) => {
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
  };

  const closeClientModal = () => {
    setEditingClient(null);
    setOpenModal(null);
  };


  const closePositionModal = () => {
    setEditingPosition(null);
    setOpenModal(null);
  };


  const closeStaffModal = () => {
    setEditingStaff(null);
    setOpenModal(null);
  };

  return {
    activeCount,
    activeSection,
    addAdminMember,
    adminMembers,
    certifications,
    clientError,
    clients,
    closeClientModal,
    closeDetailModal,
    closePlatformModal,
    closePositionModal,
    closeSkillModal,
    closeStaffModal,
    company_details,
    detail_error,
    editing_detail,
    editing_platform,
    editingClient,
    editingPosition,
    editingSkill,
    editingStaff,
    filteredAdmins,
    filteredClients,
    filteredPositions,
    filteredServices,
    filteredSkills,
    filteredStaff,
    is_loading_detail,
    is_loading_platforms,
    is_saving_detail,
    is_saving_platform,
    isLoadingClients,
    isLoadingPositions,
    isLoadingServices,
    isLoadingSkillDetails,
    isLoadingSkills,
    isLoadingStaff,
    isLoadingUsers,
    isSavingClient,
    isSavingPosition,
    isSavingService,
    isSavingSkill,
    isSavingStaff,
    loggedInEmail,
    loggedInName,
    loggedInProfile,
    open_edit_detail_modal,
    open_edit_platform_modal,
    openCreateModal,
    openEditClientModal,
    openEditPositionModal,
    openEditSkillModal,
    openEditStaffModal,
    openModal,
    platforms,
    positionError,
    positions,
    remove_detail,
    remove_platform,
    removeClient,
    removePosition,
    removeService,
    removeSkill,
    removeStaff,
    save_detail,
    save_platform,
    saveClient,
    savePosition,
    saveService,
    saveSkill,
    saveStaff,
    searchQuery,
    serviceError,
    setActiveSection,
    setOpenModal,
    setSearchQuery,
    skillError,
    skills,
    staffError,
    staffMembers,
    tools_error,
    userError,
  };
}
