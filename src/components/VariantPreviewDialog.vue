<template>
  <Teleport to="body">
    <div
      v-if="open && collection && model && variant"
      class="fixed inset-0 z-[80] flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6"
    >
      <button
        class="absolute inset-0 bg-primary/55 backdrop-blur-sm"
        type="button"
        aria-label="Close preview dialog"
        @click="close"
      />

      <section
        class="relative flex max-h-[calc(100vh-1rem)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-card sm:max-h-[calc(100vh-3rem)]"
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
              {{ model.name }} - {{ variant.name }}
            </h2>
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
              class="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              @click="openOrderForm"
            >
              <ShoppingBag class="h-4 w-4" />
              Order now
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
          class="grid min-h-0 flex-1 overflow-hidden"
          :class="showOrderForm ? 'lg:grid-cols-[minmax(0,1fr)_420px]' : 'lg:grid-cols-1'"
        >
          <div class="min-h-0 overflow-y-auto bg-secondary/50 p-3 sm:p-5">
            <div
              ref="previewScroller"
              class="h-[62vh] min-h-[340px] overflow-auto rounded-xl border border-border bg-background p-4 sm:h-[70vh]"
              :class="previewDragClass"
              @pointerdown="startPreviewDrag"
              @pointermove="dragPreview"
              @pointerup="endPreviewDrag"
              @pointercancel="endPreviewDrag"
              @pointerleave="endPreviewDrag"
            >
              <div
                class="flex items-center justify-center transition-[width,height] duration-200"
                :style="zoomFrameStyle"
              >
                <img
                  v-if="variant.imageSrc"
                  :src="variant.imageSrc"
                  :alt="variant.imageAlt || `${model.name} ${variant.name} design`"
                  draggable="false"
                  class="max-h-full max-w-full rounded-lg object-contain shadow-card"
                  @dragstart.prevent
                />
                <div v-else class="w-full max-w-md">
                  <VariantPreview
                    :variant="variant"
                    :tint="model.tint"
                    :icon="collection.icon"
                    :title="model.name"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside
            v-if="showOrderForm"
            ref="orderPanel"
            class="min-h-0 overflow-y-auto border-t border-border bg-card p-4 sm:p-6 lg:border-l lg:border-t-0"
          >
            <div class="mb-5">
              <h3 class="font-display text-2xl font-bold tracking-tight">Order this card</h3>
              <p class="text-sm text-muted-foreground">
                {{ model.name }} - {{ variant.name }} - {{ collection.name }}
              </p>
            </div>
            <OrderForm
              :collection-slug="collection.slug"
              :collection-name="collection.name"
              :model-slug="model.slug"
              :model-name="model.name"
              :design-variant="variant.name"
              @submitted="handleSubmitted"
            />
          </aside>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { ShoppingBag, X, ZoomIn, ZoomOut } from "@lucide/vue";

import OrderForm from "@/components/OrderForm.vue";
import VariantPreview from "@/components/VariantPreview.vue";

const ZOOM_MIN = 75;
const ZOOM_MAX = 250;
const ZOOM_STEP = 25;

const props = defineProps({
  open: { type: Boolean, default: false },
  collection: { type: Object, default: null },
  model: { type: Object, default: null },
  variant: { type: Object, default: null },
});

const emit = defineEmits(["close"]);
const zoom = ref(100);
const showOrderForm = ref(false);
const orderPanel = ref(null);
const previewScroller = ref(null);
const isDraggingPreview = ref(false);
const dragPoint = {
  x: 0,
  y: 0,
};
let previousBodyOverflow = "";

const canZoomOut = computed(() => zoom.value > ZOOM_MIN);
const canZoomIn = computed(() => zoom.value < ZOOM_MAX);
const canDragPreview = computed(() => zoom.value > 100);
const previewDragClass = computed(() => {
  if (!canDragPreview.value) return "";
  return isDraggingPreview.value
    ? "cursor-grabbing select-none touch-none"
    : "cursor-grab touch-none";
});
const zoomFrameStyle = computed(() => ({
  width: `${zoom.value}%`,
  minWidth: "100%",
  height: `${zoom.value}%`,
  minHeight: "100%",
}));

function resetDialogState() {
  zoom.value = 100;
  showOrderForm.value = false;
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
  showOrderForm.value = true;
  await nextTick();
  orderPanel.value?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function close() {
  emit("close");
}

function handleSubmitted() {
  close();
}

function startPreviewDrag(event) {
  if (!canDragPreview.value) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;

  isDraggingPreview.value = true;
  dragPoint.x = event.clientX;
  dragPoint.y = event.clientY;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function dragPreview(event) {
  if (!isDraggingPreview.value || !previewScroller.value) return;

  const deltaX = event.clientX - dragPoint.x;
  const deltaY = event.clientY - dragPoint.y;
  previewScroller.value.scrollLeft -= deltaX;
  previewScroller.value.scrollTop -= deltaY;
  dragPoint.x = event.clientX;
  dragPoint.y = event.clientY;
  event.preventDefault();
}

function endPreviewDrag(event) {
  if (event?.currentTarget) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }
  isDraggingPreview.value = false;
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
