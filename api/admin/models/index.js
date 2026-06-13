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
import { getDb } from "../../_lib/mongodb.js";
import {
  modelOverrideResponse,
  modelResponse,
  validateCustomModel,
  validateModelOverride,
  validateModelOverrideDelete,
} from "../../_lib/models.js";
import { logAdminAction } from "../../_lib/logs.js";

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
  const isOverridesRequest = req.query.overrides === "1";
  const allowedMethods = isOverridesRequest ? ["GET", "PATCH", "DELETE"] : ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) return methodNotAllowed(res, allowedMethods);

  try {
    assertSameOrigin(req);
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();

    if (isOverridesRequest) {
      const collection = db.collection("catalog_model_overrides");

      if (req.method === "GET") {
        const overrides = await collection.find({}).sort({ updated_at: -1 }).toArray();
        return sendJson(res, 200, { data: overrides.map(modelOverrideResponse) });
      }

      if (req.method === "DELETE") {
        const result = validateModelOverrideDelete(await readJson(req), admin);
        if (result.error) return badRequest(res, result.error);

        await collection.updateOne(
          { source_model_id: result.value.source_model_id },
          { $set: result.value, $setOnInsert: result.insert },
          { upsert: true },
        );
        await logAdminAction(admin.email, "delete_model_override", {
          source_model_id: result.value.source_model_id,
        });
        return sendJson(res, 200, { ok: true });
      }

      const result = validateModelOverride(await readJson(req), admin);
      if (result.error) return badRequest(res, result.error);

      await collection.updateOne(
        { source_model_id: result.value.source_model_id },
        { $set: result.value, $setOnInsert: result.insert },
        { upsert: true },
      );
      const model = await collection.findOne({ source_model_id: result.value.source_model_id });
      await logAdminAction(admin.email, "update_model_override", {
        source_model_id: result.value.source_model_id,
        patch: result.value,
      });
      return sendJson(res, 200, { data: modelOverrideResponse(model) });
    }

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
    await logAdminAction(admin.email, "create_custom_model", {
      id: String(model._id),
      name: model.name,
      collection_slug: model.collection_slug,
    });
    return sendJson(res, 201, { data: modelResponse(model) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
