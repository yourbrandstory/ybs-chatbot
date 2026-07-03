export function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function getTemperature(messageCount: number, leadCaptured: boolean): string {
  if (leadCaptured) return "hot";
  if (messageCount > 8) return "hot";
  if (messageCount >= 4) return "warm";
  return "cold";
}

export function detectLeadCaptureTrigger(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("name") &&
    lower.includes("email") &&
    (lower.includes("walkthrough") || lower.includes("demo") || lower.includes("book"))
  );
}
