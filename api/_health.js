import { handleApiError, methodNotAllowed, sendJson } from "./_lib/http.js";
import { pingMongo } from "./_lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    await pingMongo();
    return sendJson(res, 200, { ok: true, mongodb: "connected" });
  } catch (err) {
    return handleApiError(res, err);
  }
}
