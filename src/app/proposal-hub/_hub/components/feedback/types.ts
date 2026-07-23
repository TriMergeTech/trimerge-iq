export type FeedbackType = "success" | "error" | "info" | "warning";

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  text: string;
}
