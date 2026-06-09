import { createRouter, createWebHistory } from "vue-router";

import { getCurrentAdminUser } from "@/lib/auth";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/Home.vue"),
    meta: {
      title: "Nexique - A Professional Card Studio",
      description:
        "Nexique is a professional studio designing greeting, wedding, business, playing, valentine and collection cards with editorial precision.",
    },
  },
  {
    path: "/collections",
    name: "collections",
    component: () => import("@/pages/CollectionsIndex.vue"),
    meta: {
      title: "Choose a Card - Nexique",
      description: "Browse every Nexique collection.",
    },
  },
  {
    path: "/collections/:slug",
    name: "collection",
    component: () => import("@/pages/CollectionPage.vue"),
  },
  {
    path: "/collections/:slug/:modelSlug",
    name: "model",
    component: () => import("@/pages/ModelPage.vue"),
  },
  {
    path: "/vision",
    name: "vision",
    component: () => import("@/pages/Vision.vue"),
    meta: {
      title: "Our Vision - Nexique",
      description: "The vision, mission and values that drive Nexique.",
    },
  },
  {
    path: "/nexique-control",
    name: "auth",
    component: () => import("@/pages/Auth.vue"),
    meta: {
      title: "Admin - Nexique",
      description: "Nexique admin sign in.",
    },
  },
  {
    path: "/auth",
    redirect: "/",
  },
  {
    path: "/admin",
    component: () => import("@/pages/admin/AdminLayout.vue"),
    meta: { requiresAuth: true, title: "Admin - Nexique" },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/pages/admin/AdminDashboard.vue"),
        meta: { requiresAuth: true, title: "Dashboard - Nexique Admin" },
      },
      {
        path: "orders",
        name: "admin-orders",
        component: () => import("@/pages/admin/AdminOrders.vue"),
        meta: { requiresAuth: true, title: "Orders - Nexique Admin" },
      },
      {
        path: "models",
        name: "admin-models",
        component: () => import("@/pages/admin/AdminModels.vue"),
        meta: { requiresAuth: true, title: "Catalog - Nexique Admin" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFound.vue"),
    meta: { title: "Page not found - Nexique" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

function adminRedirectTarget(redirect) {
  const target = Array.isArray(redirect) ? redirect[0] : redirect;
  if (typeof target === "string" && target.startsWith("/admin")) return target;
  return "/admin/dashboard";
}

router.beforeEach(async (to) => {
  if (to.name === "auth") {
    const user = await getCurrentAdminUser();
    if (user) return adminRedirectTarget(to.query.redirect);
  }

  if (!to.meta.requiresAuth) return true;
  const user = await getCurrentAdminUser();
  if (user) return true;
  return { name: "auth", query: { redirect: to.fullPath } };
});

router.afterEach((to) => {
  document.title = to.meta.title || "Nexique";
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && to.meta.description) {
    metaDescription.setAttribute("content", to.meta.description);
  }
});

export default router;
