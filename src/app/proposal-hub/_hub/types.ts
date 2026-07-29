export type ProposalStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export interface Section {
  _id: string;
  id?: string;
  title?: string;
  body?: string;
  type?: string;
  created?: string;
  [key: string]: any;
}

export interface Proposal {
  _id?: string;
  id?: string;
  title?: string;
  opportunity_title?: string;
  description?: string;
  category?: string;
  budget?: string;
  timeline?: string;
  status?: ProposalStatus;
  createdAt?: Date;
  created?: string;
  sections?: number;
  [key: string]: any;
}
