import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../_lib/http.js";
import { requireAdmin } from "../_lib/admin.js";
import { getDb, toObjectId } from "../_lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return methodNotAllowed(res, ["DELETE"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    await db.collection("custom_card_models").deleteOne({ _id: toObjectId(req.query.id) });
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    return handleApiError(res, err);
  }
}
