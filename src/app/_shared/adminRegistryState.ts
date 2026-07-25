export interface StoredAdminPerson {
  id: string;
  name: string;
  email: string;
  positionId?: string;
  role: "staff" | "admin";
  createdAt: Date;
}

export interface StoredAdminService {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  positionIds: string[];
  createdAt: Date;
}

export interface StoredAdminClient {
  id: string;
  name: string;
  createdAt: Date;
}

const ADMIN_PEOPLE_STORAGE_KEY = "trimerge_admin_registry_people";
const ADMIN_SERVICES_STORAGE_KEY = "trimerge_admin_registry_services";
const ADMIN_CLIENTS_STORAGE_KEY = "trimerge_admin_registry_clients";

function parseDate(value: string | Date | undefined) {
  return value ? new Date(value) : new Date();
}

function parseRecordDate(value: unknown) {
  return typeof value === "string" || value instanceof Date ? parseDate(value) : new Date();
}

function readStoredRecords<T>(storageKey: string, mapRecord: (record: Record<string, unknown>) => T) {
  if (typeof window === "undefined") return [] as T[];

  const rawValue = localStorage.getItem(storageKey);
  if (!rawValue) return [];

  try {
    const records = JSON.parse(rawValue) as Record<string, unknown>[];
    return Array.isArray(records) ? records.map(mapRecord) : [];
  } catch {
    return [];
  }
}

function writeStoredRecords<T>(storageKey: string, records: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(records));
}

export function readStoredAdminPeople() {
  return readStoredRecords<StoredAdminPerson>(ADMIN_PEOPLE_STORAGE_KEY, (record) => ({
    id: String(record.id ?? `local-person-${Date.now()}`),
    name: String(record.name ?? ""),
    email: String(record.email ?? ""),
    positionId: typeof record.positionId === "string" ? record.positionId : undefined,
    role: record.role === "admin" ? "admin" : "staff",
    createdAt: parseRecordDate(record.createdAt),
  }));
}

export function writeStoredAdminPeople(people: StoredAdminPerson[]) {
  writeStoredRecords(ADMIN_PEOPLE_STORAGE_KEY, people);
}

export function readStoredAdminServices() {
  return readStoredRecords<StoredAdminService>(ADMIN_SERVICES_STORAGE_KEY, (record) => ({
    id: String(record.id ?? `local-service-${Date.now()}`),
    name: String(record.name ?? ""),
    description: String(record.description ?? ""),
    skillIds: Array.isArray(record.skillIds) ? record.skillIds.map(String) : [],
    positionIds: Array.isArray(record.positionIds) ? record.positionIds.map(String) : [],
    createdAt: parseRecordDate(record.createdAt),
  }));
}

export function writeStoredAdminServices(services: StoredAdminService[]) {
  writeStoredRecords(ADMIN_SERVICES_STORAGE_KEY, services);
}

export function readStoredAdminClients() {
  return readStoredRecords<StoredAdminClient>(ADMIN_CLIENTS_STORAGE_KEY, (record) => ({
    id: String(record.id ?? `local-client-${Date.now()}`),
    name: String(record.name ?? ""),
    createdAt: parseRecordDate(record.createdAt),
  }));
}

export function writeStoredAdminClients(clients: StoredAdminClient[]) {
  writeStoredRecords(ADMIN_CLIENTS_STORAGE_KEY, clients);
}
