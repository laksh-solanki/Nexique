<template>
  <div class="perspective-1200 relative flex w-full justify-center py-6 select-none">
    <!-- 3D Card Container -->
    <div
      ref="cardRef"
      class="card-3d-inner preserve-3d relative cursor-grab transition-all duration-300"
      :class="[isFlipped ? 'rotate-y-180' : '', cardDragClass]"
      :style="card3DStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
      @pointerup="onPointerUp"
    >
      <!-- FRONT SIDE OF CARD -->
      <div
        class="backface-hidden relative flex h-96 w-72 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-card transition-all duration-300 sm:h-[460px] sm:w-[340px]"
        :class="paperTextureClass"
      >
        <!-- Specular Highlight Shine Overlay -->
        <div
          class="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          :style="shineOverlayStyle"
        />

        <!-- Foil Overlay (Metallic overlay sheen) -->
        <div
          v-if="foil !== 'none'"
          class="pointer-events-none absolute inset-0 z-10 mix-blend-overlay opacity-30 transition-opacity"
          :class="foilBackgroundClass"
        />

        <!-- Card Body Content -->
        <div class="relative flex h-full w-full items-center justify-center p-6">
          <template v-if="imageLoading">
            <div
              class="flex flex-col items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              <Loader2 class="h-6 w-6 animate-spin text-accent" />
              <span>Loading preview</span>
            </div>
          </template>

          <template v-else-if="imageSrc">
            <div class="relative h-full w-full overflow-hidden rounded-lg">
              <img
                :src="imageSrc"
                :alt="imageAlt || `${title} preview`"
                draggable="false"
                class="h-full w-full object-cover rounded-lg"
              />
              <!-- Optional dynamic text overlay on top of images if requested -->
              <div
                v-if="customMessage || title"
                class="absolute bottom-4 inset-x-4 rounded-md bg-black/45 p-3 backdrop-blur-sm text-center"
              >
                <p v-if="title" class="text-xs font-bold text-white uppercase tracking-wider">
                  {{ title }}
                </p>
                <p v-if="customMessage" class="mt-1 text-[10px] text-white/90 italic truncate">
                  "{{ customMessage }}"
                </p>
              </div>
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
              :class="foilBorderClass"
            >
              <div class="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Vol. I &middot; Issue 01
              </div>
              <div class="flex flex-col items-center gap-3">
                <component :is="icon" class="h-10 w-10 text-primary/80" :class="foilTextClass" />
                <h3
                  class="font-display text-2xl font-semibold leading-tight text-primary sm:text-3xl"
                  :class="[foilTextClass, fontClass]"
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
              v-else-if="variantLayout === 'modern'"
              class="relative flex h-full w-full flex-col justify-between rounded-xl border border-foreground/5 bg-card/65 p-6"
            >
              <div
                class="absolute right-4 top-4 h-10 w-10 rounded-full border border-foreground/10 flex items-center justify-center"
              >
                <component :is="icon" class="h-5 w-5 text-accent" :class="foilTextClass" />
              </div>
              <div class="mt-12">
                <h3
                  class="font-display text-3xl font-extrabold leading-[1.1] text-primary"
                  :class="[foilTextClass, fontClass]"
                >
                  {{ title || "Modern Style" }}
                </h3>
                <div class="mt-3 h-0.5 w-12 bg-accent" :class="foilBackgroundClass" />
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
              v-else-if="variantLayout === 'minimal'"
              class="flex h-full w-full flex-col items-start justify-between rounded-xl border border-foreground/5 bg-card/35 p-6"
            >
              <component :is="icon" class="h-6 w-6 text-primary/60" :class="foilTextClass" />
              <div class="w-full">
                <h3
                  class="font-display text-2xl font-light text-primary leading-tight"
                  :class="[foilTextClass, fontClass]"
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
              v-else-if="variantLayout === 'bold'"
              class="flex h-full w-full flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground p-6 text-center"
              :class="foilBackgroundClass"
            >
              <h3
                class="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl"
                :style="boldTitleStyle"
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
              v-else-if="variantLayout === 'vintage'"
              class="relative flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-primary/20 bg-cream/70 p-6 text-center"
              :class="foilBorderClass"
            >
              <div
                class="pointer-events-none absolute inset-2 rounded-lg border border-dashed border-primary/20"
                :class="foilBorderClass"
              />
              <div
                class="text-[9px] uppercase tracking-widest text-primary/60 font-semibold"
                :class="foilTextClass"
              >
                EST. 2026
              </div>
              <div class="flex flex-col items-center gap-2">
                <component :is="icon" class="h-8 w-8 text-primary/70" :class="foilTextClass" />
                <h3
                  class="font-display text-2xl font-bold italic text-primary"
                  :class="[foilTextClass, fontClass]"
                >
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
              <component :is="icon" class="mb-4 h-10 w-10 text-accent" :class="foilTextClass" />
              <h3 class="font-display text-2xl font-bold" :class="[foilTextClass, fontClass]">
                {{ title || "Nexique Card" }}
              </h3>
              <p class="mt-2 text-xs text-muted-foreground">{{ customMessage }}</p>
            </div>
          </template>
        </div>
      </div>

      <!-- BACK SIDE OF CARD -->
      <div
        class="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-2xl border border-foreground/10 bg-card p-8 shadow-card"
        :class="paperTextureClass"
      >
        <!-- Specular Highlight for Back Side -->
        <div
          class="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          :style="shineOverlayStyle"
        />

        <!-- Brand Stamp Lockup -->
        <div class="flex flex-col items-center text-center mt-4">
          <div
            class="h-9 w-9 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center"
            :class="foilBorderClass"
          >
            <component
              :is="icon || Sparkles"
              class="h-4.5 w-4.5 text-accent"
              :class="foilTextClass"
            />
          </div>
          <span class="mt-2 text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground"
            >Nexique Card Studio</span
          >
        </div>

        <!-- Customizable Handwritten Message Block -->
        <div class="my-auto flex flex-col items-center justify-center text-center px-4">
          <!-- Horizontal guides simulating notebook paper -->
          <div class="w-full space-y-4 py-2 border-y border-dashed border-foreground/5 relative">
            <p
              class="text-sm text-foreground/80 leading-relaxed min-h-[4rem] flex items-center justify-center px-2 select-text"
              :class="backMessageFontClass"
            >
              {{ customMessage || "Write your handwritten message preview here..." }}
            </p>
          </div>
        </div>

        <!-- Editorial Print Details Stamp -->
        <div class="flex flex-col items-center gap-1.5 text-center mb-2">
          <div class="h-px w-12 bg-foreground/10" />
          <p class="text-[7px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Bespoke Printing &middot; Paper Grade 320GSM
          </p>
          <div
            class="flex items-center gap-1 text-[8px] font-bold text-accent"
            :class="foilTextClass"
          >
            <Sparkles class="h-2.5 w-2.5" /> Hand-Finished Foil
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
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
  isFlipped: { type: Boolean, default: false },
  foil: { type: String, default: "none" }, // 'none', 'gold', 'silver', 'rose-gold', 'holo'
  fontClass: { type: String, default: "" }, // custom font class
  customMessage: { type: String, default: "" },
  paperTexture: { type: String, default: "ivory" }, // 'ivory', 'linen', 'kraft'
});

const cardRef = ref(null);
const rotateX = ref(0);
const rotateY = ref(0);
const isHovered = ref(false);
const shineX = ref(50);
const shineY = ref(50);
const shineOpacity = ref(0);

const variantLayout = computed(() => {
  return props.variant?.layout || "classic";
});

const paperTextureClass = computed(() => {
  switch (props.paperTexture) {
    case "linen":
      // Linen pattern using subtle linear-gradients
      return "bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-[size:4px_4px] bg-stone-50/95";
    case "kraft":
      // Kraft paper organic brown styling
      return "bg-[#dfccaf] text-[#4a3525] border-[#c0af95]/30";
    case "ivory":
    default:
      // Premium warm off-white
      return "bg-[#fdfbf7] text-foreground";
  }
});

const foilBackgroundClass = computed(() => {
  switch (props.foil) {
    case "gold":
      return "foil-gold-bg";
    case "silver":
      return "foil-silver-bg";
    case "rose-gold":
      return "foil-rose-gold-bg";
    case "holo":
      return "foil-holo-bg";
    default:
      return "";
  }
});

const foilTextClass = computed(() => {
  switch (props.foil) {
    case "gold":
      return "foil-gold-text";
    case "silver":
      return "foil-silver-text";
    case "rose-gold":
      return "foil-rose-gold-text";
    case "holo":
      return "foil-holo-text";
    default:
      return "";
  }
});

const foilBorderClass = computed(() => {
  switch (props.foil) {
    case "gold":
      return "border-amber-400/50 shadow-sm shadow-amber-400/20";
    case "silver":
      return "border-slate-300/60 shadow-sm shadow-slate-300/20";
    case "rose-gold":
      return "border-rose-300/60 shadow-sm shadow-rose-300/20";
    case "holo":
      return "border-purple-300/50 shadow-sm shadow-purple-300/20";
    default:
      return "";
  }
});

const backMessageFontClass = computed(() => {
  // Let handwriting be the default cursive style for the handwritten back side message
  if (props.fontClass) return props.fontClass;
  return "font-cursive-hand text-lg";
});

const boldTitleStyle = computed(() => {
  // If bold layout has a foil, we want it to be masked nicely. If not, text-color remains white.
  if (props.foil !== "none") return {};
  return { color: "white" };
});

const cardDragClass = computed(() => {
  return isHovered.value ? "transition-none" : "transition-transform duration-500 ease-out";
});

const card3DStyle = computed(() => {
  return {
    transform: props.isFlipped
      ? `rotateY(180deg) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`
      : `rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
  };
});

const shineOverlayStyle = computed(() => {
  let gradientColor = "rgba(255, 255, 255, 0.4)";
  if (props.foil === "gold") gradientColor = "rgba(255, 240, 180, 0.5)";
  if (props.foil === "rose-gold") gradientColor = "rgba(255, 210, 215, 0.5)";
  if (props.foil === "holo") gradientColor = "rgba(240, 200, 255, 0.6)";

  return {
    background: `radial-gradient(circle at ${shineX.value}% ${shineY.value}%, ${gradientColor} 0%, transparent 65%)`,
    opacity: shineOpacity.value,
  };
});

function onPointerDown() {
  isHovered.value = true;
  shineOpacity.value = 0.65;
}

function onPointerMove(e) {
  if (!cardRef.value) return;
  isHovered.value = true;

  const rect = cardRef.value.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Calculate relative cursor position inside the card (coordinates centered around card origin)
  const x = e.clientX - rect.left - width / 2;
  const y = e.clientY - rect.top - height / 2;

  // Convert coordinates to 3D rotation angles (limit rotation to +/- 14 degrees)
  rotateY.value = (x / (width / 2)) * 14;
  rotateX.value = -(y / (height / 2)) * 14;

  // Shine position tracker
  shineX.value = ((e.clientX - rect.left) / width) * 100;
  shineY.value = ((e.clientY - rect.top) / height) * 100;
  shineOpacity.value = 0.5;
}

function onPointerLeave() {
  isHovered.value = false;
  rotateX.value = 0;
  rotateY.value = 0;
  shineOpacity.value = 0;
}

function onPointerUp() {
  shineOpacity.value = 0.5;
}
</script>

<style scoped>
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
