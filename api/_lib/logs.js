import { getDb } from "./mongodb.js";

/**
 * Logs an administrative action into the database.
 * @param {string} adminEmail
 * @param {string} action
 * @param {object} details
 */
export async function logAdminAction(adminEmail, action, details = {}) {
  try {
    const db = await getDb();
    await db.collection("admin_logs").insertOne({
      admin_email: adminEmail,
      action,
      details,
      created_at: new Date(),
    });
  } catch (err) {
    console.error("Failed to record admin log:", err);
  }
}
