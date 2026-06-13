import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../_lib/http.js";
import { requireAdmin } from "../_lib/admin.js";
import { mongoDbName } from "../_lib/env.js";
import { pingMongo } from "../_lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await pingMongo();
    const [admins, orders, customModels] = await Promise.all([
      db.collection("admins").countDocuments({ active: true }),
      db.collection("orders").countDocuments(),
      db.collection("custom_card_models").countDocuments(),
    ]);

    return sendJson(res, 200, {
      ok: true,
      mongodb: "connected",
      database: mongoDbName(),
      counts: { admins, orders, custom_card_models: customModels },
    });
  } catch (err) {
    return handleApiError(res, err);
  }
}
