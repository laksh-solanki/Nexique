<template>
  <span class="inline-flex items-center gap-3">
    <span
      class="flex shrink-0 items-center justify-center overflow-visible"
      :class="compact ? 'h-10 w-12' : 'h-12 w-14'"
    >
      <img
        :src="logo"
        alt=""
        width="1074"
        height="926"
        class="h-full w-full object-contain drop-shadow-sm"
        decoding="async"
      />
    </span>
    <span class="inline-flex items-baseline gap-1">
      <span
        class="font-display font-medium tracking-tight text-primary"
        :class="compact ? 'text-2xl' : 'text-3xl'"
      >
        CardFesta
      </span>
      <span class="font-display text-2xl leading-none text-accent">.</span>
      <span v-if="label" class="ml-2 text-xs font-semibold uppercase tracking-widest text-accent">
        {{ label }}
      </span>
    </span>
  </span>
</template>

<script setup>
import logo from "@/assets/logo.png";

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
});
</script>
