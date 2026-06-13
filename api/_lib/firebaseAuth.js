/**
 * Resolves a customer profile from the request Authorization header.
 * Decodes Firebase ID tokens or processes development mock tokens.
 * @param {object} req
 * @returns {object|null}
 */
export async function getCustomerFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  // Development simulated token fallback
  if (token.startsWith("mock-uid-") || token.startsWith("mock-token-")) {
    const rawVal = token.replace("mock-token-", "").replace("mock-uid-", "");
    // Extract email from mock-token
    const email = rawVal.includes("@") ? rawVal : `${rawVal}@example.com`;
    return {
      email: email.toLowerCase(),
      uid: "mock-uid-" + email.replace(/[^a-z0-9]/g, ""),
      name: email.split("@")[0].toUpperCase(),
    };
  }

  // Firebase ID Token (JWT RS256) decoding
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Parse the payload segment (2nd segment)
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);

    // Verify token expiration (exp is in seconds since epoch)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn("Expired Firebase token submitted");
      return null;
    }

    return {
      email: String(payload.email || "").toLowerCase(),
      uid: payload.sub, // Firebase Auth user UID is stored in JWT sub claim
      name:
        payload.name ||
        String(payload.email || "")
          .split("@")[0]
          .toUpperCase(),
    };
  } catch (err) {
    console.error("Failed to parse Firebase ID token:", err);
    return null;
  }
}
