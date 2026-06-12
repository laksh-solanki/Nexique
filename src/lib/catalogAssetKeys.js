export const siteAssetKey = (name) => `site:${slugPart(name)}`;

export const categoryAssetKey = (slug) => `category:${slugPart(slug)}`;

export const localAssetKey = (relativePath) =>
  `local:${String(relativePath || "")
    .replace(/\\/g, "/")
    .split("/")
    .map(slugPart)
    .filter(Boolean)
    .join("/")}`;

export function weddingVariantAssetKey(modelName, variantName) {
  return `wedding:${slugPart(normalizeCardAssetLabel(modelName))}:${slugPart(
    normalizeCardAssetLabel(variantName),
  )}`;
}

export function normalizeCardAssetLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\blvory\b/g, "ivory")
    .replace(/\bcards?\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
