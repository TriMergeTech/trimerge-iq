import type {
  ChatEntityId,
  Conversation,
  Message,
  ProjectFormOption,
  UploadedFile,
} from "./chatPageTypes";
import { readStoredAdminPeople } from "../../_shared/adminRegistryState";
import { authenticatedAdminFetch } from "../../_shared/adminAuth";
import { BACKEND as PROPOSAL_HUB_BACKEND } from "../../proposal-hub/_hub/utils/services";
import type { Proposal } from "../../proposal-hub/_hub/types";

const DEFAULT_CHAT_API_BASE_URL =
  "https://microserver-agency-v2.trimergeiq.com/v2";
const DEFAULT_PROJECTS_API_BASE_URL = "https://backend.trimerge.com";
const CHAT_PROFILE_STORAGE_KEY = "trimerge_chat_profile";
const CHAT_MESSAGE_SENDER_STORAGE_KEY = "trimerge_chat_message_senders";

interface ApiConversationRecord {
  id?: ChatEntityId;
  title?: string;
  memory?: string;
  profile?: string;
  project?: string;
  recent_message?: string;
  pinned?: boolean;
  archived?: boolean;
  deleted?: boolean;
}

interface ApiMessageRecord {
  id?: ChatEntityId;
  conversation?: ChatEntityId;
  _id?: ChatEntityId;
  error?: boolean;
  message?: string;
  details?: string;
  agent?: boolean;
  role?: string;
  sender?: string;
  skill?: string;
  tool?: string;
  pending_tool?: string | null;
  text?: string;
  attachment?: UploadedFile[];
  created_at?: string;
}

interface ApiMessagesResponse {
  conversation?: ChatEntityId;
  page?: number;
  limit?: number;
  messages?: ApiMessageRecord[];
}

interface ApiShareLinkResponse {
  share_link?: string;
  share_url?: string;
  link?: string;
  url?: string;
}

interface ApiProjectRecord {
  id?: ChatEntityId;
  _id?: ChatEntityId;
  name?: string;
  description?: string;
  project_manager?: unknown;
  projectManager?: unknown;
  team?: unknown[];
  client?: unknown;
  service?: unknown;
  createdAt?: string;
  created_at?: string;
  pinned?: boolean;
  archived?: boolean;
}

interface ApiLookupRecord {
  id?: ChatEntityId;
  _id?: ChatEntityId;
  user_id?: ChatEntityId;
  uuid?: ChatEntityId;
  name?: string;
  about?: string;
  title?: string;
  fullName?: string;
  full_name?: string;
  email?: string;
  profile?: string;
  role?: string;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
  errors?: string[] | Record<string, string | string[]>;
}

interface ProposalExtractResponse {
  ok?: boolean;
  data?: Record<string, unknown>;
  message?: string;
}

interface ProposalGenerationStartResponse {
  ok?: boolean;
  data?: {
    callbackId?: string;
  };
  message?: string;
}

export interface ProposalGenerationStatus {
  status?: "queued" | "running" | "completed" | "failed" | string;
  progress?: number;
  message?: string;
  proposal?: Proposal;
  [key: string]: unknown;
}

interface ProposalGenerationStatusResponse {
  ok?: boolean;
  data?: ProposalGenerationStatus;
  message?: string;
}

function getChatApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_TRIMERGE_CHAT_API_BASE_URL?.trim() ||
    DEFAULT_CHAT_API_BASE_URL
  );
}

function getProjectsApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_TRIMERGE_PROJECTS_API_BASE_URL?.trim() ||
    DEFAULT_PROJECTS_API_BASE_URL
  );
}

function buildChatApiUrl(path: string) {
  return `${getChatApiBaseUrl().replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function buildProjectsApiUrl(path: string) {
  return `${getProjectsApiBaseUrl().replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function serializeAttachment(file: UploadedFile) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    ...(file.extractedRfpData
      ? { extractedRfpData: file.extractedRfpData }
      : {}),
  };
}

function getAccessToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("trimerge_admin_access_token")?.trim() ?? "";
}

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return null;
  }
}

async function postJson<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(buildChatApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonSafely<T>(response);

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null;
    const errorDetails =
      typeof errorPayload?.message === "string"
        ? errorPayload.message
        : typeof errorPayload?.error === "string"
          ? errorPayload.error
          : "";

    throw new Error(
      `Chat API request failed (${response.status})${errorDetails ? `: ${errorDetails}` : ""}.`,
    );
  }

  return payload;
}

async function projectsApiRequest<T>(path: string, init: RequestInit = {}) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in before managing projects.");
  }

  const response = await authenticatedAdminFetch(buildProjectsApiUrl(path), {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const payload = await parseJsonSafely<T>(response);

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null;
    const errorDetails =
      typeof errorPayload?.message === "string"
        ? errorPayload.message
        : typeof errorPayload?.error === "string"
          ? errorPayload.error
          : Array.isArray(errorPayload?.errors)
            ? errorPayload.errors.join(", ")
            : errorPayload?.errors
              ? Object.entries(errorPayload.errors)
                  .map(
                    ([key, value]) =>
                      `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
                  )
                  .join("; ")
              : "";

    throw new Error(
      `Projects API request failed (${response.status})${errorDetails ? `: ${errorDetails}` : ""}.`,
    );
  }

  return payload;
}

async function projectsApiDelete(path: string) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in before managing projects.");
  }

  const response = await authenticatedAdminFetch(buildProjectsApiUrl(path), {
    method: "DELETE",
  });

  if (response.status === 404) {
    return { ok: true, alreadyDeleted: true };
  }

  const payload = await parseJsonSafely<unknown>(response);

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null;
    const errorDetails =
      typeof errorPayload?.message === "string"
        ? errorPayload.message
        : typeof errorPayload?.error === "string"
          ? errorPayload.error
          : Array.isArray(errorPayload?.errors)
            ? errorPayload.errors.join(", ")
            : errorPayload?.errors
              ? Object.entries(errorPayload.errors)
                  .map(
                    ([key, value]) =>
                      `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
                  )
                  .join("; ")
              : "";

    throw new Error(
      `Projects API delete failed (${response.status})${errorDetails ? `: ${errorDetails}` : ""}.`,
    );
  }

  return { ok: true, alreadyDeleted: false, payload };
}

export function getChatProfile() {
  if (typeof window === "undefined") return "web_guest";

  const storedProfile = localStorage.getItem(CHAT_PROFILE_STORAGE_KEY)?.trim();
  if (storedProfile) return storedProfile;

  const email = localStorage
    .getItem("trimerge_admin_email")
    ?.trim()
    .toLowerCase();
  const normalizedEmail = email
    ?.replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const generatedProfile = normalizedEmail || `web_${Date.now()}`;

  localStorage.setItem(CHAT_PROFILE_STORAGE_KEY, generatedProfile);
  return generatedProfile;
}

function readSenderMap() {
  if (typeof window === "undefined")
    return {} as Record<string, Message["sender"]>;

  const rawValue = localStorage.getItem(CHAT_MESSAGE_SENDER_STORAGE_KEY);
  if (!rawValue) return {} as Record<string, Message["sender"]>;

  try {
    return JSON.parse(rawValue) as Record<string, Message["sender"]>;
  } catch {
    return {} as Record<string, Message["sender"]>;
  }
}

function writeSenderMap(senderMap: Record<string, Message["sender"]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    CHAT_MESSAGE_SENDER_STORAGE_KEY,
    JSON.stringify(senderMap),
  );
}

function getSenderMapKey(
  conversationId: ChatEntityId,
  messageId: ChatEntityId,
) {
  return `${conversationId}:${messageId}`;
}

function isUuid(value: ChatEntityId | undefined) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isMongoObjectId(value: ChatEntityId | undefined) {
  return typeof value === "string" && /^[0-9a-f]{24}$/i.test(value);
}

export function rememberMessageSender(
  conversationId: ChatEntityId,
  messageId: ChatEntityId,
  sender: Message["sender"],
) {
  const senderMap = readSenderMap();
  senderMap[getSenderMapKey(conversationId, messageId)] = sender;
  writeSenderMap(senderMap);
}

function inferMessageSender(
  conversationId: ChatEntityId,
  messageId: ChatEntityId | undefined,
  messageIndex: number,
  totalMessages: number,
  record: ApiMessageRecord,
): Message["sender"] {
  if (record.agent === true) return "ai";
  if (record.agent === false) return "user";

  const role = (record.role ?? record.sender ?? "").trim().toLowerCase();
  if (["assistant", "ai", "agent"].includes(role)) return "ai";
  if (["user", "human"].includes(role)) return "user";

  if (isUuid(messageId)) return "user";
  if (isMongoObjectId(messageId)) return "ai";

  if (messageId !== undefined) {
    const storedSender =
      readSenderMap()[getSenderMapKey(conversationId, messageId)];
    if (storedSender) return storedSender;
  }

  if (totalMessages === 1) return "user";
  return messageIndex % 2 === 0 ? "user" : "ai";
}

export function mapConversationFromApi(
  record: ApiConversationRecord,
): Conversation {
  return {
    id: record.id ?? Date.now(),
    title: record.title?.trim() || "New chat",
    updatedAt: new Date(),
    messages: [],
    projectId: null,
    projectName: record.project ?? null,
    profile: record.profile,
    memory: record.memory,
    recentMessage: record.recent_message,
    pinned: record.pinned,
    archived: record.archived,
  };
}

function getRecordLabel(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as {
      id?: string;
      _id?: string;
      name?: string;
      title?: string;
      email?: string;
    };
    return (
      record.name ??
      record.title ??
      record.email ??
      record.id ??
      record._id ??
      ""
    );
  }
  return "";
}

function getRecordListLabels(values: unknown[] | undefined) {
  return (values ?? []).map(getRecordLabel).filter(Boolean);
}

function extractProjectRecords(payload: unknown): ApiProjectRecord[] {
  if (Array.isArray(payload)) return payload as ApiProjectRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      data?: unknown;
      project?: unknown;
      projects?: unknown;
    };
    if (Array.isArray(typedPayload.projects))
      return typedPayload.projects as ApiProjectRecord[];
    if (typedPayload.project && typeof typedPayload.project === "object") {
      return [typedPayload.project as ApiProjectRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as ApiProjectRecord[];
    if (data && typeof data === "object") return [data as ApiProjectRecord];
    return [payload as ApiProjectRecord];
  }

  return [];
}

function extractLookupRecords(
  payload: unknown,
  collectionKeys: string[],
): ApiLookupRecord[] {
  if (Array.isArray(payload)) return payload as ApiLookupRecord[];

  if (payload && typeof payload === "object") {
    const typedPayload = payload as Record<string, unknown>;

    for (const key of collectionKeys) {
      if (Array.isArray(typedPayload[key]))
        return typedPayload[key] as ApiLookupRecord[];
      if (typedPayload[key] && typeof typedPayload[key] === "object")
        return [typedPayload[key] as ApiLookupRecord];
    }

    const data = typedPayload.data;
    if (Array.isArray(data)) return data as ApiLookupRecord[];
    if (data && typeof data === "object") return [data as ApiLookupRecord];
    return [payload as ApiLookupRecord];
  }

  return [];
}

function mapLookupOption(record: ApiLookupRecord): ProjectFormOption | null {
  const id = record.id ?? record._id ?? record.user_id ?? record.uuid;
  if (!id) return null;

  return {
    id: String(id),
    label:
      record.name ??
      record.title ??
      record.fullName ??
      record.full_name ??
      record.email ??
      String(id),
  };
}

function mapCreatedLookupOption(payload: unknown, collectionKeys: string[]) {
  return (
    extractLookupRecords(payload, collectionKeys)
      .map(mapLookupOption)
      .filter(isProjectFormOption)[0] ?? null
  );
}

function isProjectFormOption(
  option: ProjectFormOption | null,
): option is ProjectFormOption {
  return Boolean(option);
}

function uniqueOptions(options: ProjectFormOption[]) {
  const seenIds = new Set<string>();
  return options.filter((option) => {
    if (seenIds.has(option.id)) return false;
    seenIds.add(option.id);
    return true;
  });
}

function getStoredStaffOptions() {
  const staff = readStoredAdminPeople()
    .filter((person) => person.role !== "admin")
    .map((person) => ({
      id: person.id,
      label: person.name || person.email || person.id,
    }));

  return staff;
}

function mapProjectFromApi(record: ApiProjectRecord) {
  return {
    id: record.id ?? record._id ?? Date.now(),
    name: record.name?.trim() || "Untitled project",
    createdAt:
      record.createdAt || record.created_at
        ? new Date(record.createdAt ?? record.created_at ?? "")
        : new Date(),
    description: record.description ?? "",
    service: getRecordLabel(record.service),
    team: getRecordListLabels(record.team),
    projectManager: getRecordLabel(
      record.project_manager ?? record.projectManager,
    ),
    client: getRecordLabel(record.client),
    pinned: record.pinned,
    archived: record.archived,
  };
}

function buildProjectPayload(input: {
  name?: string;
  description?: string;
  service?: string;
  team?: string[];
  projectManager?: string;
  client?: string;
}) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.projectManager !== undefined
      ? { project_manager: input.projectManager }
      : {}),
    ...(input.team !== undefined ? { team: input.team } : {}),
    ...(input.client !== undefined ? { client: input.client } : {}),
    ...(input.service !== undefined ? { service: input.service } : {}),
  };
}

function stripHiddenRfpContext(text: string) {
  const markers = ["\n\nUploaded RFP:", "\nUploaded RFP:", "Uploaded RFP:"];

  for (const marker of markers) {
    const markerIndex = text.indexOf(marker);
    if (markerIndex > 0) return text.slice(0, markerIndex).trim();
  }

  return text.trim();
}

export function mapMessagesFromApi(
  conversationId: ChatEntityId,
  records: ApiMessageRecord[] | undefined,
): Message[] {
  const safeRecords = records ?? [];

  return safeRecords.map((record, index) => {
    const sender = inferMessageSender(
      conversationId,
      record.id ?? record._id,
      index,
      safeRecords.length,
      record,
    );
    const rawContent = record.text?.trim() || "";

    return {
      id: record.id ?? record._id ?? Date.now() + index,
      content:
        sender === "user" ? stripHiddenRfpContext(rawContent) : rawContent,
      sender,
      timestamp: record.created_at ? new Date(record.created_at) : new Date(),
      files: Array.isArray(record.attachment) ? record.attachment : undefined,
      pendingTool: record.pending_tool,
    };
  });
}

function getPendingToolFromApiMessages(
  records: ApiMessageRecord[] | undefined,
) {
  const safeRecords = records ?? [];

  for (let index = safeRecords.length - 1; index >= 0; index -= 1) {
    if ("pending_tool" in safeRecords[index]) {
      return safeRecords[index].pending_tool ?? null;
    }
  }

  return undefined;
}

export async function fetchConversations(
  profile: string,
  project?: string | null,
  page = 1,
  limit = 100,
  includeArchived = false,
) {
  const payload = await postJson<
    | ApiConversationRecord[]
    | {
        conversations?: ApiConversationRecord[];
        data?: ApiConversationRecord[];
      }
  >("/conversations", {
    profile,
    ...(project ? { project } : {}),
    page,
    limit,
    ...(includeArchived ? { include_archived: true } : {}),
  });

  if (Array.isArray(payload)) return payload.map(mapConversationFromApi);
  if (Array.isArray(payload?.conversations))
    return payload.conversations.map(mapConversationFromApi);
  if (Array.isArray(payload?.data))
    return payload.data.map(mapConversationFromApi);
  return [];
}

export async function createConversation(input: {
  title: string;
  profile: string;
  memory?: string;
  project?: string;
  recent_message?: string;
}) {
  const payload = await postJson<ApiConversationRecord>(
    "/new_conversation",
    input,
  );
  return mapConversationFromApi(payload ?? {});
}

export async function createMessage(input: {
  conversation: ChatEntityId;
  text: string;
  skill?: string;
  attachment?: UploadedFile[];
  user?: string;
  pending_tool?: string | null;
}) {
  const { skill, ...messageInput } = input;
  const payload = await postJson<ApiMessageRecord>("/new_message", {
    ...messageInput,
    attachment: (input.attachment ?? []).map(serializeAttachment),
    ...(skill?.trim() ? { skill: skill.trim() } : {}),
  });

  if (payload?.error) {
    throw new Error(
      payload.details
        ? `${payload.message ?? "Chat failed"}: ${payload.details}`
        : (payload.message ?? "Chat failed."),
    );
  }

  const responseMessageId = payload?.id ?? payload?._id;
  if (responseMessageId) {
    rememberMessageSender(
      input.conversation,
      responseMessageId,
      payload?.agent === false ? "user" : "ai",
    );
  }
  return payload;
}

export async function extractRfpFromFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PROPOSAL_HUB_BACKEND}/proposal_extract_rfp`, {
    method: "POST",
    body: formData,
  });
  const payload = await parseJsonSafely<ProposalExtractResponse>(response);

  if (!response.ok || payload?.ok === false) {
    throw new Error(
      payload?.message ?? `RFP extraction failed (${response.status}).`,
    );
  }

  return payload?.data ?? {};
}

export async function startProposalGeneration(
  proposalMetadata: Record<string, unknown>,
) {
  const payload = {
    proposal_metadata: proposalMetadata,
    org_context: {
      company_name: "TriMerge Consulting Group, P.A.",
      certifications: ["8(a)", "WOSB", "EDWOSB", "CPA Firm"],
      experience_years: 22,
      skills: [
        "federal program management",
        "financial compliance",
        "healthcare claims analysis",
        "coding validation oversight",
        "risk and audit remediation",
      ],
      teaming_partners: [
        "Anchor Group NA Corp",
        "Certified Coding Partner (CPC/CCS/RHIA)",
      ],
    },
  };

  const response = await fetch(`${PROPOSAL_HUB_BACKEND}/generate_proposal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result =
    await parseJsonSafely<ProposalGenerationStartResponse>(response);

  if (!response.ok || !result?.ok || !result.data?.callbackId) {
    throw new Error(
      result?.message ??
        `Proposal generation failed to start (${response.status}).`,
    );
  }

  return result.data.callbackId;
}

export async function fetchProposalGenerationStatus(callbackId: string) {
  const response = await fetch(`${PROPOSAL_HUB_BACKEND}/get_callback_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      id: callbackId,
    }),
  });
  const result =
    await parseJsonSafely<ProposalGenerationStatusResponse>(response);

  if (!response.ok || !result?.ok || !result.data) {
    throw new Error(
      result?.message ??
        `Unable to fetch proposal status (${response.status}).`,
    );
  }

  return result.data;
}

export async function fetchMessages(
  conversationId: ChatEntityId,
  page = 1,
  limit = 100,
) {
  const payload = await postJson<ApiMessagesResponse>("/messages", {
    conversation: conversationId,
    page,
    limit,
  });

  return {
    messages: mapMessagesFromApi(conversationId, payload?.messages),
    pendingTool: getPendingToolFromApiMessages(payload?.messages),
  };
}

export async function createShareLink(conversationId: ChatEntityId) {
  const payload = await postJson<ApiShareLinkResponse>("/share_link", {
    conversation: conversationId,
    base_url: typeof window !== "undefined" ? window.location.origin : "",
  });

  const apiShareLink =
    payload?.share_link ??
    payload?.share_url ??
    payload?.link ??
    payload?.url ??
    "";
  const shareId = apiShareLink.match(/\/share\/([^/?#]+)/)?.[1];

  if (shareId && typeof window !== "undefined") {
    return `${window.location.origin}/chat?share=${encodeURIComponent(shareId)}`;
  }

  return apiShareLink;
}

export async function fetchProjects() {
  if (!getAccessToken()) return [];

  const payload = await projectsApiRequest<unknown>("/projects");
  return extractProjectRecords(payload).map(mapProjectFromApi);
}

export async function fetchProject(projectId: ChatEntityId) {
  const payload = await projectsApiRequest<unknown>(`/projects/${projectId}`);
  const project = extractProjectRecords(payload)[0];
  return project ? mapProjectFromApi(project) : null;
}

export async function fetchProjectFormOptions() {
  const storedStaffOptions = getStoredStaffOptions();

  if (!getAccessToken()) {
    return {
      clients: [],
      services: [],
      staff: uniqueOptions(storedStaffOptions),
    };
  }

  const [clientsResult, servicesResult, usersResult, currentUserResult] =
    await Promise.allSettled([
      projectsApiRequest<unknown>("/clients"),
      projectsApiRequest<unknown>("/services"),
      projectsApiRequest<unknown>("/staff"),
      projectsApiRequest<unknown>("/auth/me"),
    ]);

  const clients =
    clientsResult.status === "fulfilled"
      ? extractLookupRecords(clientsResult.value, ["clients", "client"])
          .map(mapLookupOption)
          .filter(isProjectFormOption)
      : [];
  const services =
    servicesResult.status === "fulfilled"
      ? extractLookupRecords(servicesResult.value, ["services", "service"])
          .map(mapLookupOption)
          .filter(isProjectFormOption)
      : [];
  const staffFromUsers =
    usersResult.status === "fulfilled"
      ? extractLookupRecords(usersResult.value, [
          "staff",
          "staffs",
          "members",
          "user",
        ])
          .filter((record) => {
            const role = (record.profile ?? record.role ?? "").toLowerCase();
            return role !== "client";
          })
          .map(mapLookupOption)
          .filter(isProjectFormOption)
      : [];
  const staffFromCurrentUser =
    currentUserResult.status === "fulfilled"
      ? extractLookupRecords(currentUserResult.value, [
          "user",
          "profile",
          "data",
        ])
          .map(mapLookupOption)
          .filter(isProjectFormOption)
      : [];
  const staff =
    staffFromUsers.length > 0 ? staffFromUsers : staffFromCurrentUser;

  return {
    clients: uniqueOptions(clients),
    services: uniqueOptions(services),
    staff: uniqueOptions([...staff, ...storedStaffOptions]),
  };
}

export async function createProject(input: {
  name: string;
  description: string;
  projectManager: string;
  team: string[];
  client: string;
  service: string;
}) {
  const payload = await projectsApiRequest<unknown>("/projects", {
    method: "POST",
    body: JSON.stringify(buildProjectPayload(input)),
  });

  const project = extractProjectRecords(payload)[0];
  return project ? mapProjectFromApi(project) : null;
}

export async function createClientOption(input: {
  name: string;
  about: string;
}) {
  const payload = await projectsApiRequest<unknown>("/clients", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return mapCreatedLookupOption(payload, ["client", "clients"]);
}

export async function updateProject(
  projectId: ChatEntityId,
  input: {
    name?: string;
    description?: string;
    projectManager?: string;
    team?: string[];
    client?: string;
    service?: string;
  },
) {
  const payload = await projectsApiRequest<unknown>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(buildProjectPayload(input)),
  });

  const project = extractProjectRecords(payload)[0];
  return project ? mapProjectFromApi(project) : null;
}

export async function deleteProject(projectId: ChatEntityId) {
  const normalizedProjectId = String(projectId);
  if (normalizedProjectId.startsWith("project-")) {
    return { ok: true, localOnly: true };
  }

  return projectsApiDelete(
    `/projects/${encodeURIComponent(normalizedProjectId)}`,
  );
}

export async function renameConversation(
  conversationId: ChatEntityId,
  title: string,
) {
  return postJson<unknown>("/rename_conversation", {
    conversation: conversationId,
    title,
  });
}

export async function archiveConversation(
  conversationId: ChatEntityId,
  archived = true,
) {
  return postJson<unknown>("/archive_conversation", {
    conversation: conversationId,
    archived,
  });
}

export async function pinConversation(
  conversationId: ChatEntityId,
  pinned: boolean,
) {
  return postJson<unknown>("/pin_chat", {
    conversation: conversationId,
    pinned,
  });
}

export async function deleteConversation(
  conversationId: ChatEntityId,
  hardDelete = false,
) {
  return postJson<unknown>("/delete_conversation", {
    conversation: conversationId,
    hard_delete: hardDelete,
  });
}
