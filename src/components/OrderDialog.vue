<template>
  <button type="button" :class="buttonClass" @click="open = true">
    <ShoppingBag v-if="showIcon" class="h-4 w-4" />
    {{ buttonLabel }}
  </button>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        class="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        type="button"
        aria-label="Close order dialog"
        @click="open = false"
      />
      <div
        class="relative max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-card"
        role="dialog"
        aria-modal="true"
      >
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold tracking-tight">Order this card</h2>
            <p class="text-sm text-muted-foreground">
              {{ modelName }}<span v-if="designVariant"> - {{ designVariant }}</span> -
              {{ collectionName }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <form class="space-y-3" @submit.prevent="submit">
          <div class="space-y-1.5">
            <label for="customer_name" class="text-sm font-medium">Your name</label>
            <input
              id="customer_name"
              v-model.trim="form.customer_name"
              name="customer_name"
              required
              maxlength="100"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label for="customer_email" class="text-sm font-medium">Email</label>
              <input
                id="customer_email"
                v-model.trim="form.customer_email"
                name="customer_email"
                type="email"
                required
                maxlength="255"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div class="space-y-1.5">
              <label for="customer_phone" class="text-sm font-medium">Phone (optional)</label>
              <input
                id="customer_phone"
                v-model.trim="form.customer_phone"
                name="customer_phone"
                maxlength="30"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="quantity" class="text-sm font-medium">Quantity</label>
            <input
              id="quantity"
              v-model.number="form.quantity"
              name="quantity"
              type="number"
              min="1"
              max="10000"
              required
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div class="space-y-1.5">
            <label for="message" class="text-sm font-medium">Message / special instructions</label>
            <textarea
              id="message"
              v-model.trim="form.message"
              name="message"
              maxlength="1000"
              rows="3"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              <Mail v-else class="h-4 w-4" />
              {{ submitting ? "Sending..." : "Send request" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Loader2, Mail, ShoppingBag, X } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { createOrder } from "@/lib/store";

const props = defineProps({
  collectionSlug: { type: String, required: true },
  collectionName: { type: String, required: true },
  modelSlug: { type: String, required: true },
  modelName: { type: String, required: true },
  designVariant: { type: String, default: "" },
  buttonLabel: { type: String, default: "Order this design" },
  buttonClass: {
    type: String,
    default:
      "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90",
  },
  showIcon: { type: Boolean, default: true },
});

const toast = useToast();
const open = ref(false);
const submitting = ref(false);
const form = reactive({
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  quantity: 1,
  message: "",
});

function validate() {
  if (!form.customer_name) return "Name required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) return "Invalid email";
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
    });
    toast.success("Order received! Dwij or Lax will be in touch shortly.");
    open.value = false;
    form.customer_name = "";
    form.customer_email = "";
    form.customer_phone = "";
    form.quantity = 1;
    form.message = "";
  } catch (err) {
    console.error(err);
    toast.error("Could not submit. Please email cardfest@gmail.com instead.");
  } finally {
    submitting.value = false;
  }
}
</script>
