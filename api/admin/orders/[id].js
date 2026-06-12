import {
  assertSameOrigin,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/admin.js";
import { getDb, toObjectId } from "../../_lib/mongodb.js";
import { cleanOrderPatch, orderResponse } from "../../_lib/orders.js";

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
  if (!["PATCH", "DELETE"].includes(req.method)) return methodNotAllowed(res, ["PATCH", "DELETE"]);

  try {
    assertSameOrigin(req);
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    const _id = toObjectId(routeId(req));

    if (req.method === "DELETE") {
      await db.collection("orders").deleteOne({ _id });
      return sendJson(res, 200, { ok: true });
    }

    const patch = cleanOrderPatch(await readJson(req));
    if (Object.keys(patch).length === 0) {
      const current = await db.collection("orders").findOne({ _id });
      return sendJson(res, 200, { data: current ? orderResponse(current) : null });
    }

    await db.collection("orders").updateOne({ _id }, { $set: patch });
    const order = await db.collection("orders").findOne({ _id });
    return sendJson(res, 200, { data: orderResponse(order) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
