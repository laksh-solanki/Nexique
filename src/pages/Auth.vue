<template>
  <main
    class="min-h-dvh overflow-x-hidden bg-secondary px-3 py-3 text-foreground sm:px-6 sm:py-6 lg:px-8"
  >
    <section
      class="mx-auto grid min-h-[calc(100dvh-1.5rem)] w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card sm:min-h-[calc(100dvh-3rem)] lg:min-h-[680px] lg:max-w-5xl lg:grid-cols-[0.95fr_1.05fr]"
    >
      <aside
        class="hidden bg-primary px-8 py-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Nexique control
          </p>
          <h2 class="font-display mt-5 max-w-sm text-5xl font-semibold leading-[0.95]">
            Private studio operations.
          </h2>
          <p class="mt-5 max-w-xs text-sm leading-6 text-primary-foreground/70">
            A focused admin entry for founders to review orders, card models, and production
            details.
          </p>
        </div>

        <div class="space-y-3">
          <div
            class="flex gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4"
          >
            <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <p class="text-sm font-semibold">Protected admin route</p>
              <p class="mt-1 text-xs leading-5 text-primary-foreground/60">
                Session access redirects securely into the dashboard.
              </p>
            </div>
          </div>
          <div
            class="flex gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4"
          >
            <LogIn class="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <p class="text-sm font-semibold">Founder-only sign in</p>
              <p class="mt-1 text-xs leading-5 text-primary-foreground/60">
                Credentials are checked against the admin API.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex min-h-full min-w-0 flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
        <RouterLink
          to="/"
          class="inline-flex min-h-10 w-fit items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-accent"
        >
          <ArrowLeft class="h-3.5 w-3.5" /> Back to Nexique
        </RouterLink>

        <div class="flex w-full min-w-0 max-w-md flex-1 flex-col justify-center align-middle">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div class="min-w-0">
              <h1
                class="font-display text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl"
              >
                Admin sign in
              </h1>
              <p class="mt-2 max-w-sm break-words text-sm leading-6 text-muted-foreground">
                Private access for Nexique founders and studio operations.
              </p>
            </div>
          </div>

          <form class="mt-8 w-full min-w-0 space-y-5" @submit.prevent="submit">
            <div class="space-y-2">
              <label for="email" class="text-sm font-semibold">Email</label>
              <div class="relative">
                <Mail
                  class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="email"
                  v-model.trim="email"
                  name="email"
                  type="email"
                  required
                  maxlength="255"
                  autocomplete="email"
                  autocapitalize="none"
                  inputmode="email"
                  spellcheck="false"
                  :disabled="busy"
                  class="min-h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 py-3 pl-10 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label for="password" class="text-sm font-semibold">Password</label>
              <div class="relative">
                <LockKeyhole
                  class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="password"
                  v-model="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  maxlength="120"
                  autocomplete="current-password"
                  :disabled="busy"
                  class="min-h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 py-3 pl-10 pr-12 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                />
                <button
                  type="button"
                  class="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
              class="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm leading-5 text-destructive"
            >
              <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
              <p class="min-w-0 break-words">{{ formError }}</p>
            </div>

            <button
              type="submit"
              :disabled="busy"
              class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
              <LogIn v-else class="h-4 w-4" />
              {{ busy ? "Checking..." : "Open admin" }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "@lucide/vue";

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
