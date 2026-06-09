import {
  badRequest,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/admin.js";
import { getDb } from "../../_lib/mongodb.js";
import { modelResponse, validateCustomModel } from "../../_lib/models.js";

async function uniqueSlug(db, collectionSlug, baseSlug) {
  const rootSlug = baseSlug || "custom-card";
  let slug = rootSlug;
  let suffix = 2;

  while (
    await db.collection("custom_card_models").findOne({ collection_slug: collectionSlug, slug })
  ) {
    slug = `${rootSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return methodNotAllowed(res, ["GET", "POST"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();

    if (req.method === "GET") {
      const models = await db
        .collection("custom_card_models")
        .find({})
        .sort({ created_at: -1 })
        .toArray();
      return sendJson(res, 200, { data: models.map(modelResponse) });
    }

    const result = validateCustomModel(await readJson(req), admin);
    if (result.error) return badRequest(res, result.error);

    result.value.slug = await uniqueSlug(db, result.value.collection_slug, result.value.slug);
    const write = await db.collection("custom_card_models").insertOne(result.value);
    const model = await db.collection("custom_card_models").findOne({ _id: write.insertedId });
    return sendJson(res, 201, { data: modelResponse(model) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
