import { handleApiError, methodNotAllowed, sendJson, unauthorized } from "../_lib/http.js";
import { requireAdmin } from "../_lib/admin.js";
import { getDb } from "../_lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    const orders = await db.collection("orders").find({}).sort({ created_at: -1 }).toArray();

    const customersMap = {};
    orders.forEach((order) => {
      const email = String(order.customer_email || "")
        .trim()
        .toLowerCase();
      if (!email) return;

      if (!customersMap[email]) {
        customersMap[email] = {
          email,
          customer_uid: order.customer_uid || null,
          customer_name: order.customer_name || "Unknown",
          customer_phone: order.customer_phone || "",
          total_orders: 0,
          active_orders: 0,
          total_spent: 0,
          last_order_at: order.created_at,
          orders: [],
        };
      }

      const cust = customersMap[email];
      cust.total_orders += 1;

      if (["new", "contacted", "proofing", "in_production"].includes(order.status)) {
        cust.active_orders += 1;
      }

      const cardPrice = 2.5; // Estimated flat price for aggregation spent totals
      cust.total_spent += Number(order.quantity || 0) * cardPrice;

      if (new Date(order.created_at) > new Date(cust.last_order_at)) {
        cust.last_order_at = order.created_at;
        cust.customer_name = order.customer_name;
        if (order.customer_phone) cust.customer_phone = order.customer_phone;
      }

      cust.orders.push({
        id: String(order._id || order.id),
        model_name: order.model_name,
        collection_name: order.collection_name,
        quantity: order.quantity,
        status: order.status,
        priority: order.priority,
        deadline: order.deadline || "",
        created_at: order.created_at,
      });
    });

    const customers = Object.values(customersMap).sort((a, b) => b.total_orders - a.total_orders);
    return sendJson(res, 200, { data: customers });
  } catch (err) {
    return handleApiError(res, err);
  }
}
