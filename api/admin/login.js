import {
  badRequest,
  assertSameOrigin,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../_lib/http.js";
import { authenticateAdmin, publicAdmin } from "../_lib/admin.js";
import { getDb } from "../_lib/mongodb.js";
import {
  assertLoginAllowed,
  clearLoginFailures,
  rateLimitKey,
  recordLoginFailure,
} from "../_lib/rateLimit.js";
import { setAdminSession } from "../_lib/session.js";
import { logAdminAction } from "../_lib/logs.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    assertSameOrigin(req);
    const payload = await readJson(req);
    if (!payload.email || !payload.password) {
      return badRequest(res, "Email and password are required.");
    }

    const db = await getDb();
    const normalizedEmail = String(payload.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 255);
    const loginKey = rateLimitKey("admin-login", req, normalizedEmail);
    await assertLoginAllowed(db, loginKey);

    const admin = await authenticateAdmin(payload.email, payload.password);
    if (!admin) {
      await recordLoginFailure(db, loginKey);
      return unauthorized(res);
    }

    await clearLoginFailures(db, loginKey);
    setAdminSession(res, admin);

    // Log admin login action
    await logAdminAction(admin.email, "login", {
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local",
    });

    return sendJson(res, 200, { admin: publicAdmin(admin) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
