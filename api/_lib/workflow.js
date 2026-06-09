export const ORDER_STATUSES = new Set([
  "new",
  "contacted",
  "proofing",
  "in_production",
  "completed",
  "cancelled",
]);

export const ORDER_PRIORITIES = new Set(["normal", "rush"]);

export function normalizeOrderStatus(status) {
  if (status === "in_progress") return "proofing";
  return ORDER_STATUSES.has(status) ? status : "new";
}

export function normalizeOrderPriority(priority) {
  return ORDER_PRIORITIES.has(priority) ? priority : "normal";
}
