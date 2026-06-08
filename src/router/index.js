import { createRouter, createWebHistory } from "vue-router";

import { getCurrentUser } from "@/lib/auth";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/Home.vue"),
    meta: {
      title: "CardFesta - A Professional Card Studio",
      description:
        "CardFesta is a professional studio designing greeting, wedding, business, playing, valentine and collection cards with editorial precision.",
    },
  },
  {
    path: "/collections",
    name: "collections",
    component: () => import("@/pages/CollectionsIndex.vue"),
    meta: {
      title: "Choose a Card - CardFesta",
      description: "Browse every CardFesta collection.",
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
      title: "Our Vision - CardFesta",
      description: "The vision, mission and values that drive CardFesta.",
    },
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("@/pages/Auth.vue"),
    meta: {
      title: "Admin - CardFesta",
      description: "CardFesta admin sign in.",
    },
  },
  {
    path: "/admin",
    component: () => import("@/pages/admin/AdminLayout.vue"),
    meta: { requiresAuth: true, title: "Admin - CardFesta" },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/pages/admin/AdminDashboard.vue"),
        meta: { requiresAuth: true, title: "Dashboard - CardFesta Admin" },
      },
      {
        path: "orders",
        name: "admin-orders",
        component: () => import("@/pages/admin/AdminOrders.vue"),
        meta: { requiresAuth: true, title: "Orders - CardFesta Admin" },
      },
      {
        path: "models",
        name: "admin-models",
        component: () => import("@/pages/admin/AdminModels.vue"),
        meta: { requiresAuth: true, title: "Catalog - CardFesta Admin" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFound.vue"),
    meta: { title: "Page not found - CardFesta" },
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
  document.title = to.meta.title || "CardFesta";
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && to.meta.description) {
    metaDescription.setAttribute("content", to.meta.description);
  }
});

export default router;
