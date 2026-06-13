<template>
  <div class="min-w-0">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Catalog &middot; Products
        </h1>
      </div>
      <button
        type="button"
        class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
        @click="openAddDialog"
      >
        <Plus class="h-4 w-4" />
        Add card
      </button>
    </div>

    <section class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in catalogStats"
        :key="stat.label"
        class="rounded-2xl border border-border bg-card p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {{ stat.label }}
          </p>
          <component :is="stat.icon" class="h-4 w-4 text-accent" />
        </div>
        <p class="font-display mt-3 text-3xl font-bold text-primary">{{ stat.value }}</p>
        <p class="mt-1 text-xs text-muted-foreground">{{ stat.note }}</p>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="addDialogOpen"
        class="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/50 px-0 pt-6 sm:items-center sm:p-4"
        @click.self="closeAddDialog"
      >
        <section
          class="flex max-h-[calc(100dvh_-_0.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:max-h-[min(820px,calc(100dvh_-_2rem))] sm:rounded-2xl"
          aria-modal="true"
          role="dialog"
          aria-labelledby="add-card-title"
        >
          <div
            class="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4"
          >
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                New Mongo product
              </p>
              <h2 id="add-card-title" class="font-display mt-1 text-2xl font-bold">Add card</h2>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Close add card dialog"
              @click="closeAddDialog"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <form
            class="grid min-h-0 gap-4 overflow-y-auto overscroll-contain p-4 sm:p-5 md:grid-cols-2"
            @submit.prevent="addModel"
          >
            <div class="min-w-0 space-y-1.5">
              <label for="add_collection_slug" class="text-sm font-medium">Collection</label>
              <select
                id="add_collection_slug"
                v-model="form.collection_slug"
                name="collection_slug"
                required
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <div class="min-w-0 space-y-1.5">
              <label for="add_name" class="text-sm font-medium">Card name</label>
              <input
                id="add_name"
                v-model.trim="form.name"
                name="name"
                required
                maxlength="100"
                placeholder="e.g. Golden Sunset"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="min-w-0 space-y-1.5">
              <label for="add_tag" class="text-sm font-medium">Tag</label>
              <input
                id="add_tag"
                v-model.trim="form.tag"
                name="tag"
                required
                maxlength="40"
                placeholder="e.g. Premium"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="min-w-0 space-y-1.5">
              <label for="add_price" class="text-sm font-medium">Price (INR)</label>
              <input
                id="add_price"
                v-model.trim="form.price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                required
                placeholder="499"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="min-w-0 space-y-1.5 md:col-span-2">
              <label for="add_tint" class="text-sm font-medium">Tailwind tint (optional)</label>
              <input
                id="add_tint"
                v-model.trim="form.tint"
                name="tint"
                maxlength="100"
                placeholder="from-rose-300 to-amber-100"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="min-w-0 space-y-1.5 md:col-span-2">
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
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p class="text-xs text-muted-foreground">
                Type each subcategory name separated by commas. These become the design options
                customers see on the card page.
              </p>
            </div>
            <div class="min-w-0 space-y-1.5 md:col-span-2">
              <label for="add_image" class="text-sm font-medium">Preview image (optional)</label>
              <input
                id="add_image"
                ref="imageInput"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                @change="setImage"
              />
              <p class="text-xs text-muted-foreground">
                Upload PNG, JPG, JPEG, or WEBP up to 5 MB. Large files are optimized before saving.
              </p>
              <div
                v-if="form.image_data_url"
                class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <img
                  :src="form.image_data_url"
                  alt="Selected card preview"
                  class="h-24 w-full rounded-md border border-border object-cover sm:h-20 sm:w-28"
                />
                <button
                  type="button"
                  class="text-left text-sm font-semibold text-destructive transition hover:underline"
                  @click="clearImage"
                >
                  Remove image
                </button>
              </div>
            </div>
            <div
              class="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-background pt-4 sm:flex-row sm:items-center sm:justify-end md:col-span-2"
            >
              <button
                type="button"
                :disabled="busy"
                class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-secondary disabled:opacity-60 sm:w-auto"
                @click="closeAddDialog"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="busy"
                class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
              >
                <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
                <Plus v-else class="h-4 w-4" />
                Add card
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>

    <section class="mb-8">
      <div
        class="mb-4 grid gap-4 rounded-2xl border border-border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_220px]"
      >
        <div class="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label class="relative block self-start">
            <span class="sr-only">Search products</span>
            <Search
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              v-model.trim="search"
              type="search"
              placeholder="Search product, collection, tag, price"
              class="min-h-11 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
            />
          </label>
          <label class="block self-start">
            <span class="sr-only">Filter collection</span>
            <select
              v-model="selectedCollection"
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-3 rounded-full border border-border bg-background p-1">
            <button
              v-for="option in sourceOptions"
              :key="option.value"
              type="button"
              class="inline-flex min-h-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition"
              :class="
                selectedSource === option.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              "
              @click="selectedSource = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <label class="block">
            <span class="sr-only">Sort products</span>
            <select
              v-model="sortMode"
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A-Z</option>
              <option value="collection">Collection</option>
              <option value="price-desc">Price high-low</option>
              <option value="price-asc">Price low-high</option>
            </select>
          </label>
        </div>

        <div
          class="flex flex-col gap-3 lg:col-span-2 xl:flex-row xl:items-center xl:justify-between"
        >
          <div
            class="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground"
          >
            <SlidersHorizontal class="h-4 w-4 text-accent" />
            <span> Showing {{ filteredProducts.length }} of {{ allProducts.length }} </span>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="rounded-full bg-secondary px-3 py-1 text-foreground transition hover:bg-muted"
              @click="clearFilters"
            >
              Clear filters
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="inline-flex rounded-full border border-border bg-background p-1">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full transition"
                :class="
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                "
                aria-label="Grid view"
                title="Grid view"
                @click="viewMode = 'grid'"
              >
                <LayoutGrid class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full transition"
                :class="
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                "
                aria-label="List view"
                title="List view"
                @click="viewMode = 'list'"
              >
                <List class="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              class="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="load"
            >
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              <RefreshCw v-else class="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              class="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="filteredProducts.length === 0"
              @click="exportCatalogCsv"
            >
              <Download class="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span v-if="search" class="rounded-full bg-secondary px-3 py-1 text-muted-foreground">
          Search: {{ search }}
        </span>
        <span
          v-if="selectedCollection !== 'all'"
          class="rounded-full bg-secondary px-3 py-1 text-muted-foreground"
        >
          {{ collectionName(selectedCollection) }}
        </span>
        <span
          v-if="selectedSource !== 'all'"
          class="rounded-full bg-secondary px-3 py-1 text-muted-foreground"
        >
          {{ sourceLabel(selectedSource) }}
        </span>
      </div>

      <div v-if="loading" class="flex justify-center py-6">
        <Loader2 class="h-5 w-5 animate-spin text-accent" />
      </div>
      <div
        v-else-if="filteredProducts.length === 0"
        class="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
      >
        No products match this filter.
        <button
          v-if="hasActiveFilters"
          type="button"
          class="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
      <div v-else-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          role="button"
          tabindex="0"
          class="min-w-0 cursor-pointer rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          :aria-label="`Open details for ${product.name}`"
          @click="openProduct(product)"
          @keydown.enter.prevent="openProduct(product)"
          @keydown.space.prevent="openProduct(product)"
        >
          <div
            class="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br sm:h-28"
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
              <p class="mt-1 text-sm font-semibold text-primary">
                {{ priceLabel(product.price) }}
              </p>
              <p class="break-all text-xs text-muted-foreground">
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
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-destructive"
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
      <div v-else class="overflow-hidden rounded-2xl border border-border bg-card">
        <article
          v-for="product in filteredProducts"
          :key="`${product.id}-row`"
          role="button"
          tabindex="0"
          class="grid cursor-pointer gap-4 border-b border-border p-4 text-left transition last:border-b-0 hover:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset sm:grid-cols-[112px_minmax(0,1fr)_auto]"
          :aria-label="`Open details for ${product.name}`"
          @click="openProduct(product)"
          @keydown.enter.prevent="openProduct(product)"
          @keydown.space.prevent="openProduct(product)"
        >
          <div
            class="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br sm:h-20"
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
              <span
                class="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary"
              >
                {{ priceLabel(product.price) }}
              </span>
            </div>
            <h3 class="font-display truncate text-lg font-bold">{{ product.name }}</h3>
            <p class="break-all text-xs text-muted-foreground">
              {{ product.collection_name }} &middot; {{ product.slug }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ variantNamesFor(product.variant_slugs).length }} subcategor{{
                variantNamesFor(product.variant_slugs).length === 1 ? "y" : "ies"
              }}
              &middot; {{ variantSummary(product) }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:justify-end">
            <RouterLink
              :to="product.path"
              class="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold text-accent transition hover:bg-background"
              @click.stop
            >
              <Eye class="h-4 w-4" />
              View
            </RouterLink>
            <button
              v-if="product.deletable"
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-destructive"
              :aria-label="`Delete ${product.name}`"
              @click.stop="remove(product)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="selectedProduct"
        class="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/50 px-0 pt-6 sm:items-center sm:p-4"
        @click.self="closeProductDialog"
      >
        <section
          class="flex max-h-[calc(100dvh_-_0.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:max-h-[min(860px,calc(100dvh_-_2rem))] sm:rounded-2xl"
          aria-modal="true"
          role="dialog"
        >
          <div
            class="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4"
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
              class="shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Close product details"
              @click="closeProductDialog"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div
            class="grid min-h-0 gap-5 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6"
          >
            <div class="min-w-0">
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
                <span class="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {{ priceLabel(selectedProduct.price) }}
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
              class="min-w-0 space-y-4"
              @submit.prevent="saveProductDetails"
            >
              <div class="grid gap-4 md:grid-cols-2">
                <div class="min-w-0 space-y-1.5">
                  <label for="detail_collection_slug" class="text-sm font-medium">Collection</label>
                  <select
                    id="detail_collection_slug"
                    v-model="detailForm.collection_slug"
                    required
                    :disabled="selectedProduct.base"
                    class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
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
                <div class="min-w-0 space-y-1.5">
                  <label for="detail_name" class="text-sm font-medium">Card name</label>
                  <input
                    id="detail_name"
                    v-model.trim="detailForm.name"
                    required
                    maxlength="100"
                    class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div class="min-w-0 space-y-1.5">
                  <label for="detail_tag" class="text-sm font-medium">Tag</label>
                  <input
                    id="detail_tag"
                    v-model.trim="detailForm.tag"
                    required
                    maxlength="40"
                    class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div class="min-w-0 space-y-1.5">
                  <label for="detail_price" class="text-sm font-medium">Price (INR)</label>
                  <input
                    id="detail_price"
                    v-model.trim="detailForm.price"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div class="min-w-0 space-y-1.5 md:col-span-2">
                  <label for="detail_tint" class="text-sm font-medium">Tailwind tint</label>
                  <input
                    id="detail_tint"
                    v-model.trim="detailForm.tint"
                    maxlength="120"
                    class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

              <div
                class="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-background pt-4 sm:flex-row sm:items-center sm:justify-end"
              >
                <button
                  type="button"
                  class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-secondary sm:w-auto"
                  @click="closeProductDialog"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="editBusy"
                  class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
                >
                  <Loader2 v-if="editBusy" class="h-4 w-4 animate-spin" />
                  <Save v-else class="h-4 w-4" />
                  Save details
                </button>
              </div>
            </form>

            <div v-else class="min-w-0 space-y-4">
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
                  <dd class="mt-1 break-all font-mono text-xs">{{ selectedProduct.slug }}</dd>
                </div>
                <div class="rounded-lg border border-border p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price
                  </dt>
                  <dd class="mt-1 font-medium">{{ priceLabel(selectedProduct.price) }}</dd>
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
import {
  Download,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Tags,
  Trash2,
  X,
} from "@lucide/vue";

import CategoryCardArt from "@/components/CategoryCardArt.vue";
import { useToast } from "@/composables/useToast";
import {
  baseDesignVariantSlugs,
  collections,
  designVariantName,
  normalizeDesignVariantSlugs,
} from "@/lib/collections-data";
import { formatPrice, parsePriceInput } from "@/lib/pricing";
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
const selectedSource = ref("all");
const sortMode = ref("newest");
const viewMode = ref("grid");
const selectedProduct = ref(null);
const maxImageBytes = 5 * 1024 * 1024;
const maxImageDataUrlLength = 900_000;
const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const sourceOptions = [
  { value: "all", label: "All" },
  { value: "base", label: "Base" },
  { value: "added", label: "Added" },
];
const form = reactive({
  collection_slug: collectionList[0]?.slug || "",
  name: "",
  tag: "",
  price: "",
  tint: "",
  image_data_url: "",
  subcategory_names: "",
});
const detailForm = reactive({
  collection_slug: "",
  name: "",
  tag: "",
  price: "",
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
          price: override?.price || model.price || null,
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
const collectionCoverage = computed(
  () => new Set(allProducts.value.map((product) => product.collection_slug)).size,
);
const pricedProducts = computed(() =>
  allProducts.value.filter(
    (product) => Number.isFinite(Number(product.price)) && Number(product.price) > 0,
  ),
);
const catalogStats = computed(() => [
  {
    label: "Visible",
    value: filteredProducts.value.length,
    note: `${allProducts.value.length} total products`,
    icon: Eye,
  },
  {
    label: "Added",
    value: customProducts.value.length,
    note: "Mongo products",
    icon: Plus,
  },
  {
    label: "Base",
    value: staticProducts.value.length,
    note: "Source catalog",
    icon: PackageCheck,
  },
  {
    label: "Priced",
    value: pricedProducts.value.length,
    note: `${collectionCoverage.value} collections active`,
    icon: Tags,
  },
]);
const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();

  const matches = allProducts.value.filter((product) => {
    const matchesCollection =
      selectedCollection.value === "all" || product.collection_slug === selectedCollection.value;
    const matchesSource =
      selectedSource.value === "all" ||
      (selectedSource.value === "base" && product.base) ||
      (selectedSource.value === "added" && !product.base);
    const matchesSearch =
      !term ||
      [
        product.name,
        product.collection_name,
        product.tag,
        product.slug,
        product.source,
        variantSummary(product),
      ]
        .concat(priceLabel(product.price, ""))
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

    return matchesCollection && matchesSource && matchesSearch;
  });

  return [...matches].sort(compareProducts);
});
const hasActiveFilters = computed(
  () =>
    Boolean(search.value) || selectedCollection.value !== "all" || selectedSource.value !== "all",
);
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

function collectionName(slug) {
  return collections[slug]?.name || slug;
}

function sourceLabel(value) {
  return sourceOptions.find((option) => option.value === value)?.label || value;
}

function clearFilters() {
  search.value = "";
  selectedCollection.value = "all";
  selectedSource.value = "all";
}

function compareProducts(a, b) {
  if (sortMode.value === "name") return a.name.localeCompare(b.name);
  if (sortMode.value === "collection") {
    return a.collection_name.localeCompare(b.collection_name) || a.name.localeCompare(b.name);
  }
  if (sortMode.value === "price-desc") {
    return productPrice(b, -1) - productPrice(a, -1) || a.name.localeCompare(b.name);
  }
  if (sortMode.value === "price-asc") {
    return (
      productPrice(a, Number.MAX_SAFE_INTEGER) - productPrice(b, Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name)
    );
  }

  return (
    productTimestamp(b) - productTimestamp(a) ||
    Number(a.base) - Number(b.base) ||
    a.name.localeCompare(b.name)
  );
}

function productPrice(product, fallback) {
  const price = Number(product.price);
  return Number.isFinite(price) && price > 0 ? price : fallback;
}

function productTimestamp(product) {
  const timestamp = Date.parse(product.updated_at || product.created_at || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
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

function exportCatalogCsv() {
  const header = [
    "Name",
    "Collection",
    "Source",
    "Tag",
    "Price",
    "Slug",
    "Subcategories",
    "Product URL",
  ];
  const rows = filteredProducts.value.map((product) => [
    product.name,
    product.collection_name,
    product.source,
    product.tag,
    priceLabel(product.price, ""),
    product.slug,
    variantSummary(product),
    `${window.location.origin}${product.path}`,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `nexique-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success("Catalog exported.");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

async function addModel() {
  if (!form.collection_slug || !form.name || !form.tag) {
    toast.error("All fields required");
    return;
  }

  const price = parsePriceInput(form.price);
  if (price == null) {
    toast.error("Enter a valid price.");
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
      price,
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
  form.price = "";
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
  detailForm.price = product.price || "";
  detailForm.tint = product.tint || "from-rose-200 to-amber-100";
  detailForm.image_data_url = product.image_data_url || "";
  detailForm.subcategory_names = variantNamesFor(product.variant_slugs).join(", ");
  if (detailImageInput.value) detailImageInput.value.value = "";
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

  const price = parsePriceInput(detailForm.price);
  if (price == null) {
    toast.error("Enter a valid price.");
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
      price,
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

function priceLabel(price, fallback = "Price not set") {
  return formatPrice(price, fallback);
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
