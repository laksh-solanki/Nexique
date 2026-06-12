import { createHash } from "node:crypto";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 8;
const ORDER_WINDOW_MS = 10 * 60 * 1000;
const ORDER_LOCK_MS = 30 * 60 * 1000;
const ORDER_MAX_REQUESTS = 5;

function tooManyRequests(message) {
  const err = new Error(message);
  err.statusCode = 429;
  err.publicMessage = message;
  return err;
}

function clientFingerprint(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[0];

  return (
    forwardedFor ||
    String(req.headers["x-real-ip"] || "").trim() ||
    String(req.socket?.remoteAddress || "").trim() ||
    "unknown"
  ).slice(0, 120);
}

export function rateLimitKey(scope, req, subject = "") {
  const hash = createHash("sha256")
    .update(`${scope}|${subject}|${clientFingerprint(req)}`)
    .digest("hex");
  return `${scope}:${hash}`;
}

export async function assertLoginAllowed(db, key) {
  const now = new Date();
  const attempt = await db.collection("admin_login_attempts").findOne({ key });
  if (attempt?.locked_until && attempt.locked_until > now) {
    throw tooManyRequests("Too many sign-in attempts. Try again later.");
  }
}

export async function recordLoginFailure(db, key) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + LOGIN_WINDOW_MS);
  const current = await db.collection("admin_login_attempts").findOne({ key });
  const expired = !current?.reset_at || current.reset_at <= now;
  const failures = expired ? 1 : Number(current.failures || 0) + 1;
  const lockedUntil =
    failures >= LOGIN_MAX_FAILURES ? new Date(now.getTime() + LOGIN_LOCK_MS) : null;

  await db.collection("admin_login_attempts").updateOne(
    { key },
    {
      $set: {
        failures,
        reset_at: expired ? resetAt : current.reset_at,
        locked_until: lockedUntil,
        updated_at: now,
      },
      $setOnInsert: { created_at: now },
    },
    { upsert: true },
  );
}

export async function clearLoginFailures(db, key) {
  await db.collection("admin_login_attempts").deleteOne({ key });
}

export async function consumeOrderLimit(db, key) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + ORDER_WINDOW_MS);
  const current = await db.collection("public_order_attempts").findOne({ key });

  if (current?.locked_until && current.locked_until > now) {
    throw tooManyRequests("Too many order requests. Please try again later.");
  }

  const expired = !current?.reset_at || current.reset_at <= now;
  const requests = expired ? 1 : Number(current.requests || 0) + 1;
  const lockedUntil =
    requests > ORDER_MAX_REQUESTS ? new Date(now.getTime() + ORDER_LOCK_MS) : null;

  await db.collection("public_order_attempts").updateOne(
    { key },
    {
      $set: {
        requests,
        reset_at: expired ? resetAt : current.reset_at,
        locked_until: lockedUntil,
        updated_at: now,
      },
      $setOnInsert: { created_at: now },
    },
    { upsert: true },
  );

  if (lockedUntil) throw tooManyRequests("Too many order requests. Please try again later.");
}
