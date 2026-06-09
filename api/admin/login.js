import {
  badRequest,
  handleApiError,
  methodNotAllowed,
  readJson,
  sendJson,
  unauthorized,
} from "../_lib/http.js";
import { authenticateAdmin, publicAdmin } from "../_lib/admin.js";
import { setAdminSession } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const payload = await readJson(req);
    if (!payload.email || !payload.password) {
      return badRequest(res, "Email and password are required.");
    }

    const admin = await authenticateAdmin(payload.email, payload.password);
    if (!admin) return unauthorized(res);

    setAdminSession(res, admin);
    return sendJson(res, 200, { admin: publicAdmin(admin) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
