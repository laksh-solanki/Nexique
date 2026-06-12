export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
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

export function assertSameOrigin(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;

  const origin = String(req.headers.origin || "").trim();
  if (!origin) return;

  const forwardedHost = String(req.headers["x-forwarded-host"] || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  const host = forwardedHost || String(req.headers.host || "").trim();
  if (!host) return;

  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = "";
  }

  if (originHost && originHost === host) return;

  const err = new Error("Request origin is not allowed.");
  err.statusCode = 403;
  err.publicMessage = "Request origin is not allowed.";
  throw err;
}

export async function readJson(req, options = {}) {
  const maxBytes = options.maxBytes || 1_250_000;
  if (req.body && typeof req.body === "object") {
    if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > maxBytes) {
      return jsonTooLarge();
    }
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    if (Buffer.byteLength(req.body, "utf8") > maxBytes) {
      return jsonTooLarge();
    }
    return parseJson(req.body);
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > maxBytes) return jsonTooLarge();
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return parseJson(raw);
}

export function handleApiError(res, err) {
  console.error(err);
  const invalidJson =
    err instanceof SyntaxError ||
    (err.statusCode === 400 && /json|body|parse/i.test(String(err.message || "")));
  const statusCode = err.statusCode || (invalidJson ? 400 : 500);
  sendJson(res, statusCode, {
    error:
      err.publicMessage ||
      (invalidJson ? "Invalid JSON request body." : "Server error. Please try again."),
  });
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error("Invalid JSON.");
    err.statusCode = 400;
    err.publicMessage = "Invalid JSON request body.";
    throw err;
  }
}

function jsonTooLarge() {
  const err = new Error("Request body too large.");
  err.statusCode = 413;
  err.publicMessage = "Request body is too large.";
  throw err;
}
