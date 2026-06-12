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

loadDotEnv();

const { ensureIndexes, pingMongo } = await import("../api/_lib/mongodb.js");
const { mongoDbName } = await import("../api/_lib/env.js");

const db = await pingMongo();
await ensureIndexes(db);

const [admins, orders, customModels, catalogAssets] = await Promise.all([
  db.collection("admins").countDocuments({ active: true }),
  db.collection("orders").countDocuments(),
  db.collection("custom_card_models").countDocuments(),
  db.collection("catalog_assets").countDocuments(),
]);

console.log(
  JSON.stringify(
    {
      ok: true,
      mongodb: "connected",
      database: mongoDbName(),
      counts: {
        admins,
        orders,
        custom_card_models: customModels,
        catalog_assets: catalogAssets,
      },
    },
    null,
    2,
  ),
);
process.exit(0);
