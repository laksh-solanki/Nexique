import {
  handleApiError,
  methodNotAllowed,
  sendJson,
  unauthorized,
  readJson,
  badRequest,
} from "../_lib/http.js";
import { requireAdmin } from "../_lib/admin.js";
import { getDb, ensureIndexes } from "../_lib/mongodb.js";
import { logAdminAction } from "../_lib/logs.js";
import fs from "node:fs";
import path from "node:path";
import {
  categoryAssetKey,
  localAssetKey,
  siteAssetKey,
  weddingVariantAssetKey,
} from "../../src/lib/catalogAssetKeys.js";

const imageExtensions = new Set([".jpeg", ".jpg", ".png", ".webp"]);

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

function relativeAssetPath(assetsRoot, filePath) {
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

function buildAssetDocs(assetsRoot) {
  const localDocs = walkImages(assetsRoot).map((filePath) => {
    const relativePath = relativeAssetPath(assetsRoot, filePath);
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
      file_path: `src/assets/${relativeAssetPath(assetsRoot, filePath)}`,
      image_data_url: imageDataUrl(filePath),
    };
  });

  const byKey = new Map();
  for (const doc of [...localDocs, ...categoryDocs, ...siteDocs, ...weddingDocs]) {
    byKey.set(doc.key, doc);
  }
  return [...byKey.values()];
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sourceCatalogModels(root) {
  const dataFilePath = path.join(root, "src", "lib", "collections-data.js");
  if (!fs.existsSync(dataFilePath)) return [];
  const source = fs.readFileSync(dataFilePath, "utf8");
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

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized(res);

    const payload = await readJson(req);
    const action = payload.action;
    const db = await getDb();
    await ensureIndexes(db);

    const root = process.cwd();
    const assetsRoot = path.join(root, "src", "assets");

    if (action === "seed_assets") {
      const docs = buildAssetDocs(assetsRoot);
      const now = new Date();

      for (const doc of docs) {
        await db.collection("catalog_assets").updateOne(
          { key: doc.key },
          {
            $set: { ...doc, updated_at: now },
            $setOnInsert: { created_at: now },
          },
          { upsert: true },
        );
      }

      await logAdminAction(admin.email, "seed_assets", { count: docs.length });
      return sendJson(res, 200, {
        ok: true,
        message: `Successfully seeded ${docs.length} assets.`,
      });
    }

    if (action === "clear_cards") {
      const sourceModels = sourceCatalogModels(root);
      const now = new Date();

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
                  updated_by: `admin:${admin.email}`,
                  updated_at: now,
                },
                $setOnInsert: {
                  created_by: `admin:${admin.email}`,
                  created_at: now,
                },
              },
              upsert: true,
            },
          })),
        );
      }

      await logAdminAction(admin.email, "clear_cards", {
        custom_cards_deleted: customDelete.deletedCount,
      });
      return sendJson(res, 200, {
        ok: true,
        message: `Cleared custom catalog cards. Deleted ${customDelete.deletedCount} custom models. Reset base models.`,
      });
    }

    if (action === "seed_demo_orders") {
      const demoOrders = [
        {
          customer_name: "John Doe",
          customer_email: "john.doe@example.com",
          customer_phone: "+1 (555) 019-2834",
          quantity: 150,
          message:
            "Please print using textured matte cardstock. Wording: 'Save the Date - October 15, 2026'.",
          collection_slug: "wedding-cards",
          collection_name: "Forever",
          model_slug: "luxe-gold-border",
          model_name: "Luxe Gold Border",
          design_variant: "Warm Cream",
          status: "new",
          priority: "rush",
          deadline: "2026-07-01",
          admin_note: "Initial rush review. Customer wants a custom monogram.",
          created_at: new Date(Date.now() - 3600000 * 2),
          updated_at: new Date(Date.now() - 3600000 * 2),
        },
        {
          customer_name: "Sarah Jenkins",
          customer_email: "sarah.j@example.com",
          customer_phone: "+1 (555) 014-9988",
          quantity: 50,
          message: "Thank you cards for our business partners. Standard delivery.",
          collection_slug: "business-cards",
          collection_name: "Professional",
          model_slug: "minimal-monochrome",
          model_name: "Minimal Monochrome",
          design_variant: "Classic Black",
          status: "proofing",
          priority: "normal",
          deadline: "2026-08-15",
          admin_note: "Draft sent for approval on June 10th.",
          created_at: new Date(Date.now() - 86400000 * 3),
          updated_at: new Date(Date.now() - 86400000 * 2),
        },
        {
          customer_name: "Michael Chang",
          customer_email: "m.chang@example.com",
          customer_phone: "",
          quantity: 200,
          message: "Birthday invitations for a golden jubilee celebration.",
          collection_slug: "greeting-cards",
          collection_name: "Heartfelt",
          model_slug: "golden-stars",
          model_name: "Golden Stars Sparkle",
          design_variant: "Midnight Navy",
          status: "in_production",
          priority: "normal",
          deadline: "2026-06-25",
          admin_note: "Approved by client. Currently at printing press.",
          created_at: new Date(Date.now() - 86400000 * 5),
          updated_at: new Date(Date.now() - 86400000 * 1),
        },
        {
          customer_name: "Emily Rodriguez",
          customer_email: "emily.rod@example.com",
          customer_phone: "+1 (555) 012-3456",
          quantity: 100,
          message: "Valentine greeting cards - Special custom order.",
          collection_slug: "valentine-special",
          collection_name: "Romance",
          model_slug: "crimson-velvet",
          model_name: "Crimson Velvet Love",
          design_variant: "Velvet Crimson",
          status: "new",
          priority: "normal",
          deadline: "",
          admin_note: "",
          created_at: new Date(Date.now() - 1800000),
          updated_at: new Date(Date.now() - 1800000),
        },
        {
          customer_name: "David Smith",
          customer_email: "dsmith@example.com",
          customer_phone: "+1 (555) 987-6543",
          quantity: 80,
          message: "Holiday greeting cards.",
          collection_slug: "greeting-cards",
          collection_name: "Heartfelt",
          model_slug: "winter-wonderland",
          model_name: "Winter Wonderland",
          design_variant: "Forest Green",
          status: "completed",
          priority: "normal",
          deadline: "2026-06-10",
          admin_note: "Delivered and paid.",
          created_at: new Date(Date.now() - 86400000 * 12),
          updated_at: new Date(Date.now() - 86400000 * 8),
        },
      ];

      const insertResult = await db.collection("orders").insertMany(demoOrders);
      await logAdminAction(admin.email, "seed_demo_orders", { count: demoOrders.length });
      return sendJson(res, 200, {
        ok: true,
        message: `Successfully seeded ${insertResult.insertedCount} demo orders.`,
      });
    }

    if (action === "clear_orders") {
      const deleteResult = await db.collection("orders").deleteMany({});
      await logAdminAction(admin.email, "clear_orders", { count: deleteResult.deletedCount });
      return sendJson(res, 200, {
        ok: true,
        message: `Successfully cleared all orders. Deleted ${deleteResult.deletedCount} orders.`,
      });
    }

    return badRequest(res, `Unknown action: ${action}`);
  } catch (err) {
    return handleApiError(res, err);
  }
}
