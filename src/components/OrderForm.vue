<template>
  <div>
    <!-- Unauthenticated Call to Action -->
    <div
      v-if="!customer"
      class="rounded-xl border border-accent/25 bg-accent/5 p-6 text-center space-y-4 shadow-sm animate-fade-up"
    >
      <Lock class="mx-auto h-8 w-8 text-accent animate-pulse" />
      <h3 class="font-display text-lg font-bold text-primary">Sign In Required</h3>
      <p class="text-xs text-muted-foreground max-w-sm mx-auto">
        Nexique is an elite design studio. Please sign in to submit customized order requests and
        monitor design proofs.
      </p>
      <RouterLink
        :to="`/login?redirect=${encodeURIComponent($route.fullPath)}`"
        class="click-pop ripple inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-accent hover:text-primary-foreground transition-all shadow-sm"
      >
        Sign in to place order
      </RouterLink>
    </div>

    <!-- Authenticated Order Form -->
    <form v-else class="grid gap-3 md:grid-cols-2" @submit.prevent="submit">
      <div class="min-w-0 space-y-1.5">
        <label
          :for="fieldId('customer_name')"
          class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >Your name</label
        >
        <input
          :id="fieldId('customer_name')"
          v-model.trim="form.customer_name"
          name="customer_name"
          required
          disabled
          maxlength="100"
          class="min-h-11 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm outline-none cursor-not-allowed opacity-80"
        />
      </div>

      <div class="min-w-0 space-y-1.5">
        <label
          :for="fieldId('quantity')"
          class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >Quantity</label
        >
        <input
          :id="fieldId('quantity')"
          v-model.number="form.quantity"
          name="quantity"
          type="number"
          min="1"
          max="10000"
          required
          class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div class="min-w-0 space-y-1.5">
        <label
          :for="fieldId('customer_email')"
          class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >Email</label
        >
        <input
          :id="fieldId('customer_email')"
          v-model.trim="form.customer_email"
          name="customer_email"
          type="email"
          required
          disabled
          maxlength="255"
          class="min-h-11 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm outline-none cursor-not-allowed opacity-80"
        />
      </div>

      <div class="min-w-0 space-y-1.5">
        <label
          :for="fieldId('customer_phone')"
          class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >Phone (optional)</label
        >
        <input
          :id="fieldId('customer_phone')"
          v-model.trim="form.customer_phone"
          name="customer_phone"
          maxlength="30"
          placeholder="+1 (555) 012-3456"
          class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div class="space-y-1.5 md:col-span-2">
        <label
          :for="fieldId('message')"
          class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Message / special instructions
        </label>
        <textarea
          :id="fieldId('message')"
          v-model.trim="form.message"
          name="message"
          maxlength="1000"
          rows="3"
          placeholder="Paper preferences, wording, deadlines, etc."
          class="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div
        class="sticky bottom-0 z-10 flex justify-end border-t border-border bg-card pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:col-span-2"
      >
        <button
          type="submit"
          :disabled="submitting"
          class="click-pop ripple inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/95 disabled:opacity-60 md:w-auto"
        >
          <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
          <Mail v-else class="h-4 w-4" />
          {{ submitting ? "Sending request..." : "Send request" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { Loader2, Mail, Lock } from "@lucide/vue";

import { onAuthState, getFirebaseToken } from "@/lib/firebase";
import { useToast } from "@/composables/useToast";
import { createOrder, getCustomerProfile } from "@/lib/store";

const props = defineProps({
  collectionSlug: { type: String, required: true },
  collectionName: { type: String, required: true },
  modelSlug: { type: String, required: true },
  modelName: { type: String, required: true },
  designVariant: { type: String, default: "" },
  initialMessage: { type: String, default: "" },
});

const emit = defineEmits(["submitted"]);
const toast = useToast();
const formId = `order-${Math.random().toString(36).slice(2)}`;
const submitting = ref(false);
const customer = ref(null);

const form = reactive({
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  quantity: 1,
  message: props.initialMessage || "",
});

// Watch initialMessage to dynamically populate instructions textarea
watch(
  () => props.initialMessage,
  (newVal) => {
    if (newVal) {
      form.message = newVal;
    }
  },
  { immediate: true },
);

onMounted(() => {
  onAuthState(async (user) => {
    customer.value = user;
    if (user) {
      form.customer_email = user.email || "";
      form.customer_name = user.displayName || user.email.split("@")[0].toUpperCase() || "";

      try {
        const token = await getFirebaseToken();
        if (token) {
          const profile = await getCustomerProfile(token);
          if (profile && profile.phone) {
            form.customer_phone = profile.phone;
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve profile configuration for order form:", err);
      }
    } else {
      form.customer_email = "";
      form.customer_name = "";
      form.customer_phone = "";
    }
  });
});

const fieldId = (name) => `${formId}-${name}`;

function resetForm() {
  form.customer_phone = "";
  form.quantity = 1;
  form.message = "";
}

function validate() {
  if (!form.customer_name) return "Name required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) return "Invalid email address.";
  if (!Number.isInteger(form.quantity) || form.quantity < 1 || form.quantity > 10000) {
    return "Quantity must be between 1 and 10000.";
  }
  return "";
}

async function submit() {
  const error = validate();
  if (error) {
    toast.error(error);
    return;
  }

  submitting.value = true;
  try {
    await createOrder({
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone || null,
      quantity: form.quantity,
      message: form.message || null,
      collection_slug: props.collectionSlug,
      collection_name: props.collectionName,
      model_slug: props.modelSlug,
      model_name: props.modelName,
      design_variant: props.designVariant || null,
      customer_uid: customer.value ? customer.value.uid : null,
    });
    toast.success("Order received! Dwij or Laksh will be in touch shortly.");
    resetForm();
    emit("submitted");
  } catch (err) {
    console.error(err);
    toast.error("Could not submit. Please email nexique@gmail.com instead.");
  } finally {
    submitting.value = false;
  }
}
</script>
