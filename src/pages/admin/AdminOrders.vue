<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl font-bold tracking-tight">Orders</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ orders.length }} request{{ orders.length === 1 ? "" : "s" }} submitted from the site.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <Loader2 class="h-6 w-6 animate-spin text-accent" />
    </div>

    <div v-else>
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

      <div
        v-if="orders.length === 0"
        class="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground"
      >
        No orders yet. They'll appear here when customers submit the order form.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="order in orders"
          :key="order.id"
          class="rounded-2xl border border-border bg-card p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="font-display text-lg font-bold">
                {{ order.model_name }}
                <span class="text-sm font-normal text-muted-foreground">
                  &middot; {{ order.collection_name
                  }}<span v-if="order.design_variant"> &middot; {{ order.design_variant }}</span>
                </span>
              </h3>
              <p class="mt-1 text-sm">
                <span class="font-medium">{{ order.customer_name }}</span> &middot; qty
                {{ order.quantity }}
              </p>
              <div class="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <a
                  :href="`mailto:${order.customer_email}`"
                  class="inline-flex items-center gap-1 hover:text-accent"
                >
                  <Mail class="h-3 w-3" />{{ order.customer_email }}
                </a>
                <span v-if="order.customer_phone" class="inline-flex items-center gap-1">
                  <Phone class="h-3 w-3" />{{ order.customer_phone }}
                </span>
                <span>{{ formatDate(order.created_at) }}</span>
              </div>
              <p v-if="order.message" class="mt-2 text-sm italic text-muted-foreground">
                "{{ order.message }}"
              </p>
            </div>
            <div class="flex items-center gap-2">
              <select
                :value="order.status"
                class="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                @change="setStatus(order.id, $event.target.value)"
              >
                <option value="new">New</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                type="button"
                class="p-2 text-muted-foreground transition hover:text-destructive"
                aria-label="Delete"
                @click="remove(order.id)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Loader2, Mail, Phone, Trash2 } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { deleteOrder, listOrders, updateOrderStatus } from "@/lib/store";

const toast = useToast();
const orders = ref([]);
const loading = ref(true);

const orderStats = computed(() => [
  {
    label: "New",
    value: orders.value.filter((order) => order.status === "new").length,
    note: "Need review",
  },
  {
    label: "In progress",
    value: orders.value.filter((order) => order.status === "in_progress").length,
    note: "Active work",
  },
  {
    label: "Completed",
    value: orders.value.filter((order) => order.status === "completed").length,
    note: "Finished",
  },
  {
    label: "Cancelled",
    value: orders.value.filter((order) => order.status === "cancelled").length,
    note: "Stopped",
  },
]);

onMounted(load);

async function load() {
  loading.value = true;
  try {
    orders.value = await listOrders();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not load orders.");
  } finally {
    loading.value = false;
  }
}

async function setStatus(id, status) {
  try {
    await updateOrderStatus(id, status);
    toast.success("Updated");
    await load();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not update order.");
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

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}
</script>
