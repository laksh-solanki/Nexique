import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/admin.js";
import { getDb } from "../../_lib/mongodb.js";
import { orderResponse } from "../../_lib/orders.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    const orders = await db.collection("orders").find({}).sort({ created_at: -1 }).toArray();
    return sendJson(res, 200, { data: orders.map(orderResponse) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
