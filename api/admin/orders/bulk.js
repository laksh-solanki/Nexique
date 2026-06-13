import {
  badRequest,
  assertSameOrigin,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/admin.js";
import { getDb, toObjectId } from "../../_lib/mongodb.js";
import { cleanOrderPatch } from "../../_lib/orders.js";
import { logAdminAction } from "../../_lib/logs.js";

export default async function handler(req, res) {
  if (!["PATCH", "DELETE"].includes(req.method)) return methodNotAllowed(res, ["PATCH", "DELETE"]);

  try {
    assertSameOrigin(req);
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const payload = await readJson(req);
    const ids = payload.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "IDs array is required and must not be empty.");
    }

    const db = await getDb();
    const objectIds = ids.map(toObjectId);

    if (req.method === "DELETE") {
      const result = await db.collection("orders").deleteMany({ _id: { $in: objectIds } });
      await logAdminAction(admin.email, "bulk_delete_orders", { count: result.deletedCount, ids });
      return sendJson(res, 200, { ok: true, deletedCount: result.deletedCount });
    }

    const patch = cleanOrderPatch(payload.patch || {});
    if (Object.keys(patch).length === 0) {
      return badRequest(res, "No valid patch fields provided.");
    }

    const result = await db
      .collection("orders")
      .updateMany({ _id: { $in: objectIds } }, { $set: patch });
    await logAdminAction(admin.email, "bulk_update_orders", {
      count: result.modifiedCount,
      ids,
      patch,
    });
    return sendJson(res, 200, { ok: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    return handleApiError(res, err);
  }
}
