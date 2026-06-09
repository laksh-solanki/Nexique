<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl font-bold tracking-tight">Catalog &middot; Add cards</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Add custom card models to MongoDB. They appear on customer collection pages after saving.
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

    <h2 class="font-display mb-3 text-xl font-bold">Added cards</h2>
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
        class="rounded-2xl border border-border bg-card p-4"
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
            @click="remove(item.id)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Loader2, Plus, Trash2 } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { collections } from "@/lib/collections-data";
import { createCustomModel, deleteCustomModel, listCustomModels } from "@/lib/store";

const toast = useToast();
const collectionList = Object.values(collections);
const items = ref([]);
const loading = ref(true);
const busy = ref(false);
const imageInput = ref(null);
const form = reactive({
  collection_slug: collectionList[0]?.slug || "",
  name: "",
  tag: "",
  tint: "",
  image_data_url: "",
});

onMounted(load);

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
