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
        class="relative max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
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

        <OrderForm
          :collection-slug="collectionSlug"
          :collection-name="collectionName"
          :model-slug="modelSlug"
          :model-name="modelName"
          :design-variant="designVariant"
          @submitted="open = false"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";
import { ShoppingBag, X } from "@lucide/vue";

import OrderForm from "@/components/OrderForm.vue";

defineProps({
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

const open = ref(false);
</script>
