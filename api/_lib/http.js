export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  sendJson(res, 405, { error: "Method not allowed." });
}

export function badRequest(res, message) {
  sendJson(res, 400, { error: message });
}

export function unauthorized(res) {
  sendJson(res, 401, { error: "Admin sign in required." });
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function handleApiError(res, err) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  sendJson(res, statusCode, {
    error: err.publicMessage || "Server error. Please try again.",
  });
}
