export async function apiRequest(path, options = {}) {
  const headers = options.body ? { "Content-Type": "application/json" } : {};
  const response = await fetch(path, {
    method: options.method || "GET",
    credentials: "include",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => ({})) : {};
  if (!response.ok) {
    const apiUnavailable = path.startsWith("/api/") && !isJson;
    throw new Error(
      payload.error ||
        (apiUnavailable
          ? "Admin API is not available on this server. Open the Vercel dev URL."
          : "Request failed. Please try again."),
    );
  }

  return payload;
}
