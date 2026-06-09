import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcryptjs";

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

const { ensureIndexes, getDb } = await import("../api/_lib/mongodb.js");

const adminSeeds = [
  {
    email: "lakshsolanki848@gmail.com",
    name: "Laksh",
    role: "cofounder",
    passwordEnv: "ADMIN_LAKSH_PASSWORD",
  },
  {
    email: "dwijsolanki777@gmail.com",
    name: "Dwij",
    role: "founder",
    passwordEnv: "ADMIN_DWIJ_PASSWORD",
  },
];

const missing = adminSeeds.filter((admin) => !process.env[admin.passwordEnv]);
if (missing.length > 0) {
  console.error(
    `Missing admin password env vars: ${missing.map((admin) => admin.passwordEnv).join(", ")}`,
  );
  process.exit(1);
}

const db = await getDb();
await ensureIndexes(db);

const now = new Date();
for (const admin of adminSeeds) {
  const passwordHash = await bcrypt.hash(process.env[admin.passwordEnv], 12);
  await db.collection("admins").updateOne(
    { email: admin.email },
    {
      $set: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        password_hash: passwordHash,
        active: true,
        updated_at: now,
      },
      $setOnInsert: {
        created_at: now,
      },
    },
    { upsert: true },
  );
}

const count = await db.collection("admins").countDocuments({ active: true });
console.log(`Seeded ${adminSeeds.length} admins. Active admin count: ${count}.`);
process.exit(0);
