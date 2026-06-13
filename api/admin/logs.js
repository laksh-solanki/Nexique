import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../_lib/http.js";
import { requireAdmin } from "../_lib/admin.js";
import { getDb } from "../_lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
    const logs = await db
      .collection("admin_logs")
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    return sendJson(res, 200, { data: logs });
  } catch (err) {
    return handleApiError(res, err);
  }
}
