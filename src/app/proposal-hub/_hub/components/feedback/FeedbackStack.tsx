import "./feedback.css";

import { X } from "lucide-react";

import { FeedbackMessage } from "./types";

interface FeedbackStackProps {
  feedbacks: FeedbackMessage[];
  onRemove?: (id: string) => void;
}

export default function FeedbackStack({
  feedbacks,
  onRemove,
}: FeedbackStackProps) {
  return (
    <div className="feedback-stack">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className={`feedback feedback--${feedback.type}`}
        >
          <span>{feedback.text}</span>

          {onRemove && (
            <button
              type="button"
              className="feedback__close"
              onClick={() => onRemove(feedback.id)}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
