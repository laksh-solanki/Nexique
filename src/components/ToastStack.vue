<template>
  <div class="fixed bottom-5 right-5 z-[80] w-[min(360px,calc(100vw-2rem))] space-y-2">
    <div
      v-for="toast in state.toasts"
      :key="toast.id"
      class="rounded-xl border bg-card px-4 py-3 text-sm shadow-card"
      :class="toastClasses(toast.type)"
      role="status"
    >
      <div class="flex items-start justify-between gap-3">
        <p>{{ toast.message }}</p>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground"
          aria-label="Dismiss notification"
          @click="remove(toast.id)"
        >
          x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";

const { state, remove } = useToast();

function toastClasses(type) {
  if (type === "error") return "border-destructive/30 text-destructive";
  if (type === "info") return "border-accent/30 text-primary";
  return "border-accent/30 text-primary";
}
</script>
