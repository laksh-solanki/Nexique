import healthHandler from "./_health.js";
import ordersHandler from "./_orders.js";
import catalogModelsHandler from "./_catalog/models.js";
import customerOrdersHandler from "./_customer/orders.js";
import adminCustomersHandler from "./_admin/customers.js";
import adminDevStatsHandler from "./_admin/dev-stats.js";
import adminHealthHandler from "./_admin/health.js";
import adminLoginHandler from "./_admin/login.js";
import adminLogoutHandler from "./_admin/logout.js";
import adminLogsHandler from "./_admin/logs.js";
import adminSeedHandler from "./_admin/seed.js";
import adminSessionHandler from "./_admin/session.js";
import adminModelsIndexHandler from "./_admin/models/index.js";
import adminModelsIdHandler from "./_admin/models/[id].js";
import adminOrdersIndexHandler from "./_admin/orders/index.js";
import adminOrdersIdHandler from "./_admin/orders/[id].js";
import adminOrdersBulkHandler from "./_admin/orders/bulk.js";

import { notFound } from "./_lib/http.js";

export default async function handler(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = parsedUrl.pathname.replace(/\/$/, "");

  // Populate req.query if not present, including parsing URL searchParams
  if (!req.query) {
    req.query = {};
  }
  for (const [key, value] of parsedUrl.searchParams.entries()) {
    req.query[key] = value;
  }

  // Exact matching for routes without dynamic params
  if (pathname === "/api/health") {
    return healthHandler(req, res);
  }
  if (pathname === "/api/orders") {
    return ordersHandler(req, res);
  }
  if (pathname === "/api/catalog/models") {
    return catalogModelsHandler(req, res);
  }
  if (pathname === "/api/customer/orders") {
    return customerOrdersHandler(req, res);
  }
  if (pathname === "/api/admin/customers") {
    return adminCustomersHandler(req, res);
  }
  if (pathname === "/api/admin/dev-stats") {
    return adminDevStatsHandler(req, res);
  }
  if (pathname === "/api/admin/health") {
    return adminHealthHandler(req, res);
  }
  if (pathname === "/api/admin/login") {
    return adminLoginHandler(req, res);
  }
  if (pathname === "/api/admin/logout") {
    return adminLogoutHandler(req, res);
  }
  if (pathname === "/api/admin/logs") {
    return adminLogsHandler(req, res);
  }
  if (pathname === "/api/admin/seed") {
    return adminSeedHandler(req, res);
  }
  if (pathname === "/api/admin/session") {
    return adminSessionHandler(req, res);
  }
  if (pathname === "/api/admin/models") {
    return adminModelsIndexHandler(req, res);
  }
  if (pathname === "/api/admin/orders") {
    return adminOrdersIndexHandler(req, res);
  }
  if (pathname === "/api/admin/orders/bulk") {
    return adminOrdersBulkHandler(req, res);
  }

  // Dynamic route matching for /api/admin/models/[id]
  if (pathname.startsWith("/api/admin/models/")) {
    const id = pathname.substring("/api/admin/models/".length);
    if (id) {
      req.query.id = id;
      return adminModelsIdHandler(req, res);
    }
  }

  // Dynamic route matching for /api/admin/orders/[id]
  if (pathname.startsWith("/api/admin/orders/")) {
    const id = pathname.substring("/api/admin/orders/".length);
    if (id && id !== "bulk") {
      req.query.id = id;
      return adminOrdersIdHandler(req, res);
    }
  }

  return notFound(res, "Endpoint not found.");
}
