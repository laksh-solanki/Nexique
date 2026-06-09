import { apiRequest } from "@/lib/apiClient";

export async function getCurrentUser() {
  return getCurrentAdminUser();
}

export async function getCurrentAdminUser() {
  try {
    const payload = await apiRequest("/api/admin/session");
    return payload.admin || null;
  } catch {
    return null;
  }
}

export function watchAuth(callback) {
  let active = true;
  getCurrentAdminUser().then((admin) => {
    if (active) callback(admin);
  });
  return () => {
    active = false;
  };
}

export async function signInAdmin(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const payload = await apiRequest("/api/admin/login", {
    method: "POST",
    body: { email, password },
  });
  return payload.admin;
}

export async function signOutAdmin() {
  await apiRequest("/api/admin/logout", { method: "POST" }).catch(() => {});
}
