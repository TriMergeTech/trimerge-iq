export type AdminSection =
  | "staff"
  | "admin"
  | "position"
  | "skills"
  | "company_overview"
  | "services"
  | "clients"
  | "platforms";
export type CreateModal = AdminSection | null;

export interface StaffMember {
  _id: string;
  id?: string;
  name?: string;
  fullname?: string;
  email: string;
  positionId?: string;
  position?: string;
  createdAt?: Date;
  created?: string | Date;
  [key: string]: any;
}

export interface SkillItem {
  _id: string;
  name?: string;
  title?: string;
  description: string;
  createdAt?: Date;
  created?: string | Date;
  [key: string]: any;
}

export interface ServiceItem {
  _id: string;
  name?: string;
  title?: string;
  description: string;
  skillIds?: string[];
  skills?: string[];
  positionIds?: string[];
  positions?: string[];
  createdAt?: Date;
  created?: string | Date;
  [key: string]: any;
}

export interface ClientItem {
  _id: string;
  name: string;
  about: string;
  createdAt?: Date;
  created?: string | Date;
  [key: string]: any;
}

export interface PositionItem {
  _id: string;
  title: string;
  description: string;
  responsibilities: string[];
  skillIds: string[];
  skills?: string[];
  createdAt?: Date;
  created?: string | Date;
  [key: string]: any;
}

export interface PositionApiRecord {
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

export interface SkillApiRecord {
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

export interface ServiceApiRecord {
  _id?: string;
  title?: string;
  name?: string;
  descriptions?: string;
  description?: string;
  skills?: string[];
  createdAt?: string;
  created_at?: string;
}

export interface ClientApiRecord {
  _id?: string;
  name?: string;
  about?: string;
  createdAt?: string;
  created_at?: string;
}

export interface StaffApiRecord {
  _id?: string;
  name?: string;
  email?: string;
  position?: string | { _id?: string; name?: string; title?: string };
  createdAt?: string;
  created_at?: string;
}

export interface UserApiRecord {
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

export function uniqueById<T extends { _id: string }>(records: T[]) {
  const seenIds = new Set<string>();
  return records.filter((record) => {
    if (seenIds.has(record._id)) return false;
    seenIds.add(record._id);
    return true;
  });
}

export function mapClientFromApi(client: ClientApiRecord): ClientItem {
  return {
    _id:
      client._id ??
      `${client.name ?? "client"}-${client.createdAt ?? client.created_at ?? "local"}`,
    name: client.name ?? "Untitled Client",
    about: client.about ?? "",
    created:
      client.createdAt || client.created_at
        ? new Date(client.createdAt ?? client.created_at ?? "")
        : new Date(),
  };
}

export function getPositionIdFromApi(position: StaffApiRecord["position"]) {
  if (typeof position === "string") return position;
  if (position && typeof position === "object") return position._id;
  return undefined;
}

export function mapStaffFromApi(staff: StaffApiRecord): StaffMember {
  return {
    _id:
      staff._id ??
      staff.email ??
      `${staff.name ?? "staff"}-${staff.createdAt ?? staff.created_at ?? "local"}`,
    name: staff.name ?? staff.email ?? "Unnamed staff",
    fullname: staff.name ?? staff.email ?? "Unnamed staff",
    email: staff.email ?? "",
    positionId: getPositionIdFromApi(staff.position),
    createdAt:
      staff.createdAt || staff.created_at
        ? new Date(staff.createdAt ?? staff.created_at ?? "")
        : new Date(),
  };
}

export function mapUserFromApi(user: UserApiRecord): StaffMember {
  const email = user.email ?? "";
  const fallbackName = email
    ? email.split("@")[0]?.replace(/[._-]+/g, " ")
    : "Unnamed user";

  return {
    _id: user._id ?? user.user_id ?? user.uuid ?? email,
    name: user.fullName ?? user.full_name ?? user.name ?? fallbackName,
    fullname: user.fullName ?? user.full_name ?? user.name ?? fallbackName,
    email,
    createdAt:
      user.createdAt || user.created_at
        ? new Date(user.createdAt ?? user.created_at ?? "")
        : new Date(),
  };
}

export function extractPositionRecords(payload: unknown): PositionApiRecord[] {
  if (Array.isArray(payload)) return payload as PositionApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      position?: unknown;
      positions?: unknown;
    };
    if (Array.isArray(typedPayload.positions))
      return typedPayload.positions as PositionApiRecord[];
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

export function extractServiceRecords(payload: unknown): ServiceApiRecord[] {
  if (Array.isArray(payload)) return payload as ServiceApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      service?: unknown;
      services?: unknown;
    };
    if (Array.isArray(typedPayload.services))
      return typedPayload.services as ServiceApiRecord[];
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

export function extractClientRecords(payload: unknown): ClientApiRecord[] {
  if (Array.isArray(payload)) return payload as ClientApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      client?: unknown;
      clients?: unknown;
    };
    if (Array.isArray(typedPayload.clients))
      return typedPayload.clients as ClientApiRecord[];
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

export function extractStaffRecords(payload: unknown): StaffApiRecord[] {
  if (Array.isArray(payload)) return payload as StaffApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      staff?: unknown;
      staffs?: unknown;
      members?: unknown;
    };
    if (Array.isArray(typedPayload.staff))
      return typedPayload.staff as StaffApiRecord[];
    if (Array.isArray(typedPayload.staffs))
      return typedPayload.staffs as StaffApiRecord[];
    if (Array.isArray(typedPayload.members))
      return typedPayload.members as StaffApiRecord[];
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

export function extractUserRecords(payload: unknown): UserApiRecord[] {
  if (Array.isArray(payload)) return payload as UserApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      user?: unknown;
      users?: unknown;
      profile?: unknown;
    };
    if (Array.isArray(typedPayload.users))
      return typedPayload.users as UserApiRecord[];
    if (typedPayload.user && typeof typedPayload.user === "object")
      return [typedPayload.user as UserApiRecord];
    if (typedPayload.profile && typeof typedPayload.profile === "object")
      return [typedPayload.profile as UserApiRecord];

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as UserApiRecord[];

    if (data && typeof data === "object") return [data as UserApiRecord];
    return [payload as UserApiRecord];
  }

  return [];
}

export function extractSkillRecords(payload: unknown): SkillApiRecord[] {
  if (Array.isArray(payload)) return payload as SkillApiRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      skill?: unknown;
      skills?: unknown;
    };
    if (Array.isArray(typedPayload.skills))
      return typedPayload.skills as SkillApiRecord[];
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

export async function parseJsonSafely(response: Response): Promise<any> {
  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return null;
  }
}
