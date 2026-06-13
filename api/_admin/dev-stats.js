import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../_lib/http.js";
import { requireAdmin } from "../_lib/admin.js";
import { pingMongo } from "../_lib/mongodb.js";
import { mongoDbName } from "../_lib/env.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const startPing = Date.now();
    const db = await pingMongo();
    const pingLatency = Date.now() - startPing;

    const [admins, orders, customModels, catalogAssets, adminLogs] = await Promise.all([
      db.collection("admins").countDocuments(),
      db.collection("orders").countDocuments(),
      db.collection("custom_card_models").countDocuments(),
      db.collection("catalog_assets").countDocuments(),
      db.collection("admin_logs").countDocuments(),
    ]);

    const stats = {
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: Math.floor(process.uptime()),
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          rss: process.memoryUsage().rss,
        },
      },
      mongodb: {
        ok: true,
        latencyMs: pingLatency,
        database: mongoDbName(),
        counts: {
          admins,
          orders,
          custom_card_models: customModels,
          catalog_assets: catalogAssets,
          admin_logs: adminLogs,
        },
      },
      env: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasMongoUri: !!process.env.MONGODB_URI,
        hasDbName: !!process.env.MONGODB_DB_NAME,
        hasSessionSecret: !!process.env.SESSION_SECRET,
      },
    };

    return sendJson(res, 200, stats);
  } catch (err) {
    return handleApiError(res, err);
  }
}
