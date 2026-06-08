<template>
  <div class="min-h-screen bg-background">
    <SiteHeader />

    <section class="bg-hero-gradient relative overflow-hidden px-6 py-20 text-primary-foreground">
      <div
        class="animate-float pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl"
      />
      <div class="animate-fade-up relative mx-auto max-w-4xl text-center">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest"
        >
          <Sparkles class="h-3.5 w-3.5" /> Choose Your Card
        </div>
        <h1 class="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          The full <span class="text-shimmer italic">collection</span>.
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-primary-foreground/80">
          Nine professional card lines - pick the category that fits your moment.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-20">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="(collection, index) in list"
          :key="collection.slug"
          :to="`/collections/${collection.slug}`"
          class="click-pop ripple group relative block animate-fade-up rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card active:scale-[0.98]"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div
            class="mb-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-stone-50 to-cream"
          >
            <div
              class="h-full w-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
            >
              <CategoryCardArt :slug="collection.slug" />
            </div>
          </div>
          <div class="mb-1 flex items-center justify-between">
            <h3 class="font-display text-xl font-bold tracking-tight">{{ collection.name }}</h3>
            <component :is="collection.icon" class="h-4 w-4 text-accent" />
          </div>
          <p class="text-sm text-muted-foreground">{{ collection.tagline }}</p>
          <div
            class="mt-4 flex items-center gap-1 text-sm font-semibold text-accent opacity-0 transition group-hover:opacity-100"
          >
            Explore <ArrowRight class="h-3.5 w-3.5" />
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ArrowRight, Sparkles } from "@lucide/vue";

import CategoryCardArt from "@/components/CategoryCardArt.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import { collections } from "@/lib/collections-data";

const list = Object.values(collections);
</script>
