const IMAGE_MAX_LENGTH = 900_000;

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

function cleanImageDataUrl(value) {
  const image = text(value, IMAGE_MAX_LENGTH + 100);
  if (!image) return "";
  if (image.length > IMAGE_MAX_LENGTH) {
    return { error: "Image is too large. Upload a smaller image." };
  }
  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(image)) {
    return { error: "Image must be PNG, JPG, JPEG, or WEBP." };
  }
  return image;
}

export function modelResponse(model) {
  return {
    id: String(model._id || model.id),
    collection_slug: model.collection_slug,
    name: model.name,
    slug: model.slug,
    tag: model.tag,
    tint: model.tint || "from-rose-200 to-amber-100",
    image_data_url: model.image_data_url || "",
    image_alt: model.image_alt || "",
    created_at: model.created_at?.toISOString?.() || model.created_at,
    updated_at: model.updated_at?.toISOString?.() || model.updated_at || "",
  };
}

function validateCustomModelInput(payload) {
  const collectionSlug = text(payload.collection_slug, 100);
  const name = text(payload.name, 100);
  const tag = text(payload.tag, 40);
  const tint = text(payload.tint, 120) || "from-rose-200 to-amber-100";
  const imageData = cleanImageDataUrl(payload.image_data_url);

  if (!collectionSlug) return { error: "Collection required." };
  if (!name) return { error: "Card name required." };
  if (!tag) return { error: "Tag required." };
  if (imageData?.error) return imageData;

  return {
    value: {
      collection_slug: collectionSlug,
      name,
      slug: slugify(name),
      tag,
      tint,
      image_data_url: imageData,
      image_alt: imageData ? `${name} card preview` : "",
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
