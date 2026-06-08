<template>
  <div v-if="collection" class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <RouterLink to="/" class="inline-flex min-w-0 items-center gap-2">
          <BrandLockup compact />
        </RouterLink>
        <RouterLink
          to="/collections"
          class="inline-flex max-w-[44vw] shrink-0 items-center justify-end gap-2 truncate text-sm transition hover:text-accent sm:max-w-none"
        >
          <ArrowLeft class="h-4 w-4 shrink-0" /> <span class="truncate">All Collections</span>
        </RouterLink>
      </nav>
    </header>

    <section
      class="bg-hero-gradient relative overflow-hidden px-4 py-16 text-primary-foreground sm:px-6 sm:py-20"
    >
      <div class="absolute right-10 top-10 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      <div class="animate-fade-up relative mx-auto max-w-5xl text-center">
        <div
          class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15"
        >
          <component :is="collection.icon" class="h-8 w-8 text-accent" />
        </div>
        <h1 class="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
          {{ collection.name }}
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
          {{ collection.tagline }}
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
      <div class="mb-12 text-center">
        <p class="text-xs font-medium uppercase tracking-widest text-accent">Models</p>
        <h2 class="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Choose your style
        </h2>
        <p class="mt-3 text-sm text-muted-foreground">Tap any card to see all 6 design variants.</p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="(model, index) in collection.models"
          :key="model.slug"
          :to="`/collections/${collection.slug}/${model.slug}`"
          class="click-pop ripple group block animate-fade-up cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card active:scale-[0.98]"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <div
            class="relative mb-4 flex h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br"
            :class="model.tint"
          >
            <div class="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]">
              <CategoryCardArt :slug="collection.slug" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <h3 class="font-display text-lg font-bold tracking-tight">{{ model.name }}</h3>
            <span
              class="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent"
            >
              {{ model.tag }}
            </span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">6 design variants &middot; Made to order</p>
        </RouterLink>
      </div>

      <div class="mt-16 text-center">
        <a
          href="mailto:nexique@gmail.com"
          class="click-pop ripple bg-gold-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-burgundy transition hover:shadow-gold"
        >
          <Mail class="h-4 w-4" /> Order from this collection
        </a>
      </div>
    </section>
  </div>

  <NotFound v-else />
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Mail } from "@lucide/vue";

import BrandLockup from "@/components/BrandLockup.vue";
import CategoryCardArt from "@/components/CategoryCardArt.vue";
import NotFound from "@/pages/NotFound.vue";
import { getCollection } from "@/lib/collections-data";

const route = useRoute();
const collection = computed(() => getCollection(route.params.slug));

watchEffect(() => {
  if (!collection.value) return;
  document.title = `${collection.value.name} - Nexique`;
});
</script>
