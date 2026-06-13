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
        <p class="text-xs font-medium uppercase tracking-widest text-accent">Subcategories</p>
        <h2 class="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Choose a subcategory
        </h2>
        <p class="mt-3 text-sm text-muted-foreground">
          Select any subcategory to preview, zoom, and order directly.
        </p>
      </div>

      <div v-if="customLoading" class="mb-6 flex justify-center text-sm text-muted-foreground">
        Loading studio additions...
      </div>

      <div
        v-else-if="subcategoryCards.length === 0"
        class="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
      >
        No subcategories are available for this collection yet.
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="(subcategory, index) in subcategoryCards"
          :key="subcategory.slug"
          type="button"
          class="click-pop ripple group block animate-fade-up cursor-zoom-in rounded-2xl border border-border bg-card p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-accent/30 active:scale-[0.98]"
          :style="{ animationDelay: `${index * 0.06}s` }"
          :aria-label="`Open ${subcategory.name} preview`"
          @click="openSubcategoryDialog(subcategory)"
        >
          <div
            class="relative mb-4 flex h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br"
            :class="subcategory.preview ? 'from-stone-100 to-cream' : subcategory.tint"
          >
            <img
              v-if="subcategory.preview"
              :src="subcategory.preview.src"
              :alt="subcategory.preview.alt"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            <div
              v-else
              class="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]"
            >
              <CategoryCardArt :slug="collection.slug" />
            </div>
          </div>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-display text-lg font-bold tracking-tight">{{ subcategory.name }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ subcategory.count }} card{{ subcategory.count === 1 ? "" : "s" }} available
              </p>
              <p class="mt-2 text-sm font-semibold text-primary">
                {{ subcategory.priceLabel }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent"
            >
              {{ subcategory.badge }}
            </span>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-accent">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
              <ZoomIn class="h-3.5 w-3.5" />
              Preview
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground"
            >
              <ShoppingBag class="h-3.5 w-3.5" />
              Order Now
            </span>
          </div>
        </button>
      </div>

      <VariantPreviewDialog
        :open="previewOpen"
        :collection="collection"
        :model="selectedDialogModel"
        :variant="selectedDialogVariant"
        :title="selectedSubcategory?.name || ''"
        :summary="selectedDialogSummary"
        :order-model-slug="selectedSubcategory?.slug || ''"
        :order-model-name="selectedSubcategory?.name || ''"
        order-design-variant=""
        @close="closeSubcategoryDialog"
      />

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
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Mail, ShoppingBag, ZoomIn } from "@lucide/vue";

import BrandLockup from "@/components/BrandLockup.vue";
import CategoryCardArt from "@/components/CategoryCardArt.vue";
import VariantPreviewDialog from "@/components/VariantPreviewDialog.vue";
import NotFound from "@/pages/NotFound.vue";
import {
  baseDesignVariantSlugs,
  designVariantName,
  getCollection,
  getDesignVariants,
  getWeddingVariantAssetKeys,
  normalizeDesignVariantSlugs,
} from "@/lib/collections-data";
import {
  catalogAssetCache,
  catalogAssetErrors,
  catalogAssetLoading,
  loadCatalogAssets,
} from "@/lib/catalogAssets";
import { formatPrice } from "@/lib/pricing";
import { listPublicCustomModels, listPublicModelOverrides } from "@/lib/store";

const route = useRoute();
const collection = computed(() => getCollection(route.params.slug));
const customModels = ref([]);
const modelOverrides = ref({});
const customLoading = ref(false);
const previewOpen = ref(false);
const selectedSubcategorySlug = ref("");
const baseModelId = (collectionSlug, modelSlug) => `base:${collectionSlug}:${modelSlug}`;
const modelCards = computed(() => {
  if (!collection.value) return [];

  const staticModels = collection.value.models
    .map((model) => {
      const override = modelOverrides.value[baseModelId(collection.value.slug, model.slug)];
      if (override?.deleted) return null;

      const preview = override?.image_data_url
        ? {
            src: override.image_data_url,
            alt: override.image_alt || `${override.name} card preview`,
          }
        : null;

      return {
        ...model,
        ...override,
        slug: model.slug,
        name: override?.name || model.name,
        tag: override?.tag || model.tag,
        price: override?.price || model.price || null,
        tint: override?.tint || model.tint,
        variant_slugs: normalizeDesignVariantSlugs(
          override?.variant_slugs || model.variant_slugs,
          baseDesignVariantSlugs,
        ),
        asset_name: model.name,
        preview,
      };
    })
    .filter(Boolean);
  const addedModels = customModels.value.map((model) => ({
    ...model,
    asset_name: model.asset_name || model.name,
    variant_slugs: normalizeDesignVariantSlugs(model.variant_slugs),
    preview: model.image_data_url
      ? { src: model.image_data_url, alt: model.image_alt || `${model.name} card preview` }
      : null,
  }));

  return [...addedModels, ...staticModels];
});
const subcategoryCards = computed(() => {
  const groups = new Map();

  modelCards.value.forEach((model) => {
    model.variant_slugs.forEach((variantSlug, variantIndex) => {
      if (!variantSlug) return;
      const variant = buildSubcategoryVariant(model, variantSlug, variantIndex);
      const preview = variant.imageSrc
        ? { src: variant.imageSrc, alt: variant.imageAlt || `${variant.name} preview` }
        : model.preview;

      if (!groups.has(variantSlug)) {
        groups.set(variantSlug, {
          slug: variantSlug,
          name: designVariantName(variantSlug),
          badge: `${groups.size + 1}`,
          tint: model.tint,
          preview,
          variant,
          cards: [],
        });
      }

      const group = groups.get(variantSlug);
      group.cards.push(model);
      if (!group.preview && preview) group.preview = preview;
      if (!group.variant?.imageSrc && variant.imageSrc) group.variant = variant;
    });
  });

  return [...groups.values()].map((subcategory) => ({
    ...subcategory,
    count: subcategory.cards.length,
    priceLabel: priceRangeLabel(subcategory.cards),
  }));
});
const selectedSubcategory = computed(
  () => subcategoryCards.value.find((item) => item.slug === selectedSubcategorySlug.value) || null,
);
const selectedDialogModel = computed(() => {
  if (!selectedSubcategory.value || !collection.value) return null;

  return {
    slug: selectedSubcategory.value.slug,
    name: selectedSubcategory.value.name,
    tag: "Subcategory",
    price_label: selectedSubcategory.value.priceLabel,
    tint: selectedSubcategory.value.tint || collection.value.accent || "from-rose-200 to-amber-100",
  };
});
const selectedDialogVariant = computed(() => selectedSubcategory.value?.variant || null);
const selectedDialogSummary = computed(() =>
  selectedSubcategory.value && collection.value
    ? `${selectedSubcategory.value.name} - ${collection.value.name}`
    : "",
);
const weddingAssetKeys = computed(() => {
  if (collection.value?.slug !== "wedding-cards") return [];

  const previewKeys = new Map();

  for (const model of modelCards.value) {
    for (const variantSlug of model.variant_slugs) {
      if (previewKeys.has(variantSlug)) continue;
      const [assetKey] = getWeddingVariantAssetKeys(model.asset_name || model.name, [variantSlug]);
      if (assetKey) previewKeys.set(variantSlug, assetKey);
    }
  }

  return [...previewKeys.values()];
});

function buildSubcategoryVariant(model, variantSlug, variantIndex) {
  const [variant] = getDesignVariants(
    collection.value?.slug,
    model.asset_name || model.name,
    catalogAssetCache.value,
    [variantSlug],
  );
  const variantName = designVariantName(variantSlug);
  const assetKey = variant?.assetKey || "";

  return {
    ...variant,
    slug: variant?.slug || variantSlug,
    name: variant?.name || variantName,
    blurb: variant?.blurb || "Preview this subcategory and send an order request.",
    layout:
      variant?.layout ||
      ["classic", "modern", "minimal", "bold", "vintage", "luxe"][variantIndex % 6],
    imageSrc: variant?.imageSrc || model.preview?.src || "",
    imageAlt:
      variant?.imageAlt ||
      model.preview?.alt ||
      `${variantName} ${collection.value?.name || "Nexique"} design`,
    imageLoading: assetKey ? Boolean(catalogAssetLoading.value[assetKey]) : false,
    imageError: assetKey ? catalogAssetErrors.value[assetKey] || "" : "",
  };
}

function priceRangeLabel(cards) {
  const prices = cards
    .map((card) => Number(card.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) return "Price on request";

  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const label = formatPrice(minimum);

  return minimum === maximum ? label : `From ${label}`;
}

function openSubcategoryDialog(subcategory) {
  selectedSubcategorySlug.value = subcategory.slug;
  previewOpen.value = true;
}

function closeSubcategoryDialog() {
  previewOpen.value = false;
}

watch(
  () => route.params.slug,
  async (slug) => {
    previewOpen.value = false;
    selectedSubcategorySlug.value = "";

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
  weddingAssetKeys,
  (keys) => {
    if (keys.length) loadCatalogAssets(keys);
  },
  { immediate: true },
);

watchEffect(() => {
  if (!collection.value) return;
  document.title = `${collection.value.name} - Nexique`;
});
</script>
