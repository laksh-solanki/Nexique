<template>
  <Teleport to="body">
    <div
      v-if="open && collection && model && variant"
      class="fixed inset-0 z-[80] flex items-end justify-center overflow-hidden px-0 pt-6 sm:items-center sm:px-4 sm:py-6"
    >
      <button
        class="absolute inset-0 bg-primary/55 backdrop-blur-sm"
        type="button"
        aria-label="Close preview dialog"
        @click="close"
      />

      <section
        class="relative flex h-[calc(100dvh_-_0.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-card sm:h-auto sm:max-h-[calc(100dvh_-_3rem)] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-preview-title"
        @click.stop
      >
        <header
          class="sticky top-0 z-10 flex shrink-0 flex-col gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-accent">
              {{ collection.name }}
            </p>
            <h2
              id="variant-preview-title"
              class="font-display truncate text-xl font-bold tracking-tight sm:text-2xl"
            >
              {{ dialogTitle }}
            </h2>
            <p v-if="modelPriceLabel" class="mt-1 text-sm font-semibold text-primary">
              {{ modelPriceLabel }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canZoomOut"
              aria-label="Zoom out"
              title="Zoom out"
              @click="zoomOut"
            >
              <ZoomOut class="h-4 w-4" />
            </button>
            <span
              class="inline-flex h-10 min-w-16 items-center justify-center rounded-full border border-border bg-background px-3 text-xs font-semibold tabular-nums text-muted-foreground"
            >
              {{ zoom }}%
            </span>
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canZoomIn"
              aria-label="Zoom in"
              title="Zoom in"
              @click="zoomIn"
            >
              <ZoomIn class="h-4 w-4" />
            </button>

            <button
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:px-4"
              @click="openOrderForm"
            >
              <ShoppingBag class="h-4 w-4" />
              Order Now
            </button>

            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-accent/50 hover:text-accent"
              aria-label="Close"
              title="Close"
              @click="close"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </header>

        <div
          class="grid flex-1 overflow-y-auto lg:min-h-0 lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_420px]"
        >
          <!-- Left Column: Personalised Card Preview -->
          <div
            class="bg-secondary/50 p-3 sm:p-5 lg:min-h-0 lg:overflow-y-auto flex items-center justify-center"
          >
            <div
              ref="previewScroller"
              class="overflow-auto rounded-xl border border-border bg-background p-3 sm:p-4 w-full flex h-[50vh] min-h-[300px] sm:h-[60vh] sm:min-h-[380px] lg:h-[70vh]"
            >
              <!-- Outer wrapper that reserves the scaled space for scrollbars -->
              <div
                class="relative flex items-center justify-center shrink-0 m-auto"
                :style="zoomFrameStyle"
              >
                <!-- Inner container that actually applies the CSS transform scale -->
                <div
                  class="origin-center transition-transform duration-200 absolute"
                  :style="zoomTransformStyle"
                >
                  <DesignPreview
                    :image-src="variant.imageSrc"
                    :image-alt="variant.imageAlt"
                    :image-loading="variant.imageLoading"
                    :image-error="variant.imageError"
                    :title="model?.name || title || ''"
                    :tint="model.tint"
                    :icon="collection.icon"
                    :variant="variant"
                    :font-class="selectedFont"
                    :custom-message="defaultCardMessage"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Personalization & Order Workspace -->
          <aside
            ref="orderPanel"
            class="scroll-mt-2 border-t border-border bg-card p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0"
          >
            <!-- Design Workspace Tabs -->
            <div class="mb-5 flex border-b border-border">
              <button
                type="button"
                class="flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                :class="
                  activeTab === 'personalize'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                "
                @click="activeTab = 'personalize'"
              >
                1. Personalise
              </button>
              <button
                type="button"
                class="flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                :class="
                  activeTab === 'order'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                "
                @click="activeTab = 'order'"
              >
                2. Order Desk
              </button>
            </div>

            <!-- Tab Content: Personalize -->
            <div v-show="activeTab === 'personalize'" class="space-y-6">
              <div>
                <h3 class="font-display text-xl font-bold tracking-tight">Personalise Card</h3>
                <p class="text-xs text-muted-foreground mt-1">
                  Customise wording, foils, and papers in real-time.
                </p>
              </div>

              <!-- Card Title Wording -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >Card Title</label
                >
                <input
                  v-model="customTitle"
                  type="text"
                  placeholder="E.g., Happy Birthday"
                  class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <!-- Card Message -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >Personal Message</label
                >
                <textarea
                  v-model="customMessage"
                  rows="3"
                  placeholder="Type your message to print on the card..."
                  class="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <!-- Typography Font Selection -->
              <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >Calligraphy Font</label
                >
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="fontOpt in fontOptions"
                    :key="fontOpt.class"
                    type="button"
                    class="click-pop text-left rounded-lg border p-2.5 transition flex flex-col justify-between h-16"
                    :class="[
                      selectedFont === fontOpt.class
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground',
                    ]"
                    @click="selectedFont = fontOpt.class"
                  >
                    <span class="text-[9px] uppercase tracking-wider opacity-60">{{
                      fontOpt.name
                    }}</span>
                    <span
                      :class="fontOpt.class"
                      class="text-xs font-semibold truncate leading-none mt-1"
                      >{{ fontOpt.preview }}</span
                    >
                  </button>
                </div>
              </div>

              <div class="pt-4 border-t border-border">
                <button
                  type="button"
                  class="click-pop ripple w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-accent"
                  @click="openOrderForm"
                >
                  Confirm Details &amp; Order
                </button>
              </div>
            </div>

            <!-- Tab Content: Order Desk -->
            <div v-show="activeTab === 'order'" class="space-y-4">
              <div class="mb-5">
                <h3 class="font-display text-xl font-bold tracking-tight">Order Desk</h3>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ orderSummary }}
                </p>
              </div>
              <OrderForm
                :collection-slug="collection.slug"
                :collection-name="collection.name"
                :model-slug="orderModelSlug"
                :model-name="orderModelName"
                :design-variant="orderDesignVariant"
                :initial-message="generatedInstructions"
                @submitted="handleSubmitted"
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { ShoppingBag, X, ZoomIn, ZoomOut } from "@lucide/vue";

import OrderForm from "@/components/OrderForm.vue";
import DesignPreview from "@/components/DesignPreview.vue";
import { formatPrice } from "@/lib/pricing";

const ZOOM_MIN = 75;
const ZOOM_MAX = 250;
const ZOOM_STEP = 25;

const isMobile = ref(typeof window !== "undefined" && window.innerWidth < 640);

function updateMobileFlag() {
  isMobile.value = window.innerWidth < 640;
}

onMounted(() => {
  updateMobileFlag();
  window.addEventListener("resize", updateMobileFlag);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateMobileFlag);
});

const baseWidth = computed(() => (isMobile.value ? 288 : 340));
const baseHeight = computed(() => (isMobile.value ? 384 : 460));

const props = defineProps({
  open: { type: Boolean, default: false },
  collection: { type: Object, default: null },
  model: { type: Object, default: null },
  variant: { type: Object, default: null },
  title: { type: String, default: "" },
  summary: { type: String, default: "" },
  orderModelSlug: { type: String, default: "" },
  orderModelName: { type: String, default: "" },
  orderDesignVariant: { type: String, default: null },
});

const emit = defineEmits(["close"]);
const zoom = ref(100);
const orderPanel = ref(null);
const previewScroller = ref(null);

// Personalization State
const activeTab = ref("personalize");
const customTitle = ref("");
const customMessage = ref("");
const selectedFont = ref("");

let previousBodyOverflow = "";

const canZoomOut = computed(() => zoom.value > ZOOM_MIN);
const canZoomIn = computed(() => zoom.value < ZOOM_MAX);
const canDragPreview = computed(() => zoom.value > 100);

const dialogTitle = computed(() => {
  if (props.title) return props.title;
  return [props.model?.name, props.variant?.name].filter(Boolean).join(" - ");
});
const modelPriceLabel = computed(() => props.model?.price_label || formatPrice(props.model?.price));
const orderSummary = computed(() => {
  if (props.summary) return props.summary;
  return [props.model?.name, props.variant?.name, props.collection?.name]
    .filter(Boolean)
    .join(" - ");
});
const orderModelSlug = computed(() => props.orderModelSlug || props.model?.slug || "");
const orderModelName = computed(() => props.orderModelName || props.model?.name || "");
const orderDesignVariant = computed(() => props.orderDesignVariant ?? props.variant?.name ?? "");

const zoomFrameStyle = computed(() => {
  const scale = zoom.value / 100;
  return {
    width: `${baseWidth.value * scale}px`,
    height: `${baseHeight.value * scale}px`,
  };
});

const zoomTransformStyle = computed(() => {
  const scale = zoom.value / 100;
  return {
    width: `${baseWidth.value}px`,
    height: `${baseHeight.value}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  };
});

const fontOptions = [
  { class: "", name: "Default Serif", preview: "Cormorant Garamond" },
  { class: "font-cursive-hand", name: "Calligraphy Hand", preview: "Sacramento Script" },
  { class: "font-cursive-lux", name: "Luxury Cursive", preview: "Great Vibes Calligraphy" },
  { class: "font-serif-disp", name: "Editorial Display", preview: "Cinzel Classic" },
];

const defaultMessages = {
  "greeting-cards":
    "Wishing you a beautiful day filled with joy, laughter, and unforgettable moments.",
  "wedding-cards":
    "Together with their families, invite you to celebrate their marriage. Honor us with your presence.",
  "business-cards": "Bespoke Card Studio \u2022 Custom Letterpress \u2022 Hand-Mixed Ink",
  "valentine-special": "You have my whole heart for my whole life. Happy Valentine's Day, my love.",
};

const defaultCardMessage = computed(() => {
  const slug = props.collection?.slug || "";
  return (
    defaultMessages[slug] ||
    "Wishing you a wonderful celebration filled with love, laughter, and beautiful memories."
  );
});

const generatedInstructions = computed(() => {
  const fontName = fontOptions.find((f) => f.class === selectedFont.value)?.name || "Default Serif";

  return `Personalisation Specifications:
- Card Title/Name: "${customTitle.value}"
- Card Text/Message: "${customMessage.value}"
- Selected Font Style: ${fontName}`;
});

function resetDialogState() {
  zoom.value = 100;
  activeTab.value = "personalize";
  customTitle.value = props.model?.name || props.title || "";

  const slug = props.collection?.slug || "";
  customMessage.value =
    defaultMessages[slug] ||
    "Wishing you a wonderful celebration filled with love, laughter, and beautiful memories.";

  selectedFont.value = "";

  endPreviewDrag();
  nextTick(() => {
    if (!previewScroller.value) return;
    previewScroller.value.scrollLeft = 0;
    previewScroller.value.scrollTop = 0;
  });
}

function zoomOut() {
  zoom.value = Math.max(ZOOM_MIN, zoom.value - ZOOM_STEP);
  if (!canDragPreview.value) endPreviewDrag();
}

function zoomIn() {
  zoom.value = Math.min(ZOOM_MAX, zoom.value + ZOOM_STEP);
}

async function openOrderForm() {
  activeTab.value = "order";
  await nextTick();
  orderPanel.value?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function close() {
  emit("close");
}

function handleSubmitted() {
  close();
}

function endPreviewDrag(event) {
  if (event?.currentTarget) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") close();
}

function lockBodyScroll() {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow;
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      resetDialogState();
      lockBodyScroll();
      window.addEventListener("keydown", handleKeydown);
    } else {
      unlockBodyScroll();
      window.removeEventListener("keydown", handleKeydown);
    }
  },
);

watch(
  () => props.variant?.slug,
  () => {
    if (props.open) resetDialogState();
  },
);

onBeforeUnmount(() => {
  if (props.open) unlockBodyScroll();
  window.removeEventListener("keydown", handleKeydown);
});
</script>
