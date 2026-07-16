import { createVerify } from "node:crypto";

import { firebaseProjectId } from "./env.js";

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const TOKEN_CLOCK_SKEW_SECONDS = 60;

let certificateCache = null;
let certificateCacheExpiresAt = 0;

/**
 * Resolves a verified Firebase customer from the request Authorization header.
 * Development mock tokens remain available only outside production.
 * @param {object} req
 * @returns {Promise<object|null>}
 */
export async function getCustomerFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  if (isDevelopmentEnvironment() && (token.startsWith("mock-uid-") || token.startsWith("mock-token-"))) {
    return mockCustomerFromToken(token);
  }

  try {
    const customer = await verifyFirebaseIdToken(token);
    if (!customer) return null;

    return {
      email: String(customer.email || "").toLowerCase(),
      uid: customer.uid,
      name:
        customer.name ||
        String(customer.email || "")
          .split("@")[0]
          .toUpperCase(),
    };
  } catch (err) {
    console.error("Failed to verify Firebase token:", err);
    return null;
  }
}

async function verifyFirebaseIdToken(token) {
  const projectId = firebaseProjectId();
  if (!projectId) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = decodeJsonSegment(parts[0]);
  const payload = decodeJsonSegment(parts[1]);
  if (!header || !payload || header.alg !== "RS256" || !header.kid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (
    payload.aud !== projectId ||
    payload.iss !== `https://securetoken.google.com/${projectId}` ||
    typeof payload.sub !== "string" ||
    !payload.sub ||
    typeof payload.exp !== "number" ||
    payload.exp <= now - TOKEN_CLOCK_SKEW_SECONDS ||
    (typeof payload.iat === "number" && payload.iat > now + TOKEN_CLOCK_SKEW_SECONDS)
  ) {
    return null;
  }

  const certificates = await getFirebaseCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) return null;

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  if (!verifier.verify(certificate, Buffer.from(parts[2], "base64url"))) return null;

  return {
    email: payload.email || "",
    uid: payload.sub,
    name: payload.name || "",
  };
}

async function getFirebaseCertificates() {
  const now = Date.now();
  if (certificateCache && certificateCacheExpiresAt > now) return certificateCache;

  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Firebase certificate request failed with ${response.status}.`);
  }

  const certificates = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 300);
  certificateCache = certificates;
  certificateCacheExpiresAt = now + Math.max(60, maxAge) * 1000;
  return certificates;
}

function decodeJsonSegment(segment) {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function mockCustomerFromToken(token) {
  const rawVal = token.replace("mock-token-", "").replace("mock-uid-", "");
  const email = rawVal.includes("@") ? rawVal : `${rawVal}@example.com`;
  return {
    email: email.toLowerCase(),
    uid: "mock-uid-" + email.replace(/[^a-z0-9]/g, ""),
    name: email.split("@")[0].toUpperCase(),
  };
}

function isDevelopmentEnvironment() {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1";
}
