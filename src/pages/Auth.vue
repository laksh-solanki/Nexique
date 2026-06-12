<template>
  <div class="flex min-h-screen items-center justify-center bg-secondary px-4 py-8 sm:px-6">
    <div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <RouterLink
        to="/"
        class="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent"
      >
        <ArrowLeft class="h-3.5 w-3.5" /> Back to Nexique
      </RouterLink>

      <div class="flex items-start gap-3">
        <BrandLockup compact />
        <div>
          <h1 class="font-display text-3xl font-bold tracking-tight">Admin sign in</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Private access for Nexique founders and studio operations.
          </p>
        </div>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div class="space-y-1.5">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            id="email"
            v-model.trim="email"
            name="email"
            type="email"
            required
            maxlength="255"
            autocomplete="email"
            :disabled="busy"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Password</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              required
              maxlength="120"
              autocomplete="current-password"
              :disabled="busy"
              class="w-full rounded-md border border-input bg-background px-3 py-2 pr-11 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              class="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="busy"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :title="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          v-if="formError"
          class="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          <p>{{ formError }}</p>
        </div>

        <button
          type="submit"
          :disabled="busy"
          class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
          <LogIn v-else class="h-4 w-4" />
          {{ busy ? "Checking..." : "Open admin" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "@lucide/vue";

import BrandLockup from "@/components/BrandLockup.vue";
import { useToast } from "@/composables/useToast";
import { signInAdmin, watchAuth } from "@/lib/auth";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const busy = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const formError = ref("");
let stopWatching = () => {};

onMounted(() => {
  stopWatching = watchAuth((admin) => {
    if (!admin) return;
    router.replace(safeAdminRedirect(route.query.redirect));
  });
});

onBeforeUnmount(() => stopWatching());

async function submit() {
  formError.value = "";
  busy.value = true;
  try {
    await signInAdmin(email.value, password.value);
    toast.success("Signed in.");
    router.replace(safeAdminRedirect(route.query.redirect));
  } catch (err) {
    console.error(err);
    formError.value = err.message || "Authentication failed.";
  } finally {
    busy.value = false;
  }
}

function safeAdminRedirect(redirect) {
  const target = Array.isArray(redirect) ? redirect[0] : redirect;
  if (typeof target === "string" && target.startsWith("/admin")) return target;
  return "/admin/dashboard";
}
</script>
