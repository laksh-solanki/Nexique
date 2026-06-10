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

export async function listPublicCustomModels(collectionSlug) {
  const query = collectionSlug ? `?collection_slug=${encodeURIComponent(collectionSlug)}` : "";
  const response = await apiRequest(`/api/catalog/models${query}`);
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
