import {
  assertSameOrigin,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../_lib/http.js";
import { getDb } from "../_lib/mongodb.js";
import { getCustomerFromRequest } from "../_lib/firebaseAuth.js";
import { logAdminAction } from "../_lib/logs.js";

export default async function handler(req, res) {
  if (!["GET", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["GET", "PATCH"]);

  try {
    assertSameOrigin(req);
    const customer = await getCustomerFromRequest(req);
    if (!customer) return unauthorized(res);

    const db = await getDb();

    if (req.method === "GET") {
      const profile = await db.collection("customer_profiles").findOne({
        $or: [{ customer_email: customer.email }, { customer_uid: customer.uid }],
      });

      if (!profile) {
        // Return default empty profile matching structure
        return sendJson(res, 200, {
          data: {
            customer_email: customer.email,
            customer_uid: customer.uid,
            phone: "",
            billing: null,
            preferences: {
              newsletter: false,
              accentColor: "default",
              avatarColor: "accent",
            },
          },
        });
      }

      return sendJson(res, 200, { data: profile });
    }

    if (req.method === "PATCH") {
      const payload = await readJson(req);

      const phone = String(payload.phone || "")
        .trim()
        .slice(0, 30);

      let billing = null;
      if (payload.billing && typeof payload.billing === "object") {
        billing = {
          cardholderName: String(payload.billing.cardholderName || "")
            .trim()
            .slice(0, 100),
          street: String(payload.billing.street || "")
            .trim()
            .slice(0, 200),
          city: String(payload.billing.city || "")
            .trim()
            .slice(0, 100),
          state: String(payload.billing.state || "")
            .trim()
            .slice(0, 100),
          zip: String(payload.billing.zip || "")
            .trim()
            .slice(0, 20),
          country: String(payload.billing.country || "")
            .trim()
            .slice(0, 100),
        };
      }

      let preferences = {
        newsletter: false,
        accentColor: "default",
        avatarColor: "accent",
      };
      if (payload.preferences && typeof payload.preferences === "object") {
        preferences = {
          newsletter: !!payload.preferences.newsletter,
          accentColor: String(payload.preferences.accentColor || "default")
            .trim()
            .slice(0, 20),
          avatarColor: String(payload.preferences.avatarColor || "accent")
            .trim()
            .slice(0, 20),
        };
      }

      const now = new Date();
      await db.collection("customer_profiles").updateOne(
        {
          $or: [{ customer_uid: customer.uid }, { customer_email: customer.email }],
        },
        {
          $set: {
            customer_uid: customer.uid,
            customer_email: customer.email,
            phone,
            billing,
            preferences,
            updated_at: now,
          },
          $setOnInsert: {
            created_at: now,
          },
        },
        { upsert: true },
      );

      const updatedProfile = await db.collection("customer_profiles").findOne({
        customer_uid: customer.uid,
      });

      await logAdminAction(`customer:${customer.email}`, "update_profile", { uid: customer.uid });

      return sendJson(res, 200, { data: updatedProfile });
    }
  } catch (err) {
    return handleApiError(res, err);
  }
}
