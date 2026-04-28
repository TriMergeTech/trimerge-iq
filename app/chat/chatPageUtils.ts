export function getAIResponse(userMessage: string, fileCount: number): string {
  if (fileCount > 0) {
    return `I've received your message and ${fileCount} file(s). I can help you analyze these materials and turn them into a usable summary, plan, or recommendation.`;
  }

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("strategic") || lowerMessage.includes("consulting")) {
    return "A strong consulting response starts by clarifying the business objective, diagnosing the gap, prioritizing the highest-value opportunities, and then sequencing initiatives into an execution roadmap.";
  }

  if (lowerMessage.includes("operational") || lowerMessage.includes("efficiency")) {
    return "To improve operational efficiency, begin with process mapping, identify the biggest friction points, assign measurable targets, and then pair quick wins with one or two structural improvements.";
  }

  if (lowerMessage.includes("digital") || lowerMessage.includes("transformation")) {
    return "The latest transformation work usually blends automation, better internal data visibility, leaner workflows, and clearer governance so teams can scale without adding complexity.";
  }

  if (lowerMessage.includes("financial") || lowerMessage.includes("analysis")) {
    return "For financial analysis, I would frame the work around revenue drivers, margin pressure, cash timing, and scenario planning so leadership can make decisions with clearer tradeoffs.";
  }

  return `I can help with that. If you want, I can turn "${userMessage}" into a structured answer, a client-ready summary, or a step-by-step plan.`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
