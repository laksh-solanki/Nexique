<template>
  <div
    class="relative flex h-60 items-center justify-center overflow-hidden rounded-xl"
    :class="containerBg"
  >
    <div
      v-if="variant.layout === 'classic'"
      class="flex h-48 w-36 flex-col items-center justify-center rounded-md border border-burgundy/10 bg-card p-3 shadow-card"
    >
      <div class="mb-3 h-px w-10 bg-burgundy/40" />
      <component :is="icon" class="h-8 w-8 text-burgundy/70" :stroke-width="1.5" />
      <p class="font-display mt-3 text-center text-[11px] font-bold leading-tight text-burgundy">
        {{ title }}
      </p>
      <div class="mt-3 h-px w-10 bg-burgundy/40" />
    </div>

    <div
      v-else-if="variant.layout === 'modern'"
      class="relative h-48 w-40 overflow-hidden rounded-md bg-card shadow-card"
    >
      <div class="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-r" :class="tint" />
      <div class="absolute right-3 top-4 h-8 w-8 rounded-full bg-burgundy" />
      <div class="absolute bottom-3 left-3 right-3">
        <p class="font-display text-[12px] font-extrabold leading-tight text-burgundy">
          {{ title }}
        </p>
        <div class="mt-2 h-1 w-8 bg-accent" />
        <p class="mt-1.5 text-[8px] uppercase tracking-wider text-muted-foreground">
          CardFesta &middot; 2026
        </p>
      </div>
    </div>

    <div
      v-else-if="variant.layout === 'minimal'"
      class="flex h-48 w-36 flex-col items-start justify-between rounded-md bg-card p-4 shadow-sm"
    >
      <component :is="icon" class="h-4 w-4 text-burgundy/60" :stroke-width="1.5" />
      <p class="font-display text-[11px] font-light leading-tight text-burgundy">{{ title }}</p>
    </div>

    <div
      v-else-if="variant.layout === 'bold'"
      class="bg-gold-gradient relative flex h-48 w-40 items-center justify-center overflow-hidden rounded-md shadow-gold"
    >
      <p
        class="font-display px-3 text-center text-[14px] font-black uppercase leading-none text-burgundy"
      >
        {{ title }}
      </p>
      <div
        class="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-burgundy"
      >
        <component :is="icon" class="h-3 w-3 text-accent" />
      </div>
    </div>

    <div
      v-else-if="variant.layout === 'vintage'"
      class="relative flex h-48 w-40 flex-col items-center justify-center rounded-sm border-2 border-burgundy/30 bg-cream p-3 shadow-card"
    >
      <div
        class="pointer-events-none absolute inset-1 rounded-sm border border-dashed border-burgundy/30"
      />
      <div
        class="absolute right-1 top-1 flex h-7 w-7 rotate-6 items-center justify-center rounded-sm border border-burgundy/40 text-[7px] font-bold text-burgundy/60"
      >
        EST'26
      </div>
      <component :is="icon" class="h-7 w-7 text-burgundy/70" :stroke-width="1.5" />
      <p
        class="font-display mt-2 text-center text-[11px] font-bold italic leading-tight text-burgundy"
      >
        {{ title }}
      </p>
    </div>

    <div
      v-else
      class="relative flex h-48 w-40 flex-col items-center justify-center overflow-hidden rounded-md border border-accent/40 bg-burgundy p-3 shadow-gold"
    >
      <div class="pointer-events-none absolute inset-2 rounded-sm border border-accent/50" />
      <component :is="icon" class="h-7 w-7 text-accent" :stroke-width="1.5" />
      <p class="font-display mt-3 text-center text-[11px] font-bold leading-tight text-accent">
        {{ title }}
      </p>
      <div class="mt-2 h-px w-8 bg-accent" />
      <p class="mt-1 text-[7px] uppercase tracking-[0.2em] text-accent/80">CardFesta</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: { type: Object, required: true },
  tint: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
});

const containerBg = computed(() => {
  const backgrounds = {
    classic: `bg-gradient-to-br ${props.tint}`,
    modern: "bg-stone-100",
    minimal: "bg-cream",
    bold: "bg-burgundy",
    vintage: "bg-amber-50",
    luxe: "bg-burgundy",
  };

  return backgrounds[props.variant.layout] || backgrounds.classic;
});
</script>
