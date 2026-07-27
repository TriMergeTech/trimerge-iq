export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file?: File;
  extractedRfpData?: Record<string, unknown>;
  extractionStatus?: "pending" | "ready" | "error";
  extractionError?: string;
}

export type ChatEntityId = number | string;

export interface Message {
  id: ChatEntityId;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  files?: UploadedFile[];
  pendingTool?: string | null;
}

export interface Project {
  id: ChatEntityId;
  name: string;
  createdAt: Date;
  description?: string;
  service?: string;
  team?: string[];
  projectManager?: string;
  client?: string;
  pinned?: boolean;
  archived?: boolean;
}

export interface ProjectFormOption {
  id: string;
  label: string;
}

export interface Conversation {
  id: ChatEntityId;
  title: string;
  updatedAt: Date;
  messages: Message[];
  projectId: ChatEntityId | null;
  projectName?: string | null;
  profile?: string;
  memory?: string;
  recentMessage?: string;
  pinned?: boolean;
  archived?: boolean;
  pendingTool?: string | null;
}

export const serviceOptions = [
  "Strategy Consulting",
  "Digital Transformation",
  "Operational Excellence",
] as const;

export const staffOptions = [
  "John Smith",
  "Sarah Johnson",
  "Michael Chen",
  "Emily Davis",
] as const;
