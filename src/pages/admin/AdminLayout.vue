<template>
  <div class="min-h-screen bg-secondary/40">
    <header class="border-b border-border bg-card">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <RouterLink to="/" class="inline-flex items-center">
          <BrandLockup compact label="Admin" />
        </RouterLink>
        <nav class="flex flex-wrap items-center justify-end gap-4 text-sm">
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
            to="/admin/models"
            class="inline-flex items-center gap-1.5 transition hover:text-accent"
            active-class="font-semibold text-accent"
          >
            <Plus class="h-4 w-4" /> Catalog
          </RouterLink>
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

    <main class="mx-auto max-w-6xl px-6 py-8">
      <p
        v-if="!isFirebaseConfigured"
        class="mb-6 rounded-xl border border-accent/25 bg-card p-3 text-xs text-muted-foreground"
      >
        Firebase is not configured. Admin data is being saved in local browser storage for this
        development session.
      </p>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Inbox, LayoutDashboard, LogOut, Plus } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import BrandLockup from "@/components/BrandLockup.vue";
import { signOutAdmin } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";

const router = useRouter();
const toast = useToast();

async function handleSignOut() {
  await signOutAdmin();
  toast.info("Signed out.");
  router.push("/");
}
</script>
