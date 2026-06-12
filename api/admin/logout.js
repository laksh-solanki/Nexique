import { assertSameOrigin, handleApiError, methodNotAllowed, sendJson } from "../_lib/http.js";
import { clearAdminSession } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    assertSameOrigin(req);
    clearAdminSession(res);
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    return handleApiError(res, err);
  }
}
