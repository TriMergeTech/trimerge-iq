export { parseJsonSafely } from "../../_shared/adminAuth";

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
