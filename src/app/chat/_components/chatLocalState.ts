import type { ChatEntityId, Conversation, Project } from "./chatPageTypes";

const CHAT_CONVERSATION_OVERRIDES_KEY = "trimerge_chat_conversation_overrides";
const CHAT_PROJECT_NAMES_STORAGE_KEY = "trimerge_chat_project_names";
const CHAT_PROJECTS_STORAGE_KEY = "trimerge_chat_projects";

interface ConversationOverride {
  deleted?: boolean;
  pinned?: boolean;
  title?: string;
}

function getConversationOverrideKey(conversationId: ChatEntityId) {
  return String(conversationId);
}

function readConversationOverrides() {
  if (typeof window === "undefined") return {} as Record<string, ConversationOverride>;

  const rawValue = localStorage.getItem(CHAT_CONVERSATION_OVERRIDES_KEY);
  if (!rawValue) return {} as Record<string, ConversationOverride>;

  try {
    return JSON.parse(rawValue) as Record<string, ConversationOverride>;
  } catch {
    return {} as Record<string, ConversationOverride>;
  }
}

function writeConversationOverrides(overrides: Record<string, ConversationOverride>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_CONVERSATION_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function persistConversationOverride(conversationId: ChatEntityId, override: ConversationOverride) {
  const overrides = readConversationOverrides();
  const overrideKey = getConversationOverrideKey(conversationId);

  overrides[overrideKey] = {
    ...overrides[overrideKey],
    ...override,
  };

  writeConversationOverrides(overrides);
}

export function applyConversationOverrides(conversations: Conversation[]) {
  const overrides = readConversationOverrides();

  return conversations
    .filter((conversation) => !overrides[getConversationOverrideKey(conversation.id)]?.deleted)
    .map((conversation) => {
      const override = overrides[getConversationOverrideKey(conversation.id)];
      if (!override) return conversation;

      return {
        ...conversation,
        title: override.title ?? conversation.title,
        pinned: override.pinned ?? conversation.pinned,
      };
    });
}

export function readStoredProjects() {
  if (typeof window === "undefined") return [] as Project[];

  const rawValue = localStorage.getItem(CHAT_PROJECTS_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const records = JSON.parse(rawValue) as Array<Omit<Project, "createdAt"> & { createdAt?: string }>;

    return records.map((project) => ({
      ...project,
      createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
    }));
  } catch {
    return [];
  }
}

export function writeStoredProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  writeStoredProjectNames(projects.map((project) => project.name));
}

export function readStoredProjectNames() {
  if (typeof window === "undefined") return [] as string[];

  const rawValue = localStorage.getItem(CHAT_PROJECT_NAMES_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const records = JSON.parse(rawValue) as string[];
    return records.filter((name): name is string => typeof name === "string" && Boolean(name.trim()));
  } catch {
    return [];
  }
}

export function writeStoredProjectNames(projectNames: string[]) {
  if (typeof window === "undefined") return;

  const normalizedNames = Array.from(new Set(projectNames.map((name) => name.trim()).filter(Boolean)));
  localStorage.setItem(CHAT_PROJECT_NAMES_STORAGE_KEY, JSON.stringify(normalizedNames));
}

export function rememberStoredProjectName(projectName: string) {
  const nextProjectName = projectName.trim();
  if (!nextProjectName) return;

  writeStoredProjectNames([...readStoredProjectNames(), nextProjectName]);
}
