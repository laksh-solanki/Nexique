const TEXT_MAX_LENGTH = 220;
const MAX_ASSET_KEYS = 12;

function text(value, maxLength = TEXT_MAX_LENGTH) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

export function assetResponse(asset) {
  return {
    id: String(asset._id || asset.id),
    key: asset.key,
    kind: asset.kind || "local",
    label: asset.label || "",
    alt: asset.alt || "",
    collection_slug: asset.collection_slug || "",
    model_name: asset.model_name || "",
    variant_name: asset.variant_name || "",
    image_data_url: asset.image_data_url || "",
    created_at: asset.created_at?.toISOString?.() || asset.created_at || "",
    updated_at: asset.updated_at?.toISOString?.() || asset.updated_at || "",
  };
}

export function buildAssetFilter(query) {
  const keys = splitList(query.keys || query.key || query.asset_key);
  const kind = text(query.kind, 80);
  const collectionSlug = text(query.collection_slug || query.slug, 100);

  if (!keys.length && !kind && !collectionSlug) {
    return invalidAssetRequest("Asset key or kind required.");
  }
  if (keys.length > MAX_ASSET_KEYS) {
    return invalidAssetRequest(`No more than ${MAX_ASSET_KEYS} asset keys per request.`);
  }
  if (!keys.length && ["local", "wedding-variant"].includes(kind)) {
    return invalidAssetRequest("Exact asset keys required.");
  }

  const filter = {};

  if (keys.length) filter.key = { $in: keys };
  if (kind) filter.kind = kind;
  if (collectionSlug) filter.collection_slug = collectionSlug;

  return filter;
}

function invalidAssetRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  err.publicMessage = message;
  throw err;
}

function splitList(value) {
  if (Array.isArray(value)) return value.flatMap(splitList);

  return String(value || "")
    .split(",")
    .map((item) => text(item, 220))
    .filter(Boolean);
}
