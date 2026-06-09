import { handleApiError, methodNotAllowed, sendJson } from "../_lib/http.js";
import { publicAdmin, requireAdmin } from "../_lib/admin.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const admin = await requireAdmin(req);
    return sendJson(res, 200, { admin: publicAdmin(admin) });
  } catch (err) {
    return handleApiError(res, err);
  }
}
