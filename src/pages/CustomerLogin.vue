<template>
  <div class="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div
      class="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <div class="text-center">
        <RouterLink to="/" class="inline-flex justify-center mb-4">
          <BrandLockup />
        </RouterLink>
        <h2 class="font-display text-3xl font-bold tracking-tight text-primary mt-2">
          {{ isSignUp ? "Create your account" : "Sign in to Nexique" }}
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          {{
            isSignUp
              ? "Join our studio to order premium cards and track status"
              : "Access your bespoke order workspace"
          }}
        </p>
      </div>

      <!-- Mode Toggle Buttons -->
      <div class="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
        <button
          type="button"
          class="rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-all"
          :class="
            !isSignUp
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-primary'
          "
          @click="isSignUp = false"
        >
          Sign In
        </button>
        <button
          type="button"
          class="rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-all"
          :class="
            isSignUp ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'
          "
          @click="isSignUp = true"
        >
          Register
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Name Field (Only for Signup) -->
        <div v-if="isSignUp" class="space-y-1.5">
          <label
            for="reg-name"
            class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >Name</label
          >
          <input
            id="reg-name"
            v-model.trim="form.name"
            type="text"
            required
            maxlength="80"
            placeholder="John Doe"
            autocomplete="name"
            class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <!-- Email Field -->
        <div class="space-y-1.5">
          <label
            for="auth-email"
            class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >Email address</label
          >
          <input
            id="auth-email"
            v-model.trim="form.email"
            type="email"
            required
            placeholder="you@example.com"
            autocomplete="email"
            class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5">
          <label
            for="auth-password"
            class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >Password</label
          >
          <input
            id="auth-password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
            :autocomplete="isSignUp ? 'new-password' : 'current-password'"
            class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="click-pop ripple flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-60"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <span v-else>{{ isSignUp ? "Create account" : "Sign in" }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Loader2 } from "@lucide/vue";

import { signIn, signUp } from "@/lib/firebase";
import { useToast } from "@/composables/useToast";
import BrandLockup from "@/components/BrandLockup.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isSignUp = ref(false);
const loading = ref(false);
const form = reactive({
  name: "",
  email: "",
  password: "",
});

async function handleSubmit() {
  if (!form.email || !form.password) {
    toast.error("Email and password are required.");
    return;
  }
  if (isSignUp.value && !form.name) {
    toast.error("Please provide your name.");
    return;
  }

  loading.value = true;
  try {
    if (isSignUp.value) {
      await signUp(form.email, form.password, form.name);
      toast.success("Account registered! Welcome to Nexique.");
    } else {
      await signIn(form.email, form.password);
      toast.success("Welcome back!");
    }

    const redirectPath = route.query.redirect || "/profile";
    router.push(redirectPath);
  } catch (err) {
    console.error(err);
    let errorMsg = err.message || "Authentication failed.";
    if (err.code === "auth/email-already-in-use") {
      errorMsg = "This email is already in use.";
    } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
      errorMsg = "Invalid email or password.";
    } else if (err.code === "auth/weak-password") {
      errorMsg = "Password must be at least 6 characters.";
    }
    toast.error(errorMsg);
  } finally {
    loading.value = false;
  }
}
</script>
