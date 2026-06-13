const IMAGE_MAX_DATA_URL_LENGTH = 900_000;
const IMAGE_DATA_URL_PATTERN = /^data:image\/(png|jpe?g|webp);base64,([a-z0-9+/]+={0,2})$/i;
const BASE_MODEL_ID_PATTERN = /^base:([a-z0-9-]+):([a-z0-9-]+)$/;
const DESIGN_VARIANT_ALIASES = new Map([
  ["classic", "classic"],
  ["modern", "modern"],
  ["minimal", "minimal"],
  ["bold", "bold"],
  ["vintage", "vintage"],
  ["luxe", "luxe"],
  ["luxe-gold", "luxe"],
]);

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function text(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function storedPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return null;
  return Math.round(price * 100) / 100;
}

function cleanPrice(value) {
  if (value == null) return { error: "Price required." };

  const raw = String(value).replace(/,/g, "").trim();
  if (!raw) return { error: "Price required." };

  const price = Number(raw);
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a valid price." };
  if (price > 9_999_999) return { error: "Price is too high." };

  return Math.round(price * 100) / 100;
}

function cleanImageDataUrl(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (image.length > IMAGE_MAX_DATA_URL_LENGTH) {
    return { error: "Image is too large to save. Upload a smaller image." };
  }
  const match = image.match(IMAGE_DATA_URL_PATTERN);
  if (!match) {
    return { error: "Image must be PNG, JPG, JPEG, or WEBP." };
  }
  return image;
}

function cleanVariantSlugs(value) {
  if (value == null) return { error: "Enter at least one subcategory." };

  const rawSlugs = Array.isArray(value) ? value : String(value).split(/[\n,]+/);
  if (!rawSlugs.some((item) => String(item || "").trim())) {
    return { error: "Enter at least one subcategory." };
  }
  const slugs = [
    ...new Set(
      rawSlugs
        .map((item) => slugify(text(item, 60)))
        .map((slug) => DESIGN_VARIANT_ALIASES.get(slug) || slug)
        .filter(Boolean)
        .map((slug) => slug.slice(0, 40)),
    ),
  ].slice(0, 12);

  if (slugs.length === 0) return { error: "Enter at least one subcategory." };
  return slugs;
}

function modelVariantSlugs(model) {
  const slugs = cleanVariantSlugs(model.variant_slugs);
  return slugs?.error ? [] : slugs;
}

export function modelResponse(model) {
  return {
    id: String(model._id || model.id),
    collection_slug: model.collection_slug,
    name: model.name,
    slug: model.slug,
    tag: model.tag,
    price: storedPrice(model.price),
    tint: model.tint || "from-rose-200 to-amber-100",
    image_data_url: model.image_data_url || "",
    image_alt: model.image_alt || "",
    variant_slugs: modelVariantSlugs(model),
    created_at: model.created_at?.toISOString?.() || model.created_at,
    updated_at: model.updated_at?.toISOString?.() || model.updated_at || "",
  };
}

function validateCustomModelInput(payload) {
  const collectionSlug = text(payload.collection_slug, 100);
  const name = text(payload.name, 100);
  const tag = text(payload.tag, 40);
  const price = cleanPrice(payload.price);
  const tint = text(payload.tint, 120) || "from-rose-200 to-amber-100";
  const imageData = cleanImageDataUrl(payload.image_data_url);
  const variantSlugs = cleanVariantSlugs(payload.variant_slugs);

  if (!collectionSlug) return { error: "Collection required." };
  if (!name) return { error: "Card name required." };
  if (!tag) return { error: "Tag required." };
  if (price?.error) return price;
  if (imageData?.error) return imageData;
  if (variantSlugs?.error) return variantSlugs;

  return {
    value: {
      collection_slug: collectionSlug,
      name,
      slug: slugify(name),
      tag,
      price,
      tint,
      image_data_url: imageData,
      image_alt: imageData ? `${name} card preview` : "",
      variant_slugs: variantSlugs,
    },
  };
}

export function validateCustomModel(payload, admin) {
  const result = validateCustomModelInput(payload);
  if (result.error) return result;

  const now = new Date();
  return {
    value: {
      ...result.value,
      created_by: admin.email,
      created_at: now,
      updated_at: now,
    },
  };
}

export function validateCustomModelPatch(payload) {
  const result = validateCustomModelInput(payload);
  if (result.error) return result;

  return {
    value: {
      ...result.value,
      updated_at: new Date(),
    },
  };
}

export function modelOverrideResponse(model) {
  return {
    id: model.source_model_id,
    source_model_id: model.source_model_id,
    collection_slug: model.collection_slug,
    slug: model.slug,
    name: model.name || "",
    tag: model.tag || "",
    price: storedPrice(model.price),
    tint: model.tint || "from-rose-200 to-amber-100",
    image_data_url: model.image_data_url || "",
    image_alt: model.image_alt || "",
    variant_slugs: modelVariantSlugs(model),
    deleted: Boolean(model.deleted),
    updated_at: model.updated_at?.toISOString?.() || model.updated_at || "",
  };
}

export function validateModelOverride(payload, admin) {
  const sourceModelId = text(payload.source_model_id, 160);
  const match = sourceModelId.match(BASE_MODEL_ID_PATTERN);
  if (!match) return { error: "Base card id required." };

  const name = text(payload.name, 100);
  const tag = text(payload.tag, 40);
  const price = cleanPrice(payload.price);
  const tint = text(payload.tint, 120) || "from-rose-200 to-amber-100";
  const imageData = cleanImageDataUrl(payload.image_data_url);
  const variantSlugs = cleanVariantSlugs(payload.variant_slugs);

  if (!name) return { error: "Card name required." };
  if (!tag) return { error: "Tag required." };
  if (price?.error) return price;
  if (imageData?.error) return imageData;
  if (variantSlugs?.error) return variantSlugs;

  const [, collectionSlug, slug] = match;
  const now = new Date();
  return {
    value: {
      source_model_id: sourceModelId,
      collection_slug: collectionSlug,
      slug,
      name,
      tag,
      price,
      tint,
      image_data_url: imageData,
      image_alt: imageData ? `${name} card preview` : "",
      variant_slugs: variantSlugs,
      deleted: false,
      updated_by: admin.email,
      updated_at: now,
    },
    insert: {
      created_by: admin.email,
      created_at: now,
    },
  };
}

export function validateModelOverrideDelete(payload, admin) {
  const sourceModelId = text(payload.source_model_id, 160);
  const match = sourceModelId.match(BASE_MODEL_ID_PATTERN);
  if (!match) return { error: "Base card id required." };

  const [, collectionSlug, slug] = match;
  const now = new Date();
  return {
    value: {
      source_model_id: sourceModelId,
      collection_slug: collectionSlug,
      slug,
      deleted: true,
      updated_by: admin.email,
      updated_at: now,
    },
    insert: {
      created_by: admin.email,
      created_at: now,
    },
  };
}
