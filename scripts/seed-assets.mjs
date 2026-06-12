import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  categoryAssetKey,
  localAssetKey,
  siteAssetKey,
  weddingVariantAssetKey,
} from "../src/lib/catalogAssetKeys.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assetsRoot = path.join(root, "src", "assets");
const imageExtensions = new Set([".jpeg", ".jpg", ".png", ".webp"]);

function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function imageDataUrl(filePath) {
  return `data:${mimeType(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function walkImages(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkImages(filePath);
    if (!entry.isFile() || !imageExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [filePath];
  });
}

function relativeAssetPath(filePath) {
  return path.relative(assetsRoot, filePath).replace(/\\/g, "/");
}

function titleFromFile(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/\s*-\s*/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseWeddingVariant(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  const [rawModelName, rawVariantName] = name.split(/\s*-\s*/);
  if (!rawModelName || !rawVariantName) return null;

  const modelName = rawModelName.trim().replace(/\s+/g, " ");
  const variantName = rawVariantName
    .replace(/\bcards?\b/gi, "")
    .trim()
    .replace(/\s+/g, " ");

  if (!modelName || !variantName) return null;
  return { modelName, variantName };
}

function buildAssetDocs() {
  const localDocs = walkImages(assetsRoot).map((filePath) => {
    const relativePath = relativeAssetPath(filePath);
    const label = titleFromFile(filePath);

    return {
      key: localAssetKey(relativePath),
      kind: "local",
      label,
      alt: `${label} image`,
      file_path: `src/assets/${relativePath}`,
      image_data_url: imageDataUrl(filePath),
    };
  });

  const categoryDocs = [
    ["greeting-cards", "Heartfelt", "cards/greeting-cards.jpg"],
    ["wedding-cards", "Forever", "cards/wedding-cards.jpg"],
    ["business-cards", "Professional", "cards/business-cards.jpg"],
    ["templates", "Editorial", "cards/templates.jpg"],
    ["collection-cards", "Vintage", "cards/collection-cards.jpg"],
    ["playing-cards", "Luxe", "cards/playing-cards.jpg"],
    ["gift-cards", "Gifting", "cards/gift-cards.jpg"],
    ["valentine-special", "Romance", "cards/valentine-special.jpg"],
    ["custom-wish-cards", "Bespoke", "cards/custom-wish-cards.jpg"],
  ].flatMap(([slug, label, relativePath], index) => {
    const filePath = path.join(assetsRoot, relativePath);
    if (!fs.existsSync(filePath)) return [];

    return {
      key: categoryAssetKey(slug),
      kind: "category",
      label,
      alt: `${label} ${slug.replace(/-/g, " ")} image`,
      collection_slug: slug,
      file_path: `src/assets/${relativePath}`,
      sort_order: index,
      image_data_url: imageDataUrl(filePath),
    };
  });

  const siteDocs = [
    ["logo", "Nexique logo", "logo.png"],
    ["hero", "Nexique editorial selection", "cardora-hero.jpg"],
  ].flatMap(([name, label, relativePath]) => {
    const filePath = path.join(assetsRoot, relativePath);
    if (!fs.existsSync(filePath)) return [];

    return {
      key: siteAssetKey(name),
      kind: "site",
      label,
      alt: label,
      file_path: `src/assets/${relativePath}`,
      image_data_url: imageDataUrl(filePath),
    };
  });

  const weddingDocs = walkImages(path.join(assetsRoot, "weddings card")).flatMap((filePath) => {
    const parsed = parseWeddingVariant(filePath);
    if (!parsed) return [];

    return {
      key: weddingVariantAssetKey(parsed.modelName, parsed.variantName),
      kind: "wedding-variant",
      label: `${parsed.modelName} ${parsed.variantName}`,
      alt: `${parsed.modelName} ${parsed.variantName} wedding card design`,
      collection_slug: "wedding-cards",
      model_name: parsed.modelName,
      variant_name: parsed.variantName,
      file_path: `src/assets/${relativeAssetPath(filePath)}`,
      image_data_url: imageDataUrl(filePath),
    };
  });

  const byKey = new Map();
  for (const doc of [...localDocs, ...categoryDocs, ...siteDocs, ...weddingDocs]) {
    byKey.set(doc.key, doc);
  }
  return [...byKey.values()];
}

loadDotEnv();

const { ensureIndexes, getDb } = await import("../api/_lib/mongodb.js");

const db = await getDb();
await ensureIndexes(db);

const docs = buildAssetDocs();
const now = new Date();

for (const doc of docs) {
  await db.collection("catalog_assets").updateOne(
    { key: doc.key },
    {
      $set: {
        ...doc,
        updated_at: now,
      },
      $setOnInsert: {
        created_at: now,
      },
    },
    { upsert: true },
  );
}

const counts = await db
  .collection("catalog_assets")
  .aggregate([{ $group: { _id: "$kind", count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
  .toArray();

console.log(
  JSON.stringify(
    {
      ok: true,
      seeded: docs.length,
      counts: Object.fromEntries(counts.map((item) => [item._id, item.count])),
    },
    null,
    2,
  ),
);
process.exit(0);
