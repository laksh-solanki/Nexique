import bcrypt from "bcryptjs";

import { getDb } from "./mongodb.js";
import { readAdminSession } from "./session.js";

export function publicAdmin(admin) {
  if (!admin) return null;
  return {
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

export async function authenticateAdmin(email, password) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail || !password) return null;

  const db = await getDb();
  const admin = await db.collection("admins").findOne({ email: normalizedEmail, active: true });
  if (!admin) return null;

  const ok = await bcrypt.compare(password, admin.password_hash);
  return ok ? admin : null;
}

export async function requireAdmin(req) {
  const session = readAdminSession(req);
  if (!session?.email) return null;

  const db = await getDb();
  return db.collection("admins").findOne({ email: session.email, active: true });
}
