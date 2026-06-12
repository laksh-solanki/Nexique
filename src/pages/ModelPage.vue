<template>
  <div v-if="collection && model" class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <RouterLink to="/" class="inline-flex min-w-0 items-center gap-2">
          <BrandLockup compact />
        </RouterLink>
        <RouterLink
          :to="`/collections/${collection.slug}`"
          class="inline-flex max-w-[46vw] shrink-0 items-center justify-end gap-2 truncate text-sm transition hover:text-accent sm:max-w-none"
        >
          <ArrowLeft class="h-4 w-4 shrink-0" />
          <span class="truncate">Back to {{ collection.name }}</span>
        </RouterLink>
      </nav>
    </header>

    <section
      class="relative overflow-hidden bg-gradient-to-br px-4 py-16 sm:px-6 sm:py-20"
      :class="model.tint"
    >
      <div class="animate-fade-up relative mx-auto max-w-5xl text-center">
        <span
          class="rounded-full bg-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-burgundy/70"
        >
          {{ collection.name }} &middot; {{ model.tag }}
        </span>
        <h1
          class="font-display mt-4 text-3xl font-bold tracking-tight text-burgundy sm:text-4xl md:text-6xl"
        >
          {{ model.name }}
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-burgundy/80">
          Pick an active design subcategory below - every card is precision-printed on premium
          stock.
        </p>
      </div>
    </section>

    <section v-if="isBirthdayBloom" class="bg-secondary px-4 py-14 sm:px-6 sm:py-16">
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

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
      <div class="mb-12 text-center">
        <p class="text-xs font-medium uppercase tracking-widest text-accent">Design Variants</p>
        <h2 class="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          {{ modelDesignVariants.length }} ways to make it yours
        </h2>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(variant, index) in modelDesignVariants"
          :key="variant.slug"
          class="group animate-fade-up cursor-zoom-in rounded-2xl border border-border bg-card p-5 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-accent/30"
          :style="{ animationDelay: `${index * 0.06}s` }"
          role="button"
          tabindex="0"
          :aria-label="`Open ${model.name} ${variant.name} preview`"
          @click="openVariantPreview(variant)"
          @keyup.enter="openVariantPreview(variant)"
          @keyup.space.prevent="openVariantPreview(variant)"
        >
          <VariantPreview
            :variant="variant"
            :tint="model.tint"
            :icon="collection.icon"
            :title="model.name"
            :image-src="variant.imageSrc"
            :image-alt="variant.imageAlt"
            :image-loading="variant.imageLoading"
            :image-error="variant.imageError"
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
          <div @click.stop @keydown.stop @keyup.stop>
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
      </div>

      <VariantPreviewDialog
        :open="previewOpen"
        :collection="collection"
        :model="model"
        :variant="selectedVariant"
        @close="closeVariantPreview"
      />

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

  <div v-else-if="customLoading" class="flex min-h-screen items-center justify-center bg-secondary">
    <p class="text-sm text-muted-foreground">Loading card...</p>
  </div>

  <NotFound v-else />
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft } from "@lucide/vue";

import BrandLockup from "@/components/BrandLockup.vue";
import BirthdayBloomCard from "@/components/BirthdayBloomCard.vue";
import OrderDialog from "@/components/OrderDialog.vue";
import VariantPreviewDialog from "@/components/VariantPreviewDialog.vue";
import VariantPreview from "@/components/VariantPreview.vue";
import {
  baseDesignVariantSlugs,
  getCollection,
  getDesignVariants,
  getModel,
  getWeddingVariantAssetKeys,
  normalizeDesignVariantSlugs,
} from "@/lib/collections-data";
import {
  catalogAssetCache,
  catalogAssetErrors,
  catalogAssetLoading,
  loadCatalogAssets,
} from "@/lib/catalogAssets";
import { listPublicCustomModels, listPublicModelOverrides } from "@/lib/store";
import NotFound from "@/pages/NotFound.vue";

const route = useRoute();
const collection = computed(() => getCollection(route.params.slug));
const customModels = ref([]);
const modelOverrides = ref({});
const customLoading = ref(false);
const baseModelId = (collectionSlug, modelSlug) => `base:${collectionSlug}:${modelSlug}`;
const staticModel = computed(() => {
  const model = getModel(route.params.slug, route.params.modelSlug);
  if (!model) return null;

  const override = modelOverrides.value[baseModelId(route.params.slug, model.slug)];
  if (override?.deleted) return null;

  return {
    ...model,
    ...override,
    slug: model.slug,
    name: override?.name || model.name,
    tag: override?.tag || model.tag,
    tint: override?.tint || model.tint,
    variant_slugs: normalizeDesignVariantSlugs(
      override?.variant_slugs || model.variant_slugs,
      baseDesignVariantSlugs,
    ),
    asset_name: model.name,
  };
});
const customModel = computed(() =>
  customModels.value.find((item) => item.slug === route.params.modelSlug),
);
const model = computed(() => staticModel.value || customModel.value);
const modelAssetName = computed(() => model.value?.asset_name || model.value?.name || "");
const modelVariantSlugs = computed(() => normalizeDesignVariantSlugs(model.value?.variant_slugs));
const variantAssetKeys = computed(() =>
  route.params.slug === "wedding-cards"
    ? getWeddingVariantAssetKeys(modelAssetName.value, modelVariantSlugs.value)
    : [],
);
const modelDesignVariants = computed(() =>
  getDesignVariants(
    route.params.slug,
    modelAssetName.value,
    catalogAssetCache.value,
    modelVariantSlugs.value,
  ).map((variant) =>
    variant.assetKey
      ? {
          ...variant,
          imageLoading: Boolean(catalogAssetLoading.value[variant.assetKey]),
          imageError: catalogAssetErrors.value[variant.assetKey] || "",
        }
      : variant,
  ),
);
const previewOpen = ref(false);
const selectedVariant = ref(null);
const isBirthdayBloom = computed(
  () => route.params.slug === "greeting-cards" && route.params.modelSlug === "birthday-bloom",
);

function openVariantPreview(variant) {
  selectedVariant.value = variant;
  previewOpen.value = true;
}

function closeVariantPreview() {
  previewOpen.value = false;
}

watch(
  () => route.params.slug,
  async (slug) => {
    if (!slug || !getCollection(slug)) {
      customModels.value = [];
      modelOverrides.value = {};
      return;
    }

    customLoading.value = true;
    try {
      const [custom, overrides] = await Promise.all([
        listPublicCustomModels(slug),
        listPublicModelOverrides(slug),
      ]);
      customModels.value = custom;
      modelOverrides.value = Object.fromEntries(
        overrides.map((model) => [model.source_model_id, model]),
      );
    } catch (err) {
      console.error(err);
      customModels.value = [];
      modelOverrides.value = {};
    } finally {
      customLoading.value = false;
    }
  },
  { immediate: true },
);

watch(
  variantAssetKeys,
  (keys) => {
    if (keys.length) loadCatalogAssets(keys);
  },
  { immediate: true },
);

watch(modelDesignVariants, (variants) => {
  if (!selectedVariant.value) return;
  const latestVariant = variants.find((variant) => variant.slug === selectedVariant.value.slug);
  if (latestVariant) selectedVariant.value = latestVariant;
});

watchEffect(() => {
  if (!collection.value || !model.value) return;
  document.title = `${model.value.name} - ${collection.value.name} - Nexique`;
});
</script>
