<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl font-bold tracking-tight">Catalog &middot; Products</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        View every base product and add custom card models to MongoDB for customer collection pages.
      </p>
    </div>

    <form
      class="mb-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
      @submit.prevent="addModel"
    >
      <div class="space-y-1.5">
        <label for="collection_slug" class="text-sm font-medium">Collection</label>
        <select
          id="collection_slug"
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
        <label for="name" class="text-sm font-medium">Card name</label>
        <input
          id="name"
          v-model.trim="form.name"
          name="name"
          required
          maxlength="100"
          placeholder="e.g. Golden Sunset"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div class="space-y-1.5">
        <label for="tag" class="text-sm font-medium">Tag</label>
        <input
          id="tag"
          v-model.trim="form.tag"
          name="tag"
          required
          maxlength="40"
          placeholder="e.g. Premium"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div class="space-y-1.5">
        <label for="tint" class="text-sm font-medium">Tailwind tint (optional)</label>
        <input
          id="tint"
          v-model.trim="form.tint"
          name="tint"
          maxlength="100"
          placeholder="from-rose-300 to-amber-100"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div class="space-y-1.5 sm:col-span-2">
        <label for="image" class="text-sm font-medium">Preview image (optional)</label>
        <input
          id="image"
          ref="imageInput"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          @change="setImage"
        />
        <p class="text-xs text-muted-foreground">
          Use a compressed PNG, JPG, JPEG, or WEBP under 650 KB for fast loading.
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
      <div class="sm:col-span-2">
        <button
          type="submit"
          :disabled="busy"
          class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
          <Plus v-else class="h-4 w-4" />
          Add card
        </button>
      </div>
    </form>

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
        <div class="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
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
            </div>
            <button
              v-if="product.editable"
              type="button"
              class="shrink-0 text-muted-foreground transition hover:text-destructive"
              aria-label="Delete custom product"
              @click.stop="remove(product.id)"
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
          </div>
          <button
            type="button"
            class="text-muted-foreground transition hover:text-destructive"
            @click.stop="remove(item.id)"
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
import { collections, getModelPreviewAsset } from "@/lib/collections-data";
import {
  createCustomModel,
  deleteCustomModel,
  listCustomModels,
  updateCustomModel,
} from "@/lib/store";

const toast = useToast();
const collectionList = Object.values(collections);
const items = ref([]);
const loading = ref(true);
const busy = ref(false);
const editBusy = ref(false);
const imageInput = ref(null);
const detailImageInput = ref(null);
const search = ref("");
const selectedCollection = ref("all");
const selectedProduct = ref(null);
const form = reactive({
  collection_slug: collectionList[0]?.slug || "",
  name: "",
  tag: "",
  tint: "",
  image_data_url: "",
});
const detailForm = reactive({
  collection_slug: "",
  name: "",
  tag: "",
  tint: "",
  image_data_url: "",
});
const staticProducts = computed(() =>
  collectionList.flatMap((collection) =>
    collection.models.map((model) => {
      const preview = getModelPreviewAsset(collection.slug, model.name);

      return {
        ...model,
        id: `base:${collection.slug}:${model.slug}`,
        collection_slug: collection.slug,
        collection_name: collection.name,
        editable: false,
        path: `/collections/${collection.slug}/${model.slug}`,
        preview: preview ? { src: preview.src, alt: preview.alt } : null,
        source: "Base",
        sourceClass: "bg-primary/10 text-primary",
      };
    }),
  ),
);
const customProducts = computed(() => items.value.map(toCustomProduct));
const allProducts = computed(() => [...staticProducts.value, ...customProducts.value]);
const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();

  return allProducts.value.filter((product) => {
    const matchesCollection =
      selectedCollection.value === "all" || product.collection_slug === selectedCollection.value;
    const matchesSearch =
      !term ||
      [product.name, product.collection_name, product.tag, product.slug]
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
    editable: true,
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
    items.value = await listCustomModels();
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

  busy.value = true;
  try {
    await createCustomModel({
      collection_slug: form.collection_slug,
      name: form.name,
      tag: form.tag,
      tint: form.tint || "from-rose-200 to-amber-100",
      image_data_url: form.image_data_url,
    });
    toast.success("Card added");
    form.name = "";
    form.tag = "";
    form.tint = "";
    clearImage();
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not add card.");
  } finally {
    busy.value = false;
  }
}

function setImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    toast.error("Use PNG, JPG, JPEG, or WEBP.");
    clearImage();
    return;
  }
  if (file.size > 650 * 1024) {
    toast.error("Image must be under 650 KB.");
    clearImage();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    form.image_data_url = String(reader.result || "");
  };
  reader.onerror = () => toast.error("Could not read image.");
  reader.readAsDataURL(file);
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

function setDetailImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    toast.error("Use PNG, JPG, JPEG, or WEBP.");
    clearDetailImage();
    return;
  }
  if (file.size > 650 * 1024) {
    toast.error("Image must be under 650 KB.");
    clearDetailImage();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    detailForm.image_data_url = String(reader.result || "");
  };
  reader.onerror = () => toast.error("Could not read image.");
  reader.readAsDataURL(file);
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

  editBusy.value = true;
  try {
    const updated = await updateCustomModel(selectedProduct.value.id, {
      collection_slug: detailForm.collection_slug,
      name: detailForm.name,
      tag: detailForm.tag,
      tint: detailForm.tint || "from-rose-200 to-amber-100",
      image_data_url: detailForm.image_data_url,
    });
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

async function remove(id) {
  if (!confirm("Delete this card?")) return;
  try {
    await deleteCustomModel(id);
    toast.success("Deleted");
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not delete card.");
  }
}
</script>
