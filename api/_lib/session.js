import { createHmac, timingSafeEqual } from "node:crypto";

import { assertSessionEnv, sessionSecret } from "./env.js";

const COOKIE_NAME = "nexique_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  assertSessionEnv();
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function parseCookies(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf("=");
      if (separator === -1) return cookies;
      cookies[decodeURIComponent(part.slice(0, separator))] = decodeURIComponent(
        part.slice(separator + 1),
      );
      return cookies;
    }, {});
}

function cookieOptions(maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setAdminSession(res, admin) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email: admin.email,
    name: admin.name,
    role: admin.role,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(`${encoded}.${signature}`)}; ${cookieOptions(
      SESSION_MAX_AGE_SECONDS,
    )}`,
  );
}

export function clearAdminSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieOptions(0)}`);
}

export function readAdminSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
