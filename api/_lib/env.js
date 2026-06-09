export function mongoUri() {
  return process.env.MONGODB_URI || "";
}

export function mongoDbName() {
  return process.env.MONGODB_DB_NAME || "";
}

export function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV !== "production") return "nexique-local-dev-session-secret";
  return "";
}

export function assertMongoEnv() {
  if (!mongoUri() || !mongoDbName()) {
    const err = new Error("MongoDB is not configured.");
    err.statusCode = 500;
    err.publicMessage = "MongoDB is not configured on the server.";
    throw err;
  }
}

export function assertSessionEnv() {
  if (!sessionSecret()) {
    const err = new Error("SESSION_SECRET is not configured.");
    err.statusCode = 500;
    err.publicMessage = "Admin session secret is not configured on the server.";
    throw err;
  }
}
