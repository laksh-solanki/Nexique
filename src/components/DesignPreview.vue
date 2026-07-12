<template>
  <div class="relative flex w-full h-full items-center justify-center py-6 select-none">
    <!-- Standard Card Design Container -->
    <div
      class="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-[#fdfbf7] text-foreground shadow-card"
    >
      <!-- If it's an image, show it directly with normal size/ratio inside the card container -->
      <template v-if="!imageLoading && imageSrc">
        <img
          :src="imageSrc"
          :alt="imageAlt || `${title} preview`"
          draggable="false"
          class="h-full w-full object-contain"
        />
      </template>

      <!-- Otherwise, render other templates inside the card container -->
      <div v-else class="relative flex h-full w-full items-center justify-center p-6">
        <template v-if="imageLoading">
          <div
            class="flex flex-col items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            <Loader2 class="h-6 w-6 animate-spin text-accent" />
            <span>Loading preview</span>
          </div>
        </template>

        <template v-else-if="imageError">
          <div
            class="flex flex-col items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            <ImageOff class="h-6 w-6 text-accent" />
            <span>Preview unavailable</span>
          </div>
        </template>

        <!-- Dynamic Template Renders -->
        <template v-else>
          <!-- Classic Layout -->
          <div
            v-if="variantLayout === 'classic'"
            class="flex h-full w-full flex-col items-center justify-between rounded-xl border border-foreground/5 bg-card/45 p-6 text-center"
          >
            <div class="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Vol. I &middot; Issue 01
            </div>
            <div class="flex flex-col items-center gap-3">
              <component :is="icon" class="h-10 w-10 text-primary/80" />
              <h3
                class="font-display text-2xl font-semibold leading-tight text-primary sm:text-3xl"
                :class="fontClass"
              >
                {{ title || "Birthday Bloom" }}
              </h3>
            </div>
            <div
              class="max-w-[200px] text-xs font-light leading-relaxed text-muted-foreground italic"
            >
              {{ customMessage || "Some moments are too precious to forget." }}
            </div>
          </div>

          <!-- Modern Layout -->
          <div
            v-if="variantLayout === 'modern'"
            class="relative flex h-full w-full flex-col justify-between rounded-xl border border-foreground/5 bg-card/65 p-6"
          >
            <div
              class="absolute right-4 top-4 h-10 w-10 rounded-full border border-foreground/10 flex items-center justify-center"
            >
              <component :is="icon" class="h-5 w-5 text-accent" />
            </div>
            <div class="mt-12">
              <h3
                class="font-display text-3xl font-extrabold leading-[1.1] text-primary"
                :class="fontClass"
              >
                {{ title || "Modern Style" }}
              </h3>
              <div class="mt-3 h-0.5 w-12 bg-accent" />
            </div>
            <div class="space-y-4">
              <p class="text-xs leading-relaxed text-muted-foreground">
                {{ customMessage || "Precision-printed on custom linen paper stock." }}
              </p>
              <div class="text-[9px] uppercase tracking-wider text-muted-foreground">
                Nexique &middot; Studio Edition
              </div>
            </div>
          </div>

          <!-- Minimal Layout -->
          <div
            v-if="variantLayout === 'minimal'"
            class="flex h-full w-full flex-col items-start justify-between rounded-xl border border-foreground/5 bg-card/35 p-6"
          >
            <component :is="icon" class="h-6 w-6 text-primary/60" />
            <div class="w-full">
              <h3
                class="font-display text-2xl font-light text-primary leading-tight"
                :class="fontClass"
              >
                {{ title || "Minimal" }}
              </h3>
              <p class="mt-2 max-w-[180px] text-[11px] leading-relaxed text-muted-foreground">
                {{ customMessage || "The beauty of clean design and subtle paper." }}
              </p>
            </div>
          </div>

          <!-- Bold Layout -->
          <div
            v-if="variantLayout === 'bold'"
            class="flex h-full w-full flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground p-6 text-center"
          >
            <h3
              class="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl text-white"
              :class="fontClass"
            >
              {{ title || "Bold Impact" }}
            </h3>
            <p class="mt-4 max-w-[190px] text-xs font-medium text-primary-foreground/80">
              {{ customMessage || "Leave an impression that stays." }}
            </p>
            <div
              class="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md"
            >
              <component :is="icon" class="h-4 w-4" />
            </div>
          </div>

          <!-- Vintage Layout -->
          <div
            v-if="variantLayout === 'vintage'"
            class="relative flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-primary/20 bg-cream/70 p-6 text-center"
          >
            <div
              class="pointer-events-none absolute inset-2 rounded-lg border border-dashed border-primary/20"
            />
            <div class="text-[9px] uppercase tracking-widest text-primary/60 font-semibold">
              EST. 2026
            </div>
            <div class="flex flex-col items-center gap-2">
              <component :is="icon" class="h-8 w-8 text-primary/70" />
              <h3 class="font-display text-2xl font-bold italic text-primary" :class="fontClass">
                {{ title || "Vintage Classic" }}
              </h3>
            </div>
            <p class="max-w-[180px] text-xs font-light text-muted-foreground italic">
              "{{ customMessage || "Timeless memories pressed on rich cotton cards." }}"
            </p>
          </div>

          <!-- Default Fallback -->
          <div
            v-else
            class="flex h-full w-full flex-col items-center justify-center rounded-xl bg-secondary/80 p-6 text-center"
          >
            <component :is="icon" class="mb-4 h-10 w-10 text-accent" />
            <h3 class="font-display text-2xl font-bold" :class="fontClass">
              {{ title || "Nexique Card" }}
            </h3>
            <p class="mt-2 text-xs text-muted-foreground">{{ customMessage }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ImageOff, Loader2, Sparkles } from "@lucide/vue";

const props = defineProps({
  imageSrc: { type: String, default: "" },
  imageAlt: { type: String, default: "" },
  imageLoading: { type: Boolean, default: false },
  imageError: { type: String, default: "" },
  title: { type: String, default: "" },
  tint: { type: String, default: "from-rose-200 to-rose-50" },
  icon: { type: [Object, Function], default: Sparkles },
  variant: { type: Object, default: null },
  fontClass: { type: String, default: "" },
  customMessage: { type: String, default: "" },
});

const variantLayout = computed(() => {
  return props.variant?.layout || "classic";
});
</script>
