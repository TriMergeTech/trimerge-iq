export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  files?: UploadedFile[];
}

export interface Project {
  id: number;
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

export interface Conversation {
  id: number;
  title: string;
  updatedAt: Date;
  messages: Message[];
  projectId: number | null;
  pinned?: boolean;
  archived?: boolean;
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
