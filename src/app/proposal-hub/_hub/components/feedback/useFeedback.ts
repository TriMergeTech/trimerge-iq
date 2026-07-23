import { useState } from "react";
import { FeedbackMessage, FeedbackType } from "./types";
import FeedbackStack from "./FeedbackStack";

export default function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);

  const pushFeedback = (
    text: string,
    type: FeedbackType = "info",
    duration = 3500,
  ) => {
    const id = `${Date.now()}-${Math.random()}`;

    setFeedbacks((current) => [
      ...current,
      {
        id,
        text,
        type,
      },
    ]);

    setTimeout(() => {
      setFeedbacks((current) => current.filter((msg) => msg.id !== id));
    }, duration);
  };

  const removeFeedback = (id: string) => {
    setFeedbacks((current) => current.filter((msg) => msg.id !== id));
  };

  const clearFeedbacks = () => {
    setFeedbacks([]);
  };

  return {
    feedbacks,
    pushFeedback,
    removeFeedback,
    clearFeedbacks,
  };
}

export { FeedbackStack };
