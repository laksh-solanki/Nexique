<template>
  <button type="button" :class="buttonClass" @click="open = true">
    <ShoppingBag v-if="showIcon" class="h-4 w-4" />
    {{ buttonLabel }}
  </button>

  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-end justify-center overflow-hidden px-0 pt-6 sm:items-center sm:px-5 sm:py-6"
    >
      <button
        class="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        type="button"
        aria-label="Close order dialog"
        @click="open = false"
      />
      <section
        class="relative flex max-h-[calc(100dvh_-_0.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-card sm:max-h-[min(760px,calc(100dvh_-_3rem))] sm:rounded-2xl md:max-w-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-dialog-title"
      >
        <header
          class="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
        >
          <div class="min-w-0">
            <h2
              id="order-dialog-title"
              class="font-display text-xl font-bold tracking-tight sm:text-2xl"
            >
              Order this card
            </h2>
            <p class="mt-1 break-words text-sm leading-snug text-muted-foreground">
              {{ modelName }}<span v-if="designVariant"> - {{ designVariant }}</span> -
              {{ collectionName }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </header>

        <div class="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <OrderForm
            :collection-slug="collectionSlug"
            :collection-name="collectionName"
            :model-slug="modelSlug"
            :model-name="modelName"
            :design-variant="designVariant"
            @submitted="open = false"
          />
        </div>
      </section>
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
