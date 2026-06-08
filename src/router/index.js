import { createRouter, createWebHistory } from "vue-router";

import { getCurrentUser } from "@/lib/auth";

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
    path: "/auth",
    name: "auth",
    component: () => import("@/pages/Auth.vue"),
    meta: {
      title: "Admin - Nexique",
      description: "Nexique admin sign in.",
    },
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

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  const user = await getCurrentUser();
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
