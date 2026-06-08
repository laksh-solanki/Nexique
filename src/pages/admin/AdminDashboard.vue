<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Admin desk</p>
        <h1 class="font-display mt-2 text-3xl font-bold tracking-tight">Today at Nexique</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Track new requests, recent catalog additions, and the work that needs confirmation before
          print.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink
          to="/admin/orders"
          class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Inbox class="h-4 w-4" /> Review orders
        </RouterLink>
        <RouterLink
          to="/admin/models"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
        >
          <Plus class="h-4 w-4" /> Add card
        </RouterLink>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="h-6 w-6 animate-spin text-accent" />
    </div>

    <div v-else class="space-y-8">
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in dashboardStats"
          :key="stat.label"
          class="rounded-2xl border border-border bg-card p-5"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {{ stat.label }}
            </p>
            <component :is="stat.icon" class="h-4 w-4 text-accent" />
          </div>
          <div class="font-display mt-4 text-4xl font-bold text-primary">{{ stat.value }}</div>
          <p class="mt-1 text-xs text-muted-foreground">{{ stat.note }}</p>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <div class="rounded-2xl border border-border bg-card p-6 lg:col-span-7">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 class="font-display text-2xl font-bold tracking-tight">Latest Items</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Newest order requests from customers.
              </p>
            </div>
            <RouterLink
              to="/admin/orders"
              class="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              View all <ArrowUpRight class="h-3.5 w-3.5" />
            </RouterLink>
          </div>

          <div
            v-if="latestOrders.length === 0"
            class="rounded-xl bg-secondary p-6 text-sm text-muted-foreground"
          >
            No latest orders yet. Customer requests will appear here after the order form is
            submitted.
          </div>
          <div v-else class="divide-y divide-foreground/10 border-y border-foreground/10">
            <div v-for="order in latestOrders" :key="order.id" class="py-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-display text-xl text-primary">{{ order.model_name }}</h3>
                  <p class="mt-0.5 text-sm text-muted-foreground">
                    {{ order.customer_name }} &middot; {{ order.collection_name }}
                    <span v-if="order.design_variant">&middot; {{ order.design_variant }}</span>
                  </p>
                  <p class="mt-1 text-xs text-muted-foreground">
                    Qty {{ order.quantity }} &middot; {{ formatDate(order.created_at) }}
                  </p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                  :class="statusClass(order.status)"
                >
                  {{ statusLabel(order.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6 lg:col-span-5">
          <div class="rounded-2xl border border-border bg-card p-6">
            <div class="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 class="font-display text-2xl font-bold tracking-tight">Latest Cards</h2>
                <p class="mt-1 text-sm text-muted-foreground">Recent custom catalog additions.</p>
              </div>
              <RouterLink
                to="/admin/models"
                class="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                Add <ArrowUpRight class="h-3.5 w-3.5" />
              </RouterLink>
            </div>

            <div
              v-if="latestModels.length === 0"
              class="rounded-xl bg-secondary p-5 text-sm text-muted-foreground"
            >
              No custom cards yet. Add premium or seasonal cards from Catalog.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="model in latestModels"
                :key="model.id"
                class="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <div class="h-12 w-16 rounded-md bg-gradient-to-br" :class="model.tint" />
                <div>
                  <h3 class="font-display font-bold text-primary">{{ model.name }}</h3>
                  <p class="text-xs text-muted-foreground">
                    {{ collectionName(model.collection_slug) }} &middot; {{ model.tag }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-border bg-primary p-6 text-primary-foreground">
            <div class="flex items-center gap-3">
              <ShieldCheck class="h-5 w-5 text-accent" />
              <h2 class="font-display text-2xl font-bold">Before printing</h2>
            </div>
            <ul class="mt-5 space-y-3 text-sm text-primary-foreground/75">
              <li v-for="item in printChecklist" :key="item" class="flex gap-3">
                <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        class="grid gap-px overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/10 lg:grid-cols-3"
      >
        <div v-for="guide in adminGuides" :key="guide.title" class="bg-card p-6">
          <component :is="guide.icon" class="mb-4 h-5 w-5 text-accent" />
          <h3 class="font-display text-2xl text-primary">{{ guide.title }}</h3>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ guide.body }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Inbox,
  Loader2,
  Palette,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
} from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { collections } from "@/lib/collections-data";
import { listCustomModels, listOrders } from "@/lib/store";

const toast = useToast();
const loading = ref(true);
const orders = ref([]);
const models = ref([]);

const latestOrders = computed(() => orders.value.slice(0, 5));
const latestModels = computed(() => models.value.slice(0, 4));

const dashboardStats = computed(() => [
  {
    label: "New",
    value: orders.value.filter((order) => order.status === "new").length,
    note: "Need first review",
    icon: AlertCircle,
  },
  {
    label: "In Progress",
    value: orders.value.filter((order) => order.status === "in_progress").length,
    note: "Proof or print work",
    icon: Clock,
  },
  {
    label: "Completed",
    value: orders.value.filter((order) => order.status === "completed").length,
    note: "Finished requests",
    icon: PackageCheck,
  },
  {
    label: "Catalog",
    value: models.value.length,
    note: "Custom card additions",
    icon: Sparkles,
  },
]);

const printChecklist = [
  "Customer name, phone/email, and delivery city are confirmed.",
  "Card wording, spelling, names, date, and quantity are checked.",
  "Proof, paper stock, finish, timeline, and quote are approved.",
  "Order status is moved from New to In progress before production.",
];

const adminGuides = [
  {
    icon: Inbox,
    title: "Order priority",
    body: "Start with New orders, confirm missing details, then move approved requests to In progress.",
  },
  {
    icon: Palette,
    title: "Catalog quality",
    body: "Add seasonal, premium, and customer-requested cards with clear names, tags, and tint previews.",
  },
  {
    icon: FileCheck2,
    title: "Proof control",
    body: "Do not print until the customer has approved wording, design variant, quantity, and final quote.",
  },
];

onMounted(load);

async function load() {
  loading.value = true;
  try {
    const [orderData, modelData] = await Promise.all([listOrders(), listCustomModels()]);
    orders.value = orderData;
    models.value = modelData;
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not load admin dashboard.");
  } finally {
    loading.value = false;
  }
}

function collectionName(slug) {
  return collections[slug]?.name || slug;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function statusLabel(status) {
  const labels = {
    new: "New",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

function statusClass(status) {
  const classes = {
    new: "bg-accent/10 text-accent",
    in_progress: "bg-primary/10 text-primary",
    completed: "bg-emerald-500/10 text-emerald-700",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return classes[status] || "bg-secondary text-muted-foreground";
}
</script>
