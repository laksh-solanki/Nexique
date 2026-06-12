import { handleApiError, methodNotAllowed, sendJson } from "../_lib/http.js";
import { assetResponse, buildAssetFilter } from "../_lib/assets.js";
import { getDb } from "../_lib/mongodb.js";
import { modelOverrideResponse, modelResponse } from "../_lib/models.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const db = await getDb();

    if (req.query.assets === "1") {
      const assets = await db
        .collection("catalog_assets")
        .find(buildAssetFilter(req.query))
        .sort({ sort_order: 1, key: 1 })
        .limit(80)
        .toArray();

      return sendJson(res, 200, { data: assets.map(assetResponse) });
    }

    const collectionSlug = String(req.query.collection_slug || "").trim();
    const filter = collectionSlug ? { collection_slug: collectionSlug } : {};

    if (req.query.overrides === "1") {
      const models = await db
        .collection("catalog_model_overrides")
        .find(filter)
        .sort({ updated_at: -1 })
        .toArray();

      return sendJson(res, 200, { data: models.map(modelOverrideResponse) });
    }

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
