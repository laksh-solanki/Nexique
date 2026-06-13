<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold tracking-tight">Orders</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Showing {{ filteredOrders.length }} of {{ orders.length }} request{{
            orders.length === 1 ? "" : "s"
          }}.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div
          v-if="filteredOrders.length > 0"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
        >
          <input
            id="select-all-checkbox"
            type="checkbox"
            :checked="isAllSelected"
            class="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
            @change="toggleSelectAll"
          />
          <label for="select-all-checkbox" class="font-semibold cursor-pointer select-none">
            Select All ({{ selectedIds.length }} selected)
          </label>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="load"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          Refresh
        </button>
      </div>
    </div>

    <div class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in orderStats"
        :key="stat.label"
        class="rounded-2xl border border-border bg-card p-4"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {{ stat.label }}
        </p>
        <div class="font-display mt-2 text-3xl font-bold text-primary">{{ stat.value }}</div>
        <p class="mt-1 text-xs text-muted-foreground">{{ stat.note }}</p>
      </div>
    </div>

    <section class="mb-6 rounded-2xl border border-border bg-card p-4">
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div class="space-y-1.5">
          <label for="order-search" class="text-sm font-medium">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="order-search"
              v-model.trim="filters.search"
              type="search"
              placeholder="Customer, email, phone, card, collection, message"
              class="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="status-filter" class="text-sm font-medium">Status</label>
          <select
            id="status-filter"
            v-model="filters.status"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option
              v-for="status in ORDER_STATUS_OPTIONS"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label for="priority-filter" class="text-sm font-medium">Priority</label>
          <select
            id="priority-filter"
            v-model="filters.priority"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All priorities</option>
            <option
              v-for="priority in ORDER_PRIORITY_OPTIONS"
              :key="priority.value"
              :value="priority.value"
            >
              {{ priority.label }}
            </option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label for="sort-orders" class="text-sm font-medium">Sort</label>
          <select
            id="sort-orders"
            v-model="filters.sort"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="deadline">Deadline first</option>
            <option value="priority">Rush first</option>
          </select>
        </div>
      </div>
    </section>

    <div v-if="loading" class="flex justify-center py-10">
      <Loader2 class="h-6 w-6 animate-spin text-accent" />
    </div>

    <div
      v-else-if="orders.length === 0"
      class="rounded-2xl border border-border bg-card p-10 text-center"
    >
      <h2 class="font-display text-2xl font-bold text-primary">No orders yet</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Customer requests will appear here when the order form is submitted.
      </p>
    </div>

    <div
      v-else-if="filteredOrders.length === 0"
      class="rounded-2xl border border-border bg-card p-10 text-center"
    >
      <h2 class="font-display text-2xl font-bold text-primary">No matching orders</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Adjust search, status, priority, or sorting to review other requests.
      </p>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="order in filteredOrders"
        :key="order.id"
        class="rounded-2xl border border-border bg-card p-5 transition-all duration-200"
        :class="{ 'border-accent bg-accent/5 shadow-sm': selectedIds.includes(order.id) }"
      >
        <div class="flex items-start gap-4">
          <!-- Selection Checkbox -->
          <div class="pt-1.5 shrink-0 select-none">
            <input
              v-model="selectedIds"
              type="checkbox"
              :value="order.id"
              class="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 class="font-display text-xl font-bold text-primary">
                      {{ order.model_name }}
                    </h3>
                    <p class="mt-0.5 text-sm text-muted-foreground">
                      {{ order.collection_name }}
                      <span v-if="order.design_variant">&middot; {{ order.design_variant }}</span>
                      &middot; qty {{ order.quantity }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
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

                <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <span class="font-medium">{{ order.customer_name }}</span>
                  <a
                    :href="`mailto:${order.customer_email}`"
                    class="inline-flex items-center gap-1 text-muted-foreground hover:text-accent"
                  >
                    <Mail class="h-3.5 w-3.5" />{{ order.customer_email }}
                  </a>
                  <span
                    v-if="order.customer_phone"
                    class="inline-flex items-center gap-1 text-muted-foreground"
                  >
                    <Phone class="h-3.5 w-3.5" />{{ order.customer_phone }}
                  </span>
                  <span class="text-muted-foreground">{{ formatDate(order.created_at) }}</span>
                </div>

                <p v-if="order.message" class="mt-3 text-sm italic text-muted-foreground">
                  "{{ order.message }}"
                </p>

                <div v-if="missingDetails(order).length" class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="missing in missingDetails(order)"
                    :key="missing"
                    class="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    {{ missing }}
                  </span>
                </div>
              </div>

              <button
                type="button"
                class="self-start p-2 text-muted-foreground transition hover:text-destructive"
                aria-label="Delete"
                @click="remove(order.id)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>

            <div class="mt-5 grid gap-4 border-t border-foreground/10 pt-5 lg:grid-cols-4">
              <div class="space-y-1.5">
                <label :for="`status-${order.id}`" class="text-sm font-medium">Status</label>
                <select
                  :id="`status-${order.id}`"
                  :value="order.status"
                  :disabled="savingId === order.id"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  @change="saveOrder(order.id, { status: $event.target.value }, 'Status updated')"
                >
                  <option
                    v-for="status in ORDER_STATUS_OPTIONS"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>
                </select>
                <p class="text-xs text-muted-foreground">{{ statusNote(order.status) }}</p>
              </div>

              <div class="space-y-1.5">
                <label :for="`priority-${order.id}`" class="text-sm font-medium">Priority</label>
                <select
                  :id="`priority-${order.id}`"
                  :value="order.priority"
                  :disabled="savingId === order.id"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  @change="
                    saveOrder(order.id, { priority: $event.target.value }, 'Priority updated')
                  "
                >
                  <option
                    v-for="priority in ORDER_PRIORITY_OPTIONS"
                    :key="priority.value"
                    :value="priority.value"
                  >
                    {{ priority.label }}
                  </option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label :for="`deadline-${order.id}`" class="text-sm font-medium">Deadline</label>
                <input
                  :id="`deadline-${order.id}`"
                  :value="order.deadline"
                  type="date"
                  :disabled="savingId === order.id"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  @change="
                    saveOrder(order.id, { deadline: $event.target.value }, 'Deadline updated')
                  "
                />
                <p class="text-xs text-muted-foreground">
                  {{ order.deadline ? `Due ${formatDeadline(order.deadline)}` : "No deadline set" }}
                </p>
              </div>

              <div class="space-y-1.5">
                <label :for="`note-${order.id}`" class="text-sm font-medium">Admin note</label>
                <div class="flex gap-2">
                  <textarea
                    :id="`note-${order.id}`"
                    v-model.trim="draftNotes[order.id]"
                    rows="2"
                    maxlength="1000"
                    :disabled="savingId === order.id"
                    placeholder="Proof, quote, paper, delivery notes"
                    class="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="savingId === order.id || draftNotes[order.id] === order.admin_note"
                    aria-label="Save admin note"
                    title="Save admin note"
                    @click="saveOrder(order.id, { admin_note: draftNotes[order.id] }, 'Note saved')"
                  >
                    <Loader2 v-if="savingId === order.id" class="h-4 w-4 animate-spin" />
                    <Save v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Floating Bulk Actions Drawer -->
    <div
      v-if="selectedIds.length > 0"
      class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card shadow-card p-4 w-[calc(100%-2rem)] max-w-4xl animate-fade-up"
    >
      <div class="flex items-center gap-3">
        <div
          class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent"
        >
          {{ selectedIds.length }}
        </div>
        <span class="text-sm font-semibold text-primary">Orders Selected</span>
        <button
          type="button"
          class="text-xs text-muted-foreground hover:text-accent underline"
          @click="selectedIds = []"
        >
          Deselect
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-muted-foreground font-semibold">Status:</span>
          <select
            v-model="bulkActions.status"
            class="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold focus:border-accent focus:outline-none"
            @change="runBulkUpdate('status')"
          >
            <option value="">Choose...</option>
            <option v-for="opt in ORDER_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted-foreground font-semibold">Priority:</span>
          <select
            v-model="bulkActions.priority"
            class="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold focus:border-accent focus:outline-none"
            @change="runBulkUpdate('priority')"
          >
            <option value="">Choose...</option>
            <option v-for="opt in ORDER_PRIORITY_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted-foreground font-semibold">Due:</span>
          <input
            v-model="bulkActions.deadline"
            type="date"
            class="rounded-md border border-input bg-background px-2 py-0.5 text-xs font-semibold focus:border-accent focus:outline-none"
            @change="runBulkUpdate('deadline')"
          />
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
          @click="runBulkDelete"
        >
          <Trash2 class="h-3.5 w-3.5" /> Delete Selected
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Loader2, Mail, Phone, Save, Search, Trash2 } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import {
  ORDER_PRIORITY_OPTIONS,
  ORDER_STATUS_OPTIONS,
  priorityClass,
  priorityLabel,
  statusClass,
  statusLabel,
  statusNote,
} from "@/lib/orderWorkflow";
import {
  deleteOrder,
  listOrders,
  updateOrder,
  bulkUpdateOrders,
  bulkDeleteOrders,
} from "@/lib/store";

const toast = useToast();
const orders = ref([]);
const loading = ref(true);
const savingId = ref("");
const draftNotes = reactive({});
const activeStatuses = new Set(["contacted", "proofing", "in_production"]);
const filters = reactive({
  search: "",
  status: "all",
  priority: "all",
  sort: "newest",
});

const selectedIds = ref([]);
const bulkActions = reactive({
  status: "",
  priority: "",
  deadline: "",
});

const isAllSelected = computed(() => {
  if (filteredOrders.value.length === 0) return false;
  return filteredOrders.value.every((order) => selectedIds.value.includes(order.id));
});

function toggleSelectAll() {
  if (isAllSelected.value) {
    const filteredIdsSet = new Set(filteredOrders.value.map((o) => o.id));
    selectedIds.value = selectedIds.value.filter((id) => !filteredIdsSet.has(id));
  } else {
    const currentSelected = new Set(selectedIds.value);
    filteredOrders.value.forEach((o) => currentSelected.add(o.id));
    selectedIds.value = Array.from(currentSelected);
  }
}

async function runBulkUpdate(field) {
  const value = bulkActions[field];
  if (!value) return;

  if (!confirm(`Apply this bulk change to ${selectedIds.value.length} orders?`)) {
    bulkActions[field] = "";
    return;
  }

  loading.value = true;
  try {
    const patch = {};
    patch[field] = value;
    const res = await bulkUpdateOrders(selectedIds.value, patch);
    toast.success(`Bulk updated ${res.modifiedCount || selectedIds.value.length} orders.`);
    selectedIds.value = [];
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to bulk update orders.");
  } finally {
    loading.value = false;
    bulkActions[field] = "";
  }
}

async function runBulkDelete() {
  if (!confirm(`Permanently delete ${selectedIds.value.length} selected orders?`)) return;

  loading.value = true;
  try {
    const res = await bulkDeleteOrders(selectedIds.value);
    toast.success(`Bulk deleted ${res.deletedCount || selectedIds.value.length} orders.`);
    selectedIds.value = [];
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to bulk delete orders.");
  } finally {
    loading.value = false;
  }
}

const orderStats = computed(() => [
  {
    label: "New",
    value: orders.value.filter((order) => order.status === "new").length,
    note: "Need review",
  },
  {
    label: "Active",
    value: orders.value.filter((order) => activeStatuses.has(order.status)).length,
    note: "Contacted to production",
  },
  {
    label: "Completed",
    value: orders.value.filter((order) => order.status === "completed").length,
    note: "Finished",
  },
  {
    label: "Rush",
    value: orders.value.filter((order) => order.priority === "rush").length,
    note: "High priority",
  },
]);

const filteredOrders = computed(() => {
  const term = filters.search.toLowerCase();

  return orders.value
    .filter((order) => {
      if (filters.status !== "all" && order.status !== filters.status) return false;
      if (filters.priority !== "all" && order.priority !== filters.priority) return false;
      if (!term) return true;

      return searchFields(order).some((value) => value.toLowerCase().includes(term));
    })
    .sort((a, b) => sortOrders(a, b));
});

onMounted(load);

async function load() {
  loading.value = true;
  try {
    orders.value = await listOrders();
    orders.value.forEach((order) => {
      draftNotes[order.id] = order.admin_note || "";
    });
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not load orders.");
  } finally {
    loading.value = false;
  }
}

async function saveOrder(id, patch, successMessage) {
  savingId.value = id;
  try {
    await updateOrder(id, patch);
    toast.success(successMessage);
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not update order.");
  } finally {
    savingId.value = "";
  }
}

async function remove(id) {
  if (!confirm("Delete this order?")) return;
  try {
    await deleteOrder(id);
    toast.success("Deleted");
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not delete order.");
  }
}

function searchFields(order) {
  return [
    order.customer_name,
    order.customer_email,
    order.customer_phone,
    order.collection_name,
    order.model_name,
    order.design_variant,
    order.message,
    order.admin_note,
  ]
    .filter(Boolean)
    .map(String);
}

function sortOrders(a, b) {
  if (filters.sort === "deadline") {
    return deadlineRank(a) - deadlineRank(b) || newestRank(a, b);
  }

  if (filters.sort === "priority") {
    return (
      priorityRank(a) - priorityRank(b) || deadlineRank(a) - deadlineRank(b) || newestRank(a, b)
    );
  }

  return newestRank(a, b);
}

function priorityRank(order) {
  return order.priority === "rush" ? 0 : 1;
}

function deadlineRank(order) {
  if (!order.deadline) return Number.MAX_SAFE_INTEGER;
  const time = new Date(`${order.deadline}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function newestRank(a, b) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function missingDetails(order) {
  const missing = [];
  if (!order.customer_phone) missing.push("No phone");
  if (!order.message) missing.push("No message");
  if (!order.deadline) missing.push("No deadline");
  return missing;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function formatDeadline(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}
</script>
