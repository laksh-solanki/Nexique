import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/admin.js";
import { getDb, toObjectId } from "../../_lib/mongodb.js";

function routeId(req) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  return (
    id ||
    String(req.url || "")
      .split("/")
      .pop()
  );
}

export default async function handler(req, res) {
  if (req.method !== "DELETE") return methodNotAllowed(res, ["DELETE"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    await db.collection("custom_card_models").deleteOne({ _id: toObjectId(routeId(req)) });
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    return handleApiError(res, err);
  }
}
