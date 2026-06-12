<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold tracking-tight">Catalog &middot; Products</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          View every base product and add custom card models to MongoDB for customer collection
          pages.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90"
        @click="openAddDialog"
      >
        <Plus class="h-4 w-4" />
        Add card
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="addDialogOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddDialog"
      >
        <section
          class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
          aria-modal="true"
          role="dialog"
          aria-labelledby="add-card-title"
        >
          <div
            class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-5 py-4 backdrop-blur"
          >
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                New Mongo product
              </p>
              <h2 id="add-card-title" class="font-display mt-1 text-2xl font-bold">Add card</h2>
            </div>
            <button
              type="button"
              class="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Close add card dialog"
              @click="closeAddDialog"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <form class="grid gap-4 p-5 sm:grid-cols-2" @submit.prevent="addModel">
            <div class="space-y-1.5">
              <label for="add_collection_slug" class="text-sm font-medium">Collection</label>
              <select
                id="add_collection_slug"
                v-model="form.collection_slug"
                name="collection_slug"
                required
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option
                  v-for="collection in collectionList"
                  :key="collection.slug"
                  :value="collection.slug"
                >
                  {{ collection.name }}
                </option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label for="add_name" class="text-sm font-medium">Card name</label>
              <input
                id="add_name"
                v-model.trim="form.name"
                name="name"
                required
                maxlength="100"
                placeholder="e.g. Golden Sunset"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="space-y-1.5">
              <label for="add_tag" class="text-sm font-medium">Tag</label>
              <input
                id="add_tag"
                v-model.trim="form.tag"
                name="tag"
                required
                maxlength="40"
                placeholder="e.g. Premium"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="space-y-1.5">
              <label for="add_tint" class="text-sm font-medium">Tailwind tint (optional)</label>
              <input
                id="add_tint"
                v-model.trim="form.tint"
                name="tint"
                maxlength="100"
                placeholder="from-rose-300 to-amber-100"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label for="add_subcategory_names" class="text-sm font-medium">
                Subcategory names
              </label>
              <input
                id="add_subcategory_names"
                v-model.trim="form.subcategory_names"
                name="subcategory_names"
                required
                maxlength="240"
                placeholder="Classic, Modern, Premium"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p class="text-xs text-muted-foreground">
                Type each subcategory name separated by commas. These become the design options
                customers see on the card page.
              </p>
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label for="add_image" class="text-sm font-medium">Preview image (optional)</label>
              <input
                id="add_image"
                ref="imageInput"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                @change="setImage"
              />
              <p class="text-xs text-muted-foreground">
                Upload PNG, JPG, JPEG, or WEBP up to 5 MB. Large files are optimized before saving.
              </p>
              <div v-if="form.image_data_url" class="mt-3 flex items-center gap-3">
                <img
                  :src="form.image_data_url"
                  alt="Selected card preview"
                  class="h-20 w-28 rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  class="text-sm font-semibold text-destructive transition hover:underline"
                  @click="clearImage"
                >
                  Remove image
                </button>
              </div>
            </div>
            <div
              class="flex flex-wrap items-center gap-3 border-t border-border pt-4 sm:col-span-2"
            >
              <button
                type="submit"
                :disabled="busy"
                class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
                <Plus v-else class="h-4 w-4" />
                Add card
              </button>
              <button
                type="button"
                :disabled="busy"
                class="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-secondary disabled:opacity-60"
                @click="closeAddDialog"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>

    <section class="mb-8">
      <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">All products</p>
          <h2 class="font-display mt-1 text-2xl font-bold tracking-tight">Complete catalog</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Showing {{ filteredProducts.length }} of {{ allProducts.length }} product{{
              allProducts.length === 1 ? "" : "s"
            }}
            across {{ collectionList.length }} collections.
          </p>
        </div>
        <div
          class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-primary-foreground transition hover:bg-primary/90"
            @click="openAddDialog"
          >
            <Plus class="h-3.5 w-3.5" />
            Add card
          </button>
          <span class="rounded-full bg-secondary px-3 py-1 text-muted-foreground">
            Base {{ staticProducts.length }}
          </span>
          <span class="rounded-full bg-accent/10 px-3 py-1 text-accent">
            Added {{ items.length }}
          </span>
        </div>
      </div>

      <div
        class="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_220px]"
      >
        <label class="relative block">
          <span class="sr-only">Search products</span>
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            v-model.trim="search"
            type="search"
            placeholder="Search product, collection, or tag"
            class="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
          />
        </label>
        <label class="block">
          <span class="sr-only">Filter collection</span>
          <select
            v-model="selectedCollection"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All collections</option>
            <option
              v-for="collection in collectionList"
              :key="collection.slug"
              :value="collection.slug"
            >
              {{ collection.name }}
            </option>
          </select>
        </label>
      </div>

      <div v-if="loading" class="flex justify-center py-6">
        <Loader2 class="h-5 w-5 animate-spin text-accent" />
      </div>
      <div
        v-else-if="filteredProducts.length === 0"
        class="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
      >
        No products match this filter.
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          role="button"
          tabindex="0"
          class="cursor-pointer rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          :aria-label="`Open details for ${product.name}`"
          @click="openProduct(product)"
          @keydown.enter.prevent="openProduct(product)"
          @keydown.space.prevent="openProduct(product)"
        >
          <div
            class="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br"
            :class="product.preview ? 'from-stone-100 to-cream' : product.tint"
          >
            <img
              v-if="product.preview"
              :src="product.preview.src"
              :alt="product.preview.alt"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <CategoryCardArt v-else :slug="product.collection_slug" />
          </div>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  :class="product.sourceClass"
                >
                  {{ product.source }}
                </span>
                <span
                  class="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {{ product.tag }}
                </span>
              </div>
              <h3 class="font-display truncate text-lg font-bold">{{ product.name }}</h3>
              <p class="text-xs text-muted-foreground">
                {{ product.collection_name }} &middot; {{ product.slug }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="name in variantNamesFor(product.variant_slugs).slice(0, 4)"
                  :key="`${product.id}-${name}`"
                  class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {{ name }}
                </span>
                <span
                  v-if="variantNamesFor(product.variant_slugs).length > 4"
                  class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  +{{ variantNamesFor(product.variant_slugs).length - 4 }}
                </span>
              </div>
            </div>
            <button
              v-if="product.deletable"
              type="button"
              class="shrink-0 text-muted-foreground transition hover:text-destructive"
              :aria-label="`Delete ${product.name}`"
              @click.stop="remove(product)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
          <RouterLink
            :to="product.path"
            class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:underline"
            @click.stop
          >
            <Eye class="h-4 w-4" />
            View product
          </RouterLink>
        </article>
      </div>
    </section>

    <h2 class="font-display mb-3 text-xl font-bold">Custom Mongo products</h2>
    <div v-if="loading" class="flex justify-center py-6">
      <Loader2 class="h-5 w-5 animate-spin text-accent" />
    </div>
    <div
      v-else-if="items.length === 0"
      class="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
    >
      No custom cards yet.
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        @click="openAddDialog"
      >
        <Plus class="h-4 w-4" />
        Add card
      </button>
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.id"
        role="button"
        tabindex="0"
        class="cursor-pointer rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        :aria-label="`Open details for ${item.name}`"
        @click="openCustomItem(item)"
        @keydown.enter.prevent="openCustomItem(item)"
        @keydown.space.prevent="openCustomItem(item)"
      >
        <div
          class="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br"
          :class="item.image_data_url ? '' : item.tint"
        >
          <img
            v-if="item.image_data_url"
            :src="item.image_data_url"
            :alt="item.image_alt || item.name"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-display font-bold">{{ item.name }}</h3>
            <p class="text-xs text-muted-foreground">
              {{ collections[item.collection_slug]?.name || item.collection_slug }} &middot;
              {{ item.tag }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="name in variantNamesFor(item.variant_slugs).slice(0, 3)"
                :key="`${item.id}-${name}`"
                class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
              >
                {{ name }}
              </span>
              <span
                v-if="variantNamesFor(item.variant_slugs).length > 3"
                class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
              >
                +{{ variantNamesFor(item.variant_slugs).length - 3 }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="text-muted-foreground transition hover:text-destructive"
            @click.stop="remove(item)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedProduct"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeProductDialog"
      >
        <section
          class="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
          aria-modal="true"
          role="dialog"
        >
          <div
            class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-5 py-4 backdrop-blur"
          >
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ selectedProduct.editable ? "Edit product" : "Product details" }}
              </p>
              <h2 class="font-display mt-1 truncate text-2xl font-bold">
                {{ selectedProduct.name }}
              </h2>
            </div>
            <button
              type="button"
              class="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Close product details"
              @click="closeProductDialog"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="grid gap-6 p-5 lg:grid-cols-[260px_1fr]">
            <div>
              <div
                class="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br"
                :class="dialogPreview ? 'from-stone-100 to-cream' : dialogTint"
              >
                <img
                  v-if="dialogPreview"
                  :src="dialogPreview.src"
                  :alt="dialogPreview.alt"
                  class="h-full w-full object-cover"
                />
                <CategoryCardArt v-else :slug="dialogCollectionSlug" />
              </div>
              <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
                <span class="rounded-full px-3 py-1" :class="selectedProduct.sourceClass">
                  {{ selectedProduct.source }}
                </span>
                <span class="rounded-full bg-secondary px-3 py-1 text-muted-foreground">
                  {{ selectedProduct.tag }}
                </span>
              </div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="name in variantNamesFor(selectedProduct.variant_slugs)"
                  :key="`dialog-${selectedProduct.id}-${name}`"
                  class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {{ name }}
                </span>
              </div>
              <RouterLink
                :to="selectedProduct.path"
                class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:underline"
                @click="closeProductDialog"
              >
                <Eye class="h-4 w-4" />
                View product page
              </RouterLink>
            </div>

            <form
              v-if="selectedProduct.editable"
              class="space-y-4"
              @submit.prevent="saveProductDetails"
            >
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-1.5">
                  <label for="detail_collection_slug" class="text-sm font-medium">Collection</label>
                  <select
                    id="detail_collection_slug"
                    v-model="detailForm.collection_slug"
                    required
                    :disabled="selectedProduct.base"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option
                      v-for="collection in collectionList"
                      :key="collection.slug"
                      :value="collection.slug"
                    >
                      {{ collection.name }}
                    </option>
                  </select>
                  <p v-if="selectedProduct.base" class="text-xs text-muted-foreground">
                    Base cards stay in their original collection.
                  </p>
                </div>
                <div class="space-y-1.5">
                  <label for="detail_name" class="text-sm font-medium">Card name</label>
                  <input
                    id="detail_name"
                    v-model.trim="detailForm.name"
                    required
                    maxlength="100"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div class="space-y-1.5">
                  <label for="detail_tag" class="text-sm font-medium">Tag</label>
                  <input
                    id="detail_tag"
                    v-model.trim="detailForm.tag"
                    required
                    maxlength="40"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div class="space-y-1.5">
                  <label for="detail_tint" class="text-sm font-medium">Tailwind tint</label>
                  <input
                    id="detail_tint"
                    v-model.trim="detailForm.tint"
                    maxlength="120"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div class="space-y-1.5 rounded-xl border border-border p-3">
                <label for="detail_subcategory_names" class="text-sm font-medium">
                  Subcategory names
                </label>
                <input
                  id="detail_subcategory_names"
                  v-model.trim="detailForm.subcategory_names"
                  required
                  maxlength="240"
                  placeholder="Classic, Modern, Premium"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <p class="text-xs text-muted-foreground">
                  Type each subcategory name separated by commas. These are the design options
                  customers see on the card page.
                </p>
              </div>

              <div class="space-y-1.5">
                <label for="detail_image" class="text-sm font-medium">Preview image</label>
                <input
                  id="detail_image"
                  ref="detailImageInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  @change="setDetailImage"
                />
                <p class="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, or WEBP up to 5 MB. Large files are optimized before saving.
                </p>
                <div v-if="detailForm.image_data_url" class="mt-2">
                  <button
                    type="button"
                    class="text-sm font-semibold text-destructive transition hover:underline"
                    @click="clearDetailImage"
                  >
                    Remove image
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <button
                  type="submit"
                  :disabled="editBusy"
                  class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  <Loader2 v-if="editBusy" class="h-4 w-4 animate-spin" />
                  <Save v-else class="h-4 w-4" />
                  Save details
                </button>
                <button
                  type="button"
                  class="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                  @click="closeProductDialog"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div v-else class="space-y-4">
              <dl class="grid gap-3 text-sm">
                <div class="rounded-lg border border-border p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Collection
                  </dt>
                  <dd class="mt-1 font-medium">{{ selectedProduct.collection_name }}</dd>
                </div>
                <div class="rounded-lg border border-border p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Slug
                  </dt>
                  <dd class="mt-1 font-mono text-xs">{{ selectedProduct.slug }}</dd>
                </div>
                <div class="rounded-lg border border-border p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Source
                  </dt>
                  <dd class="mt-1 font-medium">Base catalog product</dd>
                </div>
              </dl>
              <p class="text-sm text-muted-foreground">
                Base products are managed in the source catalog. Add a Mongo product when you need
                an editable custom product.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Eye, Loader2, Plus, Save, Search, Trash2, X } from "@lucide/vue";

import CategoryCardArt from "@/components/CategoryCardArt.vue";
import { useToast } from "@/composables/useToast";
import {
  baseDesignVariantSlugs,
  collections,
  designVariantName,
  normalizeDesignVariantSlugs,
} from "@/lib/collections-data";
import {
  createCustomModel,
  deleteCustomModel,
  deleteModelOverride,
  listCustomModels,
  listModelOverrides,
  updateCustomModel,
  updateModelOverride,
} from "@/lib/store";

const toast = useToast();
const collectionList = Object.values(collections);
const items = ref([]);
const overrides = ref({});
const loading = ref(true);
const busy = ref(false);
const editBusy = ref(false);
const addDialogOpen = ref(false);
const imageInput = ref(null);
const detailImageInput = ref(null);
const search = ref("");
const selectedCollection = ref("all");
const selectedProduct = ref(null);
const maxImageBytes = 5 * 1024 * 1024;
const maxImageDataUrlLength = 900_000;
const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const form = reactive({
  collection_slug: collectionList[0]?.slug || "",
  name: "",
  tag: "",
  tint: "",
  image_data_url: "",
  subcategory_names: "",
});
const detailForm = reactive({
  collection_slug: "",
  name: "",
  tag: "",
  tint: "",
  image_data_url: "",
  subcategory_names: "",
});
const baseModelId = (collectionSlug, modelSlug) => `base:${collectionSlug}:${modelSlug}`;
const staticProducts = computed(() =>
  collectionList.flatMap((collection) =>
    collection.models
      .map((model) => {
        const id = baseModelId(collection.slug, model.slug);
        const override = overrides.value[id];
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
          id,
          source_model_id: id,
          base: true,
          collection_slug: collection.slug,
          collection_name: collection.name,
          slug: model.slug,
          name: override?.name || model.name,
          tag: override?.tag || model.tag,
          tint: override?.tint || model.tint,
          image_data_url: override?.image_data_url || "",
          variant_slugs: normalizeDesignVariantSlugs(
            override?.variant_slugs || model.variant_slugs,
            baseDesignVariantSlugs,
          ),
          editable: true,
          deletable: true,
          path: `/collections/${collection.slug}/${model.slug}`,
          preview: preview ? { src: preview.src, alt: preview.alt } : null,
          source: "Base",
          sourceClass: "bg-primary/10 text-primary",
        };
      })
      .filter(Boolean),
  ),
);
const customProducts = computed(() => items.value.map(toCustomProduct));
const allProducts = computed(() => [...customProducts.value, ...staticProducts.value]);
const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();

  return allProducts.value.filter((product) => {
    const matchesCollection =
      selectedCollection.value === "all" || product.collection_slug === selectedCollection.value;
    const matchesSearch =
      !term ||
      [product.name, product.collection_name, product.tag, product.slug, variantSummary(product)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

    return matchesCollection && matchesSearch;
  });
});
const dialogCollectionSlug = computed(() =>
  selectedProduct.value?.editable
    ? detailForm.collection_slug
    : selectedProduct.value?.collection_slug || collectionList[0]?.slug || "",
);
const dialogTint = computed(() =>
  selectedProduct.value?.editable
    ? detailForm.tint || "from-rose-200 to-amber-100"
    : selectedProduct.value?.tint || "from-rose-200 to-amber-100",
);
const dialogPreview = computed(() => {
  if (!selectedProduct.value) return null;

  if (selectedProduct.value.editable) {
    return detailForm.image_data_url
      ? {
          src: detailForm.image_data_url,
          alt: `${detailForm.name || selectedProduct.value.name} preview`,
        }
      : null;
  }

  return selectedProduct.value.preview;
});

onMounted(load);

function toCustomProduct(item) {
  return {
    ...item,
    collection_name: collections[item.collection_slug]?.name || item.collection_slug,
    variant_slugs: normalizeDesignVariantSlugs(item.variant_slugs),
    base: false,
    editable: true,
    deletable: true,
    path: `/collections/${item.collection_slug}/${item.slug}`,
    preview: item.image_data_url
      ? { src: item.image_data_url, alt: item.image_alt || `${item.name} card preview` }
      : null,
    source: "Added",
    sourceClass: "bg-accent/10 text-accent",
  };
}

async function load() {
  loading.value = true;
  try {
    const [customModels, modelOverrides] = await Promise.all([
      listCustomModels(),
      listModelOverrides(),
    ]);
    items.value = customModels;
    overrides.value = Object.fromEntries(
      modelOverrides.map((model) => [model.source_model_id, model]),
    );
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not load custom cards.");
  } finally {
    loading.value = false;
  }
}

async function addModel() {
  if (!form.collection_slug || !form.name || !form.tag) {
    toast.error("All fields required");
    return;
  }

  const variantSlugs = parseSubcategoryNames(form.subcategory_names);
  if (variantSlugs.length === 0) {
    toast.error("Enter at least one subcategory name.");
    return;
  }

  busy.value = true;
  try {
    await createCustomModel({
      collection_slug: form.collection_slug,
      name: form.name,
      tag: form.tag,
      tint: form.tint || "from-rose-200 to-amber-100",
      image_data_url: form.image_data_url,
      variant_slugs: variantSlugs,
    });
    toast.success("Card added");
    resetAddForm();
    addDialogOpen.value = false;
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not add card.");
  } finally {
    busy.value = false;
  }
}

function openAddDialog() {
  addDialogOpen.value = true;
}

function closeAddDialog() {
  if (busy.value) return;
  addDialogOpen.value = false;
  resetAddForm();
}

function resetAddForm() {
  form.name = "";
  form.tag = "";
  form.tint = "";
  form.subcategory_names = "";
  clearImage();
}

async function setImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const imageDataUrl = await prepareImageDataUrl(file, clearImage);
  if (imageDataUrl) form.image_data_url = imageDataUrl;
}

async function prepareImageDataUrl(file, clearSelection) {
  if (!allowedImageTypes.includes(file.type)) {
    toast.error("Use PNG, JPG, JPEG, or WEBP.");
    clearSelection();
    return "";
  }
  if (file.size > maxImageBytes) {
    toast.error("Image must be 5 MB or smaller.");
    clearSelection();
    return "";
  }

  try {
    const directDataUrl = await readFileAsDataUrl(file);
    if (directDataUrl.length <= maxImageDataUrlLength) return directDataUrl;

    const optimizedDataUrl = await optimizeImageFile(file);
    if (optimizedDataUrl.length <= maxImageDataUrlLength) {
      toast.success("Image optimized for saving.");
      return optimizedDataUrl;
    }

    toast.error("Image is too large to save. Try a smaller image.");
  } catch (err) {
    console.error(err);
    toast.error("Could not read image.");
  }

  clearSelection();
  return "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    image.src = url;
  });
}

function drawImage(image, maxDimension) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not optimize image.");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function optimizeImageFile(file) {
  const image = await loadImage(file);
  const maxDimensions = [1600, 1400, 1200, 1000, 800];
  const outputTypes = ["image/webp", "image/jpeg"];
  const qualityLevels = [0.86, 0.78, 0.7, 0.62, 0.54];
  let smallestDataUrl = "";

  for (const maxDimension of maxDimensions) {
    const canvas = drawImage(image, maxDimension);

    for (const outputType of outputTypes) {
      for (const quality of qualityLevels) {
        const dataUrl = canvas.toDataURL(outputType, quality);
        if (!smallestDataUrl || dataUrl.length < smallestDataUrl.length) {
          smallestDataUrl = dataUrl;
        }
        if (dataUrl.length <= maxImageDataUrlLength) return dataUrl;
      }
    }
  }

  return smallestDataUrl;
}

function clearImage() {
  form.image_data_url = "";
  if (imageInput.value) imageInput.value.value = "";
}

function openProduct(product) {
  selectedProduct.value = product;

  if (!product.editable) return;

  detailForm.collection_slug = product.collection_slug;
  detailForm.name = product.name;
  detailForm.tag = product.tag;
  detailForm.tint = product.tint || "from-rose-200 to-amber-100";
  detailForm.image_data_url = product.image_data_url || "";
  detailForm.subcategory_names = variantNamesFor(product.variant_slugs).join(", ");
  if (detailImageInput.value) detailImageInput.value.value = "";
}

function openCustomItem(item) {
  const product = customProducts.value.find((entry) => entry.id === item.id);
  if (product) openProduct(product);
}

function closeProductDialog() {
  if (editBusy.value) return;
  selectedProduct.value = null;
  if (detailImageInput.value) detailImageInput.value.value = "";
}

async function setDetailImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const imageDataUrl = await prepareImageDataUrl(file, clearDetailImage);
  if (imageDataUrl) detailForm.image_data_url = imageDataUrl;
}

function clearDetailImage() {
  detailForm.image_data_url = "";
  if (detailImageInput.value) detailImageInput.value.value = "";
}

async function saveProductDetails() {
  if (!selectedProduct.value?.editable) return;
  if (!detailForm.collection_slug || !detailForm.name || !detailForm.tag) {
    toast.error("Collection, name, and tag are required.");
    return;
  }

  const variantSlugs = parseSubcategoryNames(detailForm.subcategory_names);
  if (variantSlugs.length === 0) {
    toast.error("Enter at least one subcategory name.");
    return;
  }

  editBusy.value = true;
  try {
    const payload = {
      collection_slug: selectedProduct.value.base
        ? selectedProduct.value.collection_slug
        : detailForm.collection_slug,
      name: detailForm.name,
      tag: detailForm.tag,
      tint: detailForm.tint || "from-rose-200 to-amber-100",
      image_data_url: detailForm.image_data_url,
      variant_slugs: variantSlugs,
    };

    if (selectedProduct.value.base) {
      const sourceModelId = selectedProduct.value.source_model_id;
      await updateModelOverride(sourceModelId, payload);
      await load();
      const product = staticProducts.value.find((entry) => entry.id === sourceModelId);
      if (product) openProduct(product);
      toast.success("Base card updated");
      return;
    }

    const updated = await updateCustomModel(selectedProduct.value.id, payload);
    await load();
    const product =
      customProducts.value.find((entry) => entry.id === updated.id) || toCustomProduct(updated);
    openProduct(product);
    toast.success("Card updated");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not update card.");
  } finally {
    editBusy.value = false;
  }
}

function variantNamesFor(slugs) {
  return normalizeDesignVariantSlugs(slugs).map(designVariantName);
}

function variantSummary(product) {
  return variantNamesFor(product.variant_slugs).join(", ");
}

function parseSubcategoryNames(value) {
  const names = String(value || "")
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

  return names.length ? normalizeDesignVariantSlugs(names) : [];
}

async function remove(product) {
  if (!product) return;

  const message = product.base
    ? `Delete ${product.name}? This base card will be hidden from admin and customer catalog pages.`
    : `Delete ${product.name || "this card"}?`;
  if (!confirm(message)) return;

  try {
    if (product.base) {
      await deleteModelOverride(product.source_model_id || product.id);
      if (selectedProduct.value?.id === product.id) closeProductDialog();
    } else {
      await deleteCustomModel(product.id);
    }
    toast.success("Deleted");
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not delete card.");
  }
}
</script>
