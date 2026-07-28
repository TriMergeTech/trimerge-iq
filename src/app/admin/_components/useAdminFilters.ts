import { useMemo } from "react";
import type {
  ClientItem,
  PositionItem,
  ServiceItem,
  SkillItem,
  StaffMember,
} from "./adminTypes";

interface UseAdminFiltersInput {
  adminMembers: StaffMember[];
  clients: ClientItem[];
  positions: PositionItem[];
  searchQuery: string;
  services: ServiceItem[];
  skills: SkillItem[];
  staffMembers: StaffMember[];
}

export function useAdminFilters({
  adminMembers,
  clients,
  positions,
  searchQuery,
  services,
  skills,
  staffMembers,
}: UseAdminFiltersInput) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const uniqueServicesMap = new Map<string, ServiceItem>();

    for (const service of services) {
      const key =
        service._id ??
        `${service.title ?? service.name ?? "service"}-${service.created ?? service.createdAt ?? "local"}`;
      if (!uniqueServicesMap.has(key)) uniqueServicesMap.set(key, service);
    }

    const uniqueServices = Array.from(uniqueServicesMap.values());

    if (!query) {
      return {
        filteredAdmins: adminMembers,
        filteredClients: clients,
        filteredPositions: positions,
        filteredServices: uniqueServices,
        filteredSkills: skills,
        filteredStaff: staffMembers,
      };
    }

    const filteredStaff = staffMembers.filter((member) => {
      const positionName =
        positions.find((position) => position._id === (member.positionId ?? member.position))?.title ?? "";
      return (
        (member.fullname ?? member.name ?? "").toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        positionName.toLowerCase().includes(query)
      );
    });

    const filteredAdmins = adminMembers.filter(
      (member) =>
        (member.fullname ?? member.name ?? "").toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );

    const filteredSkills = skills.filter(
      (skill) =>
        (skill.title ?? skill.name ?? "").toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query),
    );

    const filteredServices = uniqueServices.filter((service) => {
      const skillNames = (service.skills ?? [])
        .map((skillId) => skills.find((skill) => skill._id === skillId)?.title ?? "")
        .join(" ");
      const positionNames = (service.positions ?? [])
        .map((positionId) => positions.find((position) => position._id === positionId)?.title ?? "")
        .join(" ");
      const title = (service.title ?? service.name ?? "").toString().toLowerCase();
      const description = (service.description ?? service.descriptions ?? "").toString().toLowerCase();

      return (
        title.includes(query) ||
        description.includes(query) ||
        skillNames.toLowerCase().includes(query) ||
        positionNames.toLowerCase().includes(query)
      );
    });

    const filteredClients = clients.filter(
      (client) => client.name.toLowerCase().includes(query) || client.about.toLowerCase().includes(query),
    );

    const filteredPositions = positions.filter((position) => {
      const skillNames = position.skillIds
        .map((skillId) => skills.find((skill) => skill._id === skillId)?.title ?? "")
        .join(" ");
      return (
        position.title.toLowerCase().includes(query) ||
        position.description.toLowerCase().includes(query) ||
        position.responsibilities.join(" ").toLowerCase().includes(query) ||
        skillNames.toLowerCase().includes(query)
      );
    });

    return {
      filteredAdmins,
      filteredClients,
      filteredPositions,
      filteredServices,
      filteredSkills,
      filteredStaff,
    };
  }, [adminMembers, clients, positions, searchQuery, services, skills, staffMembers]);
}
