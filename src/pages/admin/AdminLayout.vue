<template>
  <div class="min-h-screen bg-secondary/40">
    <header class="border-b border-border bg-card">
      <div
        class="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between"
      >
        <RouterLink to="/" class="inline-flex min-w-0 items-center">
          <BrandLockup compact label="Admin" />
        </RouterLink>
        <nav
          class="flex w-full flex-wrap items-center gap-x-4 gap-y-3 text-sm md:w-auto md:justify-end"
        >
          <RouterLink
            to="/admin/dashboard"
            class="inline-flex items-center gap-1.5 transition hover:text-accent"
            active-class="font-semibold text-accent"
          >
            <LayoutDashboard class="h-4 w-4" /> Dashboard
          </RouterLink>
          <RouterLink
            to="/admin/orders"
            class="inline-flex items-center gap-1.5 transition hover:text-accent"
            active-class="font-semibold text-accent"
          >
            <Inbox class="h-4 w-4" /> Orders
          </RouterLink>
          <RouterLink
            to="/admin/customers"
            class="inline-flex items-center gap-1.5 transition hover:text-accent"
            active-class="font-semibold text-accent"
          >
            <Users class="h-4 w-4" /> Customers
          </RouterLink>
          <RouterLink
            to="/admin/models"
            class="inline-flex items-center gap-1.5 transition hover:text-accent"
            active-class="font-semibold text-accent"
          >
            <Plus class="h-4 w-4" /> Catalog
          </RouterLink>
          <RouterLink
            to="/admin/developer"
            class="inline-flex items-center gap-1.5 transition hover:text-accent"
            active-class="font-semibold text-accent"
          >
            <Terminal class="h-4 w-4" /> Dev Tools
          </RouterLink>
          <span
            v-if="admin"
            class="inline-flex max-w-full items-center truncate rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
            :title="`${admin.name} - ${admin.email}`"
          >
            {{ admin.name }} &middot; {{ admin.role }}
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-destructive"
            @click="handleSignOut"
          >
            <LogOut class="h-4 w-4" /> Sign out
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Inbox, LayoutDashboard, LogOut, Plus, Terminal, Users } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import BrandLockup from "@/components/BrandLockup.vue";
import { getCurrentAdminUser, signOutAdmin } from "@/lib/auth";

const router = useRouter();
const toast = useToast();
const admin = ref(null);

onMounted(async () => {
  const user = await getCurrentAdminUser();
  admin.value = user;
});

async function handleSignOut() {
  await signOutAdmin();
  toast.info("Signed out.");
  router.push({ name: "auth" });
}
</script>
