import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sourceCatalogModels() {
  const source = fs.readFileSync(path.join(root, "src", "lib", "collections-data.js"), "utf8");
  const collectionPattern =
    /(?:["']([a-z0-9-]+)["']|([a-z][a-z0-9-]*)):\s*\{[\s\S]*?models:\s*\[([\s\S]*?)\]\s*,\s*\}/g;
  const modelPattern = /model\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,/g;
  const models = [];

  for (const collectionMatch of source.matchAll(collectionPattern)) {
    const collectionSlug = collectionMatch[1] || collectionMatch[2];
    const modelBlock = collectionMatch[3];
    for (const modelMatch of modelBlock.matchAll(modelPattern)) {
      const [, name, tag] = modelMatch;
      const slug = slugify(name);
      models.push({
        source_model_id: `base:${collectionSlug}:${slug}`,
        collection_slug: collectionSlug,
        slug,
        name,
        tag,
      });
    }
  }

  return models;
}

loadDotEnv();

const { ensureIndexes, pingMongo } = await import("../api/_lib/mongodb.js");
const { mongoDbName } = await import("../api/_lib/env.js");

const db = await pingMongo();
await ensureIndexes(db);

const sourceModels = sourceCatalogModels();
const now = new Date();
const [customBefore, overrideBefore] = await Promise.all([
  db.collection("custom_card_models").countDocuments(),
  db.collection("catalog_model_overrides").countDocuments(),
]);

const customDelete = await db.collection("custom_card_models").deleteMany({});

if (sourceModels.length) {
  await db.collection("catalog_model_overrides").bulkWrite(
    sourceModels.map((model) => ({
      updateOne: {
        filter: { source_model_id: model.source_model_id },
        update: {
          $set: {
            ...model,
            deleted: true,
            updated_by: "maintenance:clear-cards",
            updated_at: now,
          },
          $setOnInsert: {
            created_by: "maintenance:clear-cards",
            created_at: now,
          },
        },
        upsert: true,
      },
    })),
  );
}

const [customAfter, deletedBaseAfter, overrideAfter] = await Promise.all([
  db.collection("custom_card_models").countDocuments(),
  db.collection("catalog_model_overrides").countDocuments({ deleted: true }),
  db.collection("catalog_model_overrides").countDocuments(),
]);

console.log(
  JSON.stringify(
    {
      ok: true,
      database: mongoDbName(),
      source_catalog_models: sourceModels.length,
      custom_cards_deleted: customDelete.deletedCount,
      counts: {
        custom_card_models_before: customBefore,
        custom_card_models_after: customAfter,
        catalog_model_overrides_before: overrideBefore,
        catalog_model_overrides_after: overrideAfter,
        deleted_base_cards_after: deletedBaseAfter,
      },
    },
    null,
    2,
  ),
);

process.exit(0);
