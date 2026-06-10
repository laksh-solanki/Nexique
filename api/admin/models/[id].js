import {
  badRequest,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/admin.js";
import { getDb, toObjectId } from "../../_lib/mongodb.js";
import { modelResponse, validateCustomModelPatch } from "../../_lib/models.js";

function routeId(req) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  return (
    id ||
    String(req.url || "")
      .split("/")
      .pop()
  );
}

async function uniqueSlug(db, collectionSlug, baseSlug, currentId) {
  const rootSlug = baseSlug || "custom-card";
  let slug = rootSlug;
  let suffix = 2;

  while (
    await db
      .collection("custom_card_models")
      .findOne({ collection_slug: collectionSlug, slug, _id: { $ne: currentId } })
  ) {
    slug = `${rootSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export default async function handler(req, res) {
  if (!["PATCH", "DELETE"].includes(req.method)) return methodNotAllowed(res, ["PATCH", "DELETE"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const db = await getDb();
    const _id = toObjectId(routeId(req));

    if (req.method === "DELETE") {
      await db.collection("custom_card_models").deleteOne({ _id });
      return sendJson(res, 200, { ok: true });
    }

    const result = validateCustomModelPatch(await readJson(req));
    if (result.error) return badRequest(res, result.error);

    const current = await db.collection("custom_card_models").findOne({ _id });
    if (!current) return sendJson(res, 404, { error: "Custom card not found." });

    result.value.slug = await uniqueSlug(db, result.value.collection_slug, result.value.slug, _id);
    await db.collection("custom_card_models").updateOne({ _id }, { $set: result.value });
    const model = await db.collection("custom_card_models").findOne({ _id });
    return sendJson(res, 200, { data: modelResponse(model) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
