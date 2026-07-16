import { normalizeOrderPriority, normalizeOrderStatus } from "./workflow.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value, maxLength) {
  const clean = String(value || "").trim();
  return clean.slice(0, maxLength);
}

function nullableText(value, maxLength) {
  const clean = text(value, maxLength);
  return clean || null;
}

function cleanPublicDeadline(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return { value: null };

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})(?:T|$)/);
  if (!match) return { error: "Deadline must be a valid date." };

  const dateOnly = match[1];
  const parsed = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dateOnly) {
    return { error: "Deadline must be a valid date." };
  }

  return { value: dateOnly };
}

export function orderResponse(order) {
  return {
    id: String(order._id || order.id),
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone || null,
    quantity: order.quantity,
    message: order.message || null,
    collection_slug: order.collection_slug,
    collection_name: order.collection_name,
    model_slug: order.model_slug,
    model_name: order.model_name,
    design_variant: order.design_variant || null,
    status: normalizeOrderStatus(order.status),
    priority: normalizeOrderPriority(order.priority),
    deadline: order.deadline || "",
    admin_note: order.admin_note || "",
    created_at: order.created_at?.toISOString?.() || order.created_at,
    updated_at: order.updated_at?.toISOString?.() || order.updated_at || "",
  };
}

export function validatePublicOrder(payload) {
  const customerName = text(payload.customer_name, 100);
  const customerEmail = text(payload.customer_email, 255).toLowerCase();
  const quantity = Number(payload.quantity);
  const collectionSlug = text(payload.collection_slug, 100);
  const collectionName = text(payload.collection_name, 120);
  const modelSlug = text(payload.model_slug, 120);
  const modelName = text(payload.model_name, 120);
  const deadline = cleanPublicDeadline(payload.deadline);

  if (!customerName) return { error: "Name required." };
  if (!EMAIL_RE.test(customerEmail)) return { error: "Valid email required." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    return { error: "Quantity must be between 1 and 10000." };
  }
  if (!collectionSlug || !collectionName || !modelSlug || !modelName) {
    return { error: "Card details are required." };
  }
  if (deadline.error) return deadline;

  const now = new Date();
  return {
    value: {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: nullableText(payload.customer_phone, 30),
      quantity,
      message: nullableText(payload.message, 1000),
      collection_slug: collectionSlug,
      collection_name: collectionName,
      model_slug: modelSlug,
      model_name: modelName,
      design_variant: nullableText(payload.design_variant, 80),
      status: "new",
      priority: "normal",
      deadline: deadline.value,
      admin_note: "",
      created_at: now,
      updated_at: now,
    },
  };
}

export function cleanOrderPatch(payload) {
  const patch = {};

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    patch.status = normalizeOrderStatus(payload.status);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "priority")) {
    patch.priority = normalizeOrderPriority(payload.priority);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "deadline")) {
    patch.deadline = text(payload.deadline, 20) || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "admin_note")) {
    patch.admin_note = text(payload.admin_note, 1000);
  }

  if (Object.keys(patch).length > 0) patch.updated_at = new Date();
  return patch;
}
