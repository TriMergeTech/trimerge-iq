import type { Conversation, Message, UploadedFile } from "./chatPageTypes";

const DEFAULT_CHAT_API_BASE_URL = "http://192.168.7.125:3002/v2";
const CHAT_PROFILE_STORAGE_KEY = "trimerge_chat_profile";
const CHAT_MESSAGE_SENDER_STORAGE_KEY = "trimerge_chat_message_senders";

interface ApiConversationRecord {
  id?: number;
  title?: string;
  memory?: string;
  profile?: string;
  project?: string;
  recent_message?: string;
}

interface ApiMessageRecord {
  id?: number;
  conversation?: number;
  tool?: string;
  text?: string;
  attachment?: UploadedFile[];
  created_at?: string;
}

interface ApiMessagesResponse {
  conversation?: number;
  page?: number;
  limit?: number;
  messages?: ApiMessageRecord[];
}

function getChatApiBaseUrl() {
  return process.env.NEXT_PUBLIC_TRIMERGE_CHAT_API_BASE_URL?.trim() || DEFAULT_CHAT_API_BASE_URL;
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
  const response = await fetch(`${getChatApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonSafely<T>(response);

  if (!response.ok) {
    throw new Error(`Chat API request failed (${response.status}).`);
  }

  return payload;
}

export function getChatProfile() {
  if (typeof window === "undefined") return "web_guest";

  const storedProfile = localStorage.getItem(CHAT_PROFILE_STORAGE_KEY)?.trim();
  if (storedProfile) return storedProfile;

  const email = localStorage.getItem("trimerge_admin_email")?.trim().toLowerCase();
  const normalizedEmail = email?.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const generatedProfile = normalizedEmail || `web_${Date.now()}`;

  localStorage.setItem(CHAT_PROFILE_STORAGE_KEY, generatedProfile);
  return generatedProfile;
}

function readSenderMap() {
  if (typeof window === "undefined") return {} as Record<string, Message["sender"]>;

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
  localStorage.setItem(CHAT_MESSAGE_SENDER_STORAGE_KEY, JSON.stringify(senderMap));
}

function getSenderMapKey(conversationId: number, messageId: number) {
  return `${conversationId}:${messageId}`;
}

export function rememberMessageSender(conversationId: number, messageId: number, sender: Message["sender"]) {
  const senderMap = readSenderMap();
  senderMap[getSenderMapKey(conversationId, messageId)] = sender;
  writeSenderMap(senderMap);
}

function inferMessageSender(
  conversationId: number,
  messageId: number,
  messageIndex: number,
  totalMessages: number,
): Message["sender"] {
  const storedSender = readSenderMap()[getSenderMapKey(conversationId, messageId)];
  if (storedSender) return storedSender;

  if (totalMessages === 1) return "user";
  return messageIndex % 2 === 0 ? "user" : "ai";
}

export function mapConversationFromApi(record: ApiConversationRecord): Conversation {
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
  };
}

export function mapMessagesFromApi(conversationId: number, records: ApiMessageRecord[] | undefined): Message[] {
  const safeRecords = records ?? [];

  return safeRecords.map((record, index) => ({
    id: record.id ?? Date.now() + index,
    content: record.text?.trim() || "",
    sender: inferMessageSender(conversationId, record.id ?? Date.now() + index, index, safeRecords.length),
    timestamp: record.created_at ? new Date(record.created_at) : new Date(),
    files: Array.isArray(record.attachment) ? record.attachment : undefined,
  }));
}

export async function fetchConversations(profile: string, project?: string | null, page = 1, limit = 100) {
  const payload = await postJson<ApiConversationRecord[] | { conversations?: ApiConversationRecord[]; data?: ApiConversationRecord[] }>(
    "/conversations",
    {
      profile,
      ...(project ? { project } : {}),
      page,
      limit,
    },
  );

  if (Array.isArray(payload)) return payload.map(mapConversationFromApi);
  if (Array.isArray(payload?.conversations)) return payload.conversations.map(mapConversationFromApi);
  if (Array.isArray(payload?.data)) return payload.data.map(mapConversationFromApi);
  return [];
}

export async function createConversation(input: {
  title: string;
  profile: string;
  memory?: string;
  project?: string;
  recent_message?: string;
}) {
  const payload = await postJson<ApiConversationRecord>("/new_conversation", input);
  return mapConversationFromApi(payload ?? {});
}

export async function createMessage(input: {
  conversation: number;
  text: string;
  tool?: string;
  attachment?: UploadedFile[];
}) {
  const payload = await postJson<ApiMessageRecord>("/new_message", {
    tool: "chat",
    attachment: [],
    ...input,
  });

  if (payload?.id) rememberMessageSender(input.conversation, payload.id, "user");
  return payload;
}

export async function fetchMessages(conversationId: number, page = 1, limit = 100) {
  const payload = await postJson<ApiMessagesResponse>("/messages", {
    conversation: conversationId,
    page,
    limit,
  });

  return mapMessagesFromApi(conversationId, payload?.messages);
}
