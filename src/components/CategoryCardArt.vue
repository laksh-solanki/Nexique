<template>
  <div v-if="item" class="relative h-full w-full">
    <img
      :src="item.src"
      alt=""
      loading="lazy"
      width="1024"
      height="1024"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <span
      class="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm backdrop-blur-sm"
    >
      {{ item.label }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

import businessImg from "@/assets/cards/business-cards.jpg";
import collectionImg from "@/assets/cards/collection-cards.jpg";
import customImg from "@/assets/cards/custom-wish-cards.jpg";
import giftImg from "@/assets/cards/gift-cards.jpg";
import greetingImg from "@/assets/cards/greeting-cards.jpg";
import playingImg from "@/assets/cards/playing-cards.jpg";
import templatesImg from "@/assets/cards/templates.jpg";
import valentineImg from "@/assets/cards/valentine-special.jpg";
import weddingImg from "@/assets/cards/wedding-cards.jpg";

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const map = {
  "greeting-cards": { src: greetingImg, label: "Heartfelt" },
  "wedding-cards": { src: weddingImg, label: "Forever" },
  "business-cards": { src: businessImg, label: "Professional" },
  templates: { src: templatesImg, label: "Editorial" },
  "collection-cards": { src: collectionImg, label: "Vintage" },
  "playing-cards": { src: playingImg, label: "Luxe" },
  "gift-cards": { src: giftImg, label: "Gifting" },
  "valentine-special": { src: valentineImg, label: "Romance" },
  "custom-wish-cards": { src: customImg, label: "Bespoke" },
};

const item = computed(() => map[props.slug]);
</script>
