import {
  assertSameOrigin,
  badRequest,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
} from "./_lib/http.js";
import { getDb } from "./_lib/mongodb.js";
import { orderResponse, validatePublicOrder } from "./_lib/orders.js";
import { consumeOrderLimit, rateLimitKey } from "./_lib/rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    assertSameOrigin(req);
    const payload = await readJson(req);
    const result = validatePublicOrder(payload);
    if (result.error) return badRequest(res, result.error);

    const db = await getDb();
    await consumeOrderLimit(db, rateLimitKey("public-order", req));
    const write = await db.collection("orders").insertOne(result.value);
    const order = await db.collection("orders").findOne({ _id: write.insertedId });
    return sendJson(res, 201, { data: orderResponse(order) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
