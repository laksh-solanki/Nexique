<template>
  <div class="min-h-screen bg-secondary/40">
    <header class="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="flex min-h-16 items-center justify-between gap-3 py-3">
          <RouterLink to="/" class="inline-flex min-w-0 items-center" @click="closeMobileNav">
            <BrandLockup compact label="Admin" />
          </RouterLink>

          <nav
            class="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex"
            aria-label="Admin navigation"
          >
            <RouterLink
              v-for="item in adminNavItems"
              :key="item.to"
              :to="item.to"
              class="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-accent"
              active-class="bg-accent/10 text-accent"
            >
              <component :is="item.icon" class="h-4 w-4" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </nav>

          <div class="flex items-center gap-2">
            <span
              v-if="admin"
              class="hidden max-w-48 items-center gap-2 truncate rounded-full bg-secondary px-3 py-2 text-xs text-muted-foreground lg:inline-flex"
              :title="`${admin.name} - ${admin.email}`"
            >
              <UserRound class="h-4 w-4 shrink-0 text-accent" />
              <span class="truncate">{{ admin.name }} &middot; {{ admin.role }}</span>
            </span>
            <button
              type="button"
              class="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive md:inline-flex"
              @click="handleSignOut"
            >
              <LogOut class="h-4 w-4" /> Sign out
            </button>
            <button
              type="button"
              class="click-pop inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm transition hover:border-accent/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/25 md:hidden"
              :aria-label="mobileNavOpen ? 'Close admin navigation' : 'Open admin navigation'"
              :aria-expanded="mobileNavOpen"
              aria-controls="admin-mobile-navigation"
              @click="toggleMobileNav"
            >
              <X v-if="mobileNavOpen" class="h-5 w-5" />
              <Menu v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="-translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 opacity-0"
        >
          <div
            v-if="mobileNavOpen"
            id="admin-mobile-navigation"
            class="border-t border-border md:hidden"
          >
            <nav class="grid gap-2 py-3" aria-label="Admin mobile navigation">
              <RouterLink
                v-for="item in adminNavItems"
                :key="item.to"
                :to="item.to"
                class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-accent"
                active-class="bg-accent/10 text-accent"
                @click="closeMobileNav"
              >
                <component :is="item.icon" class="h-4 w-4" />
                <span>{{ item.label }}</span>
              </RouterLink>

              <div class="mt-2 rounded-xl border border-border bg-background p-3">
                <div v-if="admin" class="mb-3 flex min-w-0 items-center gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
                  >
                    <UserRound class="h-5 w-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-primary">{{ admin.name }}</p>
                    <p class="truncate text-xs text-muted-foreground">{{ admin.role }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-semibold text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  @click="handleSignOut"
                >
                  <LogOut class="h-4 w-4" /> Sign out
                </button>
              </div>
            </nav>
          </div>
        </Transition>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Terminal,
  UserRound,
  Users,
  X,
} from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import BrandLockup from "@/components/BrandLockup.vue";
import { getCurrentAdminUser, signOutAdmin } from "@/lib/auth";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const admin = ref(null);
const mobileNavOpen = ref(false);

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: Inbox },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/models", label: "Catalog", icon: Plus },
  { to: "/admin/developer", label: "Dev Tools", icon: Terminal },
];

onMounted(async () => {
  const user = await getCurrentAdminUser();
  admin.value = user;
});

async function handleSignOut() {
  closeMobileNav();
  await signOutAdmin();
  toast.info("Signed out.");
  router.push({ name: "auth" });
}

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value;
}

function closeMobileNav() {
  mobileNavOpen.value = false;
}

watch(
  () => route.fullPath,
  () => closeMobileNav(),
);
</script>
