import {
  badRequest,
  assertSameOrigin,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
  notFound,
} from "../_lib/http.js";
import { getDb, toObjectId } from "../_lib/mongodb.js";
import { getCustomerFromRequest } from "../_lib/firebaseAuth.js";
import { orderResponse } from "../_lib/orders.js";
import { logAdminAction } from "../_lib/logs.js";

export default async function handler(req, res) {
  if (!["GET", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["GET", "PATCH"]);

  try {
    assertSameOrigin(req);
    const customer = await getCustomerFromRequest(req);
    if (!customer) return unauthorized(res);

    const db = await getDb();

    if (req.method === "GET") {
      const orders = await db
        .collection("orders")
        .find({
          $or: [{ customer_email: customer.email }, { customer_uid: customer.uid }],
        })
        .sort({ created_at: -1 })
        .toArray();
      return sendJson(res, 200, { data: orders.map(orderResponse) });
    }

    if (req.method === "PATCH") {
      const payload = await readJson(req);
      const orderId = payload.id || req.query.id;
      if (!orderId) {
        return badRequest(res, "Order ID is required.");
      }

      const _id = toObjectId(orderId);
      const order = await db.collection("orders").findOne({ _id });
      if (!order) {
        return notFound(res, "Order not found.");
      }

      const matchesEmail =
        String(order.customer_email || "").toLowerCase() === customer.email.toLowerCase();
      const matchesUid = order.customer_uid === customer.uid;
      if (!matchesEmail && !matchesUid) {
        return unauthorized(res);
      }

      if (payload.status !== "cancelled") {
        return badRequest(res, "Customers can only update status to cancelled.");
      }

      if (order.status !== "new") {
        return badRequest(
          res,
          "Only new orders can be cancelled. Please contact Nexique support to update processing requests.",
        );
      }

      await db
        .collection("orders")
        .updateOne({ _id }, { $set: { status: "cancelled", updated_at: new Date() } });
      const updatedOrder = await db.collection("orders").findOne({ _id });

      await logAdminAction(`customer:${customer.email}`, "cancel_order", { id: orderId });

      return sendJson(res, 200, { data: orderResponse(updatedOrder) });
    }
  } catch (err) {
    return handleApiError(res, err);
  }
}
