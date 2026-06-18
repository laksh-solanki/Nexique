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

      <section class="grid gap-4 lg:grid-cols-4">
        <RouterLink
          v-for="item in commandItems"
          :key="item.title"
          :to="item.to"
          class="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-card"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent"
            >
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <ArrowUpRight
              class="h-4 w-4 text-muted-foreground transition group-hover:text-accent"
            />
          </div>
          <h2 class="font-display mt-5 text-2xl font-bold text-primary">{{ item.title }}</h2>
          <p class="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">
            {{ item.body }}
          </p>
          <p class="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {{ item.meta }}
          </p>
        </RouterLink>
      </section>

      <section class="rounded-2xl border border-border bg-card p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              System status
            </p>
            <h2 class="font-display mt-2 text-2xl font-bold text-primary">
              {{ health?.mongodb === "connected" ? "MongoDB connected" : "Checking MongoDB" }}
            </h2>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ health?.database || "Database status will appear after the admin API responds." }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="healthLoading"
            @click="loadHealth"
          >
            <Loader2 v-if="healthLoading" class="h-4 w-4 animate-spin" />
            <RefreshCw v-else class="h-4 w-4" />
            Check
          </button>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div
            v-for="item in healthCounts"
            :key="item.label"
            class="rounded-xl border border-border bg-secondary/50 p-3"
          >
            <p class="text-xs uppercase tracking-widest text-muted-foreground">{{ item.label }}</p>
            <p class="font-display mt-1 text-2xl font-bold text-primary">{{ item.value }}</p>
          </div>
        </div>
      </section>

      <!-- Visual Analytics & Charts Section -->
      <section class="grid gap-6 lg:grid-cols-12">
        <!-- Order Trend Chart (SVG Line/Area Chart) -->
        <div class="rounded-2xl border border-border bg-card p-6 lg:col-span-8">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="font-display text-xl font-bold text-primary">Incoming Order Trends</h2>
              <p class="text-xs text-muted-foreground">
                Daily incoming orders over the last 2 weeks
              </p>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-accent"
            >
              <TrendingUp class="h-3.5 w-3.5" /> Trend Insights
            </div>
          </div>

          <div class="relative h-44 w-full pt-2">
            <svg
              class="h-full w-full overflow-visible"
              viewBox="0 0 500 135"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid Lines -->
              <line
                x1="25"
                y1="15"
                x2="490"
                y2="15"
                stroke="var(--color-border)"
                stroke-width="0.75"
                stroke-dasharray="3,3"
              />
              <line
                x1="25"
                y1="70"
                x2="490"
                y2="70"
                stroke="var(--color-border)"
                stroke-width="0.75"
                stroke-dasharray="3,3"
              />
              <line
                x1="25"
                y1="125"
                x2="490"
                y2="125"
                stroke="var(--color-border)"
                stroke-width="1.25"
              />

              <!-- Gradient Area -->
              <path :d="trendAreaPath" fill="url(#chartGradient)" />

              <!-- Primary Line -->
              <path
                :d="trendLinePath"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Interactive dots -->
              <g>
                <circle
                  v-for="(pt, idx) in trendPoints"
                  :key="idx"
                  :cx="pt.x"
                  :cy="pt.y"
                  r="4"
                  fill="var(--color-card)"
                  stroke="var(--color-accent)"
                  stroke-width="2"
                  class="cursor-pointer transition hover:scale-150"
                >
                  <title>{{ pt.label }}: {{ pt.count }} order{{ pt.count === 1 ? "" : "s" }}</title>
                </circle>
              </g>

              <!-- Y Axis labels -->
              <text
                x="18"
                y="18"
                font-size="8"
                font-weight="bold"
                fill="var(--color-muted-foreground)"
                text-anchor="end"
              >
                {{ maxTrendCount }}
              </text>
              <text
                x="18"
                y="73"
                font-size="8"
                font-weight="bold"
                fill="var(--color-muted-foreground)"
                text-anchor="end"
              >
                {{ Math.round(maxTrendCount / 2) }}
              </text>
              <text
                x="18"
                y="128"
                font-size="8"
                font-weight="bold"
                fill="var(--color-muted-foreground)"
                text-anchor="end"
              >
                0
              </text>

              <!-- X Axis labels -->
              <text
                x="25"
                y="142"
                font-size="8"
                fill="var(--color-muted-foreground)"
                text-anchor="start"
              >
                {{ trendData[0]?.label }}
              </text>
              <text
                x="257"
                y="142"
                font-size="8"
                fill="var(--color-muted-foreground)"
                text-anchor="middle"
              >
                {{ trendData[7]?.label }}
              </text>
              <text
                x="490"
                y="142"
                font-size="8"
                fill="var(--color-muted-foreground)"
                text-anchor="end"
              >
                {{ trendData[13]?.label }}
              </text>
            </svg>
          </div>
        </div>

        <!-- Status Donut Chart (Donut + Stats legend) -->
        <div
          class="rounded-2xl border border-border bg-card p-6 lg:col-span-4 flex flex-col justify-between"
        >
          <div>
            <h2 class="font-display text-xl font-bold text-primary">Status Mix</h2>
            <p class="text-xs text-muted-foreground">Order count breakdown by status</p>
          </div>

          <div class="my-auto flex items-center justify-center gap-6 py-2">
            <!-- SVG Donut -->
            <div class="relative h-24 w-24 shrink-0">
              <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--color-secondary)"
                  stroke-width="8"
                />
                <circle
                  v-for="(seg, idx) in donutSegments"
                  :key="idx"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  :stroke="seg.color"
                  stroke-width="10"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="round"
                  class="transition-all duration-500"
                />
              </svg>
              <!-- Center Total indicator -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-[10px] uppercase tracking-wider text-muted-foreground"
                  >Total</span
                >
                <span class="font-display text-lg font-bold text-primary">{{ orders.length }}</span>
              </div>
            </div>

            <!-- Custom legend panel -->
            <div class="flex flex-col gap-2 text-xs">
              <div v-for="seg in donutSegments" :key="seg.label" class="flex items-center gap-2">
                <span
                  class="h-2 w-2 rounded-full shrink-0"
                  :style="{ backgroundColor: seg.color }"
                />
                <span class="font-semibold text-primary">{{ seg.value }}</span>
                <span class="text-muted-foreground truncate max-w-[85px]" :title="seg.label">{{
                  seg.label
                }}</span>
              </div>
              <div v-if="orders.length === 0" class="text-muted-foreground italic">
                No orders logged
              </div>
            </div>
          </div>
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
                    <span v-if="order.deadline">&middot; Due {{ formatDate(order.deadline) }}</span>
                  </p>
                </div>
                <div class="flex flex-wrap justify-end gap-2">
                  <span
                    class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                    :class="priorityClass(order.priority)"
                  >
                    {{ priorityLabel(order.priority) }}
                  </span>
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
                  <p class="mt-1 text-xs font-semibold text-primary">
                    {{ formatPrice(model.price, "Price not set") }}
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
  CalendarClock,
  CheckCircle2,
  Clock,
  FileCheck2,
  Inbox,
  Loader2,
  Palette,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { collections } from "@/lib/collections-data";
import { priorityClass, priorityLabel, statusClass, statusLabel } from "@/lib/orderWorkflow";
import { formatPrice } from "@/lib/pricing";
import { getAdminHealth, listCustomModels, listOrders } from "@/lib/store";

const toast = useToast();
const loading = ref(true);
const healthLoading = ref(false);
const orders = ref([]);
const models = ref([]);
const health = ref(null);

const latestOrders = computed(() => orders.value.slice(0, 5));
const latestModels = computed(() => models.value.slice(0, 4));
const activeStatuses = new Set(["contacted", "proofing", "in_production"]);
const newRequestCount = computed(
  () => orders.value.filter((order) => order.status === "new").length,
);
const proofingCount = computed(
  () => orders.value.filter((order) => order.status === "proofing").length,
);
const healthCounts = computed(() => [
  { label: "Admins", value: health.value?.counts?.admins ?? "-" },
  { label: "Orders", value: health.value?.counts?.orders ?? orders.value.length },
  { label: "Catalog", value: health.value?.counts?.custom_card_models ?? models.value.length },
]);

const dashboardStats = computed(() => [
  {
    label: "New",
    value: orders.value.filter((order) => order.status === "new").length,
    note: "Need first review",
    icon: AlertCircle,
  },
  {
    label: "Active",
    value: orders.value.filter((order) => activeStatuses.has(order.status)).length,
    note: "Contacted to production",
    icon: Clock,
  },
  {
    label: "Completed",
    value: orders.value.filter((order) => order.status === "completed").length,
    note: "Finished requests",
    icon: PackageCheck,
  },
  {
    label: "Rush / Due",
    value: orders.value.filter((order) => isUrgentOrder(order)).length,
    note: "Need close follow-up",
    icon: CalendarClock,
  },
]);

const uniqueCustomerCount = computed(() => {
  const identities = orders.value
    .map((order) => order.customer_email || order.customer_phone || order.customer_name)
    .filter(Boolean);
  return new Set(identities).size;
});

const commandItems = computed(() => [
  {
    to: "/admin/orders",
    title: "New intake",
    body: "Open fresh customer requests, confirm contact details, and set the first workflow status.",
    meta: `${newRequestCount.value} new request${newRequestCount.value === 1 ? "" : "s"}`,
    icon: Inbox,
  },
  {
    to: "/admin/orders",
    title: "Proof queue",
    body: "Review wording, spelling, quantities, and deadlines before an order moves to production.",
    meta: `${proofingCount.value} proofing`,
    icon: FileCheck2,
  },
  {
    to: "/admin/customers",
    title: "Customer desk",
    body: "Check repeat customers, order history, phone numbers, and saved profile details.",
    meta: `${uniqueCustomerCount.value} customer record${
      uniqueCustomerCount.value === 1 ? "" : "s"
    }`,
    icon: Users,
  },
  {
    to: "/admin/models",
    title: "Catalog polish",
    body: "Add or refine premium, seasonal, and custom cards with clean names, pricing, and tags.",
    meta: `${models.value.length} custom card${models.value.length === 1 ? "" : "s"}`,
    icon: Palette,
  },
]);

const printChecklist = [
  "Customer name, phone/email, and delivery city are confirmed.",
  "Card wording, spelling, names, date, and quantity are checked.",
  "Proof, paper stock, finish, timeline, and quote are approved.",
  "Order status is moved through Contacted, Proofing, and In production before completion.",
];

const adminGuides = [
  {
    icon: Inbox,
    title: "Order priority",
    body: "Start with New and Rush orders, confirm missing details, then move approved requests through proofing and production.",
  },
  {
    icon: Palette,
    title: "Catalog quality",
    body: "Add seasonal, premium, and customer-requested cards with clear names, tags, and tint previews.",
  },
  {
    icon: FileCheck2,
    title: "Proof control",
    body: "Use admin notes and deadlines to track customer approvals before printing.",
  },
];

onMounted(load);

async function load() {
  loading.value = true;
  try {
    const [orderData, modelData] = await Promise.all([listOrders(), listCustomModels()]);
    orders.value = orderData;
    models.value = modelData;
    await loadHealth();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not load admin dashboard.");
  } finally {
    loading.value = false;
  }
}

async function loadHealth() {
  healthLoading.value = true;
  try {
    health.value = await getAdminHealth();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not check MongoDB status.");
  } finally {
    healthLoading.value = false;
  }
}

function collectionName(slug) {
  return collections[slug]?.name || slug;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function isUrgentOrder(order) {
  if (["completed", "cancelled"].includes(order.status)) return false;
  if (order.priority === "rush") return true;
  if (!order.deadline) return false;

  const deadline = new Date(`${order.deadline}T23:59:59`);
  if (Number.isNaN(deadline.getTime())) return false;

  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  return deadline <= soon;
}

const trendData = computed(() => {
  const data = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const count = orders.value.filter((o) => {
      if (!o.created_at) return false;
      return new Date(o.created_at).toISOString().split("T")[0] === dayStr;
    }).length;
    data.push({ label, count, dayStr });
  }
  return data;
});

const maxTrendCount = computed(() => {
  const counts = trendData.value.map((d) => d.count);
  return Math.max(...counts, 4);
});

const trendPoints = computed(() => {
  const points = [];
  const data = trendData.value;
  const maxVal = maxTrendCount.value;
  data.forEach((item, index) => {
    const x = 25 + index * (465 / 13);
    const y = 125 - (item.count / maxVal) * 110;
    points.push({ x, y, count: item.count, label: item.label });
  });
  return points;
});

const trendLinePath = computed(() => {
  const pts = trendPoints.value;
  if (pts.length === 0) return "";
  return pts.reduce((path, pt, idx) => {
    return path + `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
  }, "");
});

const trendAreaPath = computed(() => {
  const pts = trendPoints.value;
  if (pts.length === 0) return "";
  const linePath = trendLinePath.value;
  return `${linePath} L ${pts[pts.length - 1].x} 125 L ${pts[0].x} 125 Z`;
});

const statusDistribution = computed(() => {
  const counts = { new: 0, active: 0, completed: 0, cancelled: 0 };
  orders.value.forEach((o) => {
    if (o.status === "new") counts.new++;
    else if (["contacted", "proofing", "in_production"].includes(o.status)) counts.active++;
    else if (o.status === "completed") counts.completed++;
    else if (o.status === "cancelled") counts.cancelled++;
  });
  const total = orders.value.length || 1;
  return [
    {
      label: "New Requests",
      value: counts.new,
      color: "var(--color-destructive)",
      pct: counts.new / total,
    },
    {
      label: "Active Processing",
      value: counts.active,
      color: "var(--color-accent)",
      pct: counts.active / total,
    },
    {
      label: "Completed",
      value: counts.completed,
      color: "oklch(0.62 0.17 145)",
      pct: counts.completed / total,
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      color: "var(--color-muted-foreground)",
      pct: counts.cancelled / total,
    },
  ].filter((item) => item.value > 0);
});

const donutSegments = computed(() => {
  const data = statusDistribution.value;
  let accumulatedPercent = 0;
  return data.map((item) => {
    const offset = -accumulatedPercent * 251.2;
    accumulatedPercent += item.pct;
    return {
      label: item.label,
      value: item.value,
      color: item.color,
      offset,
    };
  });
});
</script>
