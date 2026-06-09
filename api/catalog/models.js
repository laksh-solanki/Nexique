import { handleApiError, methodNotAllowed, sendJson } from "../_lib/http.js";
import { getDb } from "../_lib/mongodb.js";
import { modelResponse } from "../_lib/models.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const collectionSlug = String(req.query.collection_slug || "").trim();
    const filter = collectionSlug ? { collection_slug: collectionSlug } : {};
    const db = await getDb();
    const models = await db
      .collection("custom_card_models")
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    return sendJson(res, 200, { data: models.map(modelResponse) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
