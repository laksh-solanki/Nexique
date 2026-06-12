<template>
  <div class="relative h-full w-full overflow-hidden bg-secondary/70">
    <img
      v-if="asset?.image_data_url"
      :src="asset.image_data_url"
      :alt="asset.alt || ''"
      loading="lazy"
      width="1024"
      height="1024"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <div
      v-else
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
    >
      <Loader2 v-if="loading" class="h-5 w-5 animate-spin text-accent" />
      <ImageOff v-else class="h-5 w-5 text-accent" />
      <span>{{ loading ? "Loading image" : "Image not loaded" }}</span>
      <span v-if="error" class="max-w-[14rem] text-[10px] font-medium normal-case tracking-normal">
        {{ error }}
      </span>
    </div>
    <span
      class="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm backdrop-blur-sm"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ImageOff, Loader2 } from "@lucide/vue";

import { categoryAssetKey } from "@/lib/catalogAssetKeys";
import { useCatalogAsset } from "@/lib/catalogAssets";

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const labelMap = {
  "greeting-cards": "Heartfelt",
  "wedding-cards": "Forever",
  "business-cards": "Professional",
  templates: "Editorial",
  "collection-cards": "Vintage",
  "playing-cards": "Luxe",
  "gift-cards": "Gifting",
  "valentine-special": "Romance",
  "custom-wish-cards": "Bespoke",
};

const assetKey = computed(() => categoryAssetKey(props.slug));
const { asset, loading, error } = useCatalogAsset(assetKey);
const label = computed(() => asset.value?.label || labelMap[props.slug] || "Nexique");
</script>
