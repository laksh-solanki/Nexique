<template>
  <div class="flex min-h-screen items-center justify-center bg-secondary px-6">
    <div class="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
      <RouterLink
        to="/"
        class="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent"
      >
        <ArrowLeft class="h-3.5 w-3.5" /> Back to CardFesta
      </RouterLink>

      <h1 class="font-display text-3xl font-bold tracking-tight">
        {{ mode === "login" ? "Admin sign in" : "Create admin account" }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        {{
          mode === "login"
            ? "For Dwij, Lax and the studio team."
            : "Create the Firebase admin account."
        }}
      </p>
      <p
        v-if="!isFirebaseConfigured"
        class="mt-3 rounded-xl border border-accent/25 bg-accent/10 p-3 text-xs text-primary"
      >
        Firebase env vars are not set, so local admin mode is active for development.
      </p>

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
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Password</label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            minlength="6"
            maxlength="72"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          :disabled="busy"
          class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
          {{ mode === "login" ? "Sign in" : "Create account" }}
        </button>
      </form>

      <button
        type="button"
        class="mt-4 w-full text-center text-sm text-muted-foreground transition hover:text-accent"
        @click="mode = mode === 'login' ? 'signup' : 'login'"
      >
        {{
          mode === "login"
            ? "First time? Create the admin account ->"
            : "<- Have an account? Sign in"
        }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Loader2 } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { createAdmin, signInAdmin, watchAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const mode = ref("login");
const busy = ref(false);
const email = ref("");
const password = ref("");
let stopWatching = () => {};

onMounted(() => {
  stopWatching = watchAuth((user) => {
    if (!user) return;
    router.replace(String(route.query.redirect || "/admin/orders"));
  });
});

onBeforeUnmount(() => stopWatching());

async function submit() {
  busy.value = true;
  try {
    if (mode.value === "signup") {
      await createAdmin(email.value, password.value);
      toast.success("Account created. You are signed in.");
    } else {
      await signInAdmin(email.value, password.value);
      toast.success("Signed in.");
    }
    router.replace(String(route.query.redirect || "/admin/orders"));
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Authentication failed.");
  } finally {
    busy.value = false;
  }
}
</script>
