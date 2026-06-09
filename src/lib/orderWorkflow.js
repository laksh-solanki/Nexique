export const ORDER_STATUS_OPTIONS = [
  {
    value: "new",
    label: "New",
    note: "Needs first review",
    className: "bg-accent/10 text-accent",
  },
  {
    value: "contacted",
    label: "Contacted",
    note: "Customer contacted",
    className: "bg-sky-500/10 text-sky-700",
  },
  {
    value: "proofing",
    label: "Proofing",
    note: "Proof or quote work",
    className: "bg-primary/10 text-primary",
  },
  {
    value: "in_production",
    label: "In production",
    note: "Printing or finishing",
    className: "bg-indigo-500/10 text-indigo-700",
  },
  {
    value: "completed",
    label: "Completed",
    note: "Finished requests",
    className: "bg-emerald-500/10 text-emerald-700",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    note: "Stopped",
    className: "bg-destructive/10 text-destructive",
  },
];

export const ORDER_PRIORITY_OPTIONS = [
  {
    value: "normal",
    label: "Normal",
    className: "bg-secondary text-muted-foreground",
  },
  {
    value: "rush",
    label: "Rush",
    className: "bg-amber-500/15 text-amber-800",
  },
];

const LEGACY_STATUS_MAP = {
  in_progress: "proofing",
};

const statusValues = new Set(ORDER_STATUS_OPTIONS.map((option) => option.value));
const priorityValues = new Set(ORDER_PRIORITY_OPTIONS.map((option) => option.value));

export function normalizeOrderStatus(status) {
  const normalizedStatus = LEGACY_STATUS_MAP[status] || status;
  return statusValues.has(normalizedStatus) ? normalizedStatus : "new";
}

export function normalizeOrderPriority(priority) {
  return priorityValues.has(priority) ? priority : "normal";
}

export function statusLabel(status) {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === normalizeOrderStatus(status))?.label ||
    "New"
  );
}

export function statusNote(status) {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === normalizeOrderStatus(status))?.note ||
    "Needs first review"
  );
}

export function statusClass(status) {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === normalizeOrderStatus(status))
      ?.className || "bg-secondary text-muted-foreground"
  );
}

export function priorityLabel(priority) {
  return (
    ORDER_PRIORITY_OPTIONS.find((option) => option.value === normalizeOrderPriority(priority))
      ?.label || "Normal"
  );
}

export function priorityClass(priority) {
  return (
    ORDER_PRIORITY_OPTIONS.find((option) => option.value === normalizeOrderPriority(priority))
      ?.className || "bg-secondary text-muted-foreground"
  );
}

export function normalizeOrder(order) {
  return {
    ...order,
    status: normalizeOrderStatus(order.status),
    priority: normalizeOrderPriority(order.priority),
    deadline: order.deadline || "",
    admin_note: order.admin_note || "",
  };
}
