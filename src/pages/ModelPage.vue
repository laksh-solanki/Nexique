<template>
  <div v-if="collection && model" class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <RouterLink to="/" class="inline-flex items-center gap-2">
          <BrandLockup compact />
        </RouterLink>
        <RouterLink
          :to="`/collections/${collection.slug}`"
          class="inline-flex items-center gap-2 text-sm transition hover:text-accent"
        >
          <ArrowLeft class="h-4 w-4" /> Back to {{ collection.name }}
        </RouterLink>
      </nav>
    </header>

    <section class="relative overflow-hidden bg-gradient-to-br px-6 py-20" :class="model.tint">
      <div class="animate-fade-up relative mx-auto max-w-5xl text-center">
        <span
          class="rounded-full bg-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-burgundy/70"
        >
          {{ collection.name }} &middot; {{ model.tag }}
        </span>
        <h1 class="font-display mt-4 text-4xl font-bold tracking-tight text-burgundy md:text-6xl">
          {{ model.name }}
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-burgundy/80">
          Pick a design variant below - every card is precision-printed on premium stock.
        </p>
      </div>
    </section>

    <section v-if="isBirthdayBloom" class="bg-secondary px-6 py-16">
      <div class="mx-auto mb-10 max-w-5xl text-center">
        <p class="text-sm font-medium uppercase tracking-widest text-accent">Featured Design</p>
        <h2 class="font-display mt-2 text-3xl font-bold md:text-4xl">Signature Birthday Bloom</h2>
        <p class="mx-auto mt-3 max-w-xl text-muted-foreground">
          Ivory stock, refined gold corner filigree, fully personalised with the recipient's name.
        </p>
      </div>
      <BirthdayBloomCard name="[Their Name]" />
      <div class="mt-10 text-center">
        <OrderDialog
          :collection-slug="collection.slug"
          :collection-name="collection.name"
          :model-slug="model.slug"
          :model-name="model.name"
          design-variant="Signature"
          button-label="Order this design"
          button-class="inline-flex items-center gap-2 bg-gold-gradient text-burgundy px-7 py-3.5 rounded-full font-semibold hover:shadow-gold transition"
        />
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="mb-12 text-center">
        <p class="text-xs font-medium uppercase tracking-widest text-accent">Design Variants</p>
        <h2 class="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          6 ways to make it yours
        </h2>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(variant, index) in designVariants"
          :key="variant.slug"
          class="group animate-fade-up rounded-2xl border border-border bg-card p-5 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <VariantPreview
            :variant="variant"
            :tint="model.tint"
            :icon="collection.icon"
            :title="model.name"
          />
          <div class="mt-4 flex items-center justify-between">
            <h3 class="font-display text-lg font-bold tracking-tight">{{ variant.name }}</h3>
            <span
              class="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent"
            >
              Variant {{ index + 1 }}
            </span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">{{ variant.blurb }}</p>
          <OrderDialog
            :collection-slug="collection.slug"
            :collection-name="collection.name"
            :model-slug="model.slug"
            :model-name="model.name"
            :design-variant="variant.name"
            button-label="Order this design"
            button-class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          />
        </div>
      </div>

      <div class="mt-16 text-center">
        <RouterLink
          :to="`/collections/${collection.slug}`"
          class="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-burgundy transition hover:shadow-gold"
        >
          <ArrowLeft class="h-4 w-4" /> Other {{ collection.name }}
        </RouterLink>
      </div>
    </section>
  </div>

  <NotFound v-else />
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft } from "@lucide/vue";

import BrandLockup from "@/components/BrandLockup.vue";
import BirthdayBloomCard from "@/components/BirthdayBloomCard.vue";
import OrderDialog from "@/components/OrderDialog.vue";
import VariantPreview from "@/components/VariantPreview.vue";
import { designVariants, getCollection, getModel } from "@/lib/collections-data";
import NotFound from "@/pages/NotFound.vue";

const route = useRoute();
const collection = computed(() => getCollection(route.params.slug));
const model = computed(() => getModel(route.params.slug, route.params.modelSlug));
const isBirthdayBloom = computed(
  () => route.params.slug === "greeting-cards" && route.params.modelSlug === "birthday-bloom",
);

watchEffect(() => {
  if (!collection.value || !model.value) return;
  document.title = `${model.value.name} - ${collection.value.name} - CardFesta`;
});
</script>
