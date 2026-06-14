import { apiRequest } from "@/lib/apiClient";
import { normalizeOrder } from "@/lib/orderWorkflow";

export async function createOrder(payload) {
  const response = await apiRequest("/api/orders", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function listOrders() {
  const response = await apiRequest("/api/admin/orders");
  return (response.data || []).map((order) => normalizeOrder(order));
}

export async function updateOrder(id, patch) {
  const response = await apiRequest(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
  return response.data ? normalizeOrder(response.data) : null;
}

export async function updateOrderStatus(id, status) {
  return updateOrder(id, { status });
}

export async function deleteOrder(id) {
  await apiRequest(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createCustomModel(payload) {
  const response = await apiRequest("/api/admin/models", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function listCustomModels() {
  const response = await apiRequest("/api/admin/models");
  return response.data || [];
}

export async function updateCustomModel(id, payload) {
  const response = await apiRequest(`/api/admin/models/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });
  return response.data;
}

export async function listModelOverrides() {
  const response = await apiRequest("/api/admin/models?overrides=1");
  return response.data || [];
}

export async function updateModelOverride(sourceModelId, payload) {
  const response = await apiRequest("/api/admin/models?overrides=1", {
    method: "PATCH",
    body: { ...payload, source_model_id: sourceModelId },
  });
  return response.data;
}

export async function deleteModelOverride(sourceModelId) {
  await apiRequest("/api/admin/models?overrides=1", {
    method: "DELETE",
    body: { source_model_id: sourceModelId },
  });
}

export async function listPublicCustomModels(collectionSlug) {
  const query = collectionSlug ? `?collection_slug=${encodeURIComponent(collectionSlug)}` : "";
  const response = await apiRequest(`/api/catalog/models${query}`);
  return response.data || [];
}

export async function listPublicModelOverrides(collectionSlug) {
  const query = new URLSearchParams({ overrides: "1" });
  if (collectionSlug) query.set("collection_slug", collectionSlug);
  const response = await apiRequest(`/api/catalog/models?${query.toString()}`);
  return response.data || [];
}

export async function listCatalogAssets(params = {}) {
  const query = new URLSearchParams({ assets: "1" });

  if (params.kind) query.set("kind", params.kind);
  if (params.collection_slug) query.set("collection_slug", params.collection_slug);
  if (params.keys?.length) query.set("keys", params.keys.join(","));

  const response = await apiRequest(`/api/catalog/models?${query.toString()}`);
  return response.data || [];
}

export async function deleteCustomModel(id) {
  await apiRequest(`/api/admin/models/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getAdminHealth() {
  return apiRequest("/api/admin/health");
}

export async function bulkUpdateOrders(ids, patch) {
  const response = await apiRequest("/api/admin/orders/bulk", {
    method: "PATCH",
    body: { ids, patch },
  });
  return response;
}

export async function bulkDeleteOrders(ids) {
  const response = await apiRequest("/api/admin/orders/bulk", {
    method: "DELETE",
    body: { ids },
  });
  return response;
}

export async function getDevStats() {
  return apiRequest("/api/admin/dev-stats");
}

export async function getAdminLogs(limit = 50) {
  return apiRequest(`/api/admin/logs?limit=${limit}`);
}

export async function runAdminSeeder(action) {
  return apiRequest("/api/admin/seed", {
    method: "POST",
    body: { action },
  });
}

export async function getCustomerOrders(token) {
  return apiRequest("/api/customer/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function cancelCustomerOrder(orderId, token) {
  return apiRequest("/api/customer/orders", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: { id: orderId, status: "cancelled" },
  });
}

export async function getAdminCustomers() {
  const response = await apiRequest("/api/admin/customers");
  return response.data || [];
}

export async function getCustomerProfile(token) {
  const response = await apiRequest("/api/customer/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateCustomerProfile(payload, token) {
  const response = await apiRequest("/api/customer/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });
  return response.data;
}
