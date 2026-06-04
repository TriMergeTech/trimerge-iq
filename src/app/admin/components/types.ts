// src/admin/types.ts

export type AdminSection =
  | "staff"
  | "admin"
  | "position"
  | "skills"
  | "services"
  | "clients";

export type CreateModal = AdminSection | null;

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  positionId?: string;
  createdAt: Date;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  positionIds: string[];
  createdAt: Date;
}

export interface ClientItem {
  id: string;
  name: string;
  about: string;
  createdAt: Date;
}

export interface PositionItem {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  skillIds: string[];
  createdAt: Date;
}

export interface AdminPageProps {
  onLogout: () => void;
}

export interface PositionApiRecord {
  id?: string;
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
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

export interface ServiceApiRecord {
  id?: string;
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
  id?: string;
  _id?: string;
  name?: string;
  about?: string;
  createdAt?: string;
  created_at?: string;
}

export interface StaffApiRecord {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  position?:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        title?: string;
      };
  createdAt?: string;
  created_at?: string;
}

export interface UserApiRecord {
  id?: string;
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
