<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Admin Desk</p>
        <h1 class="font-display mt-2 text-3xl font-bold tracking-tight text-primary">
          Customers Summary
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          View aggregated profile analytics, total orders, estimated expenditures, and order history
          per client.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="load"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin text-accent" />
        <RefreshCw v-else class="h-4 w-4" />
        Refresh
      </button>
    </div>

    <!-- Search bar filter -->
    <div class="rounded-2xl border border-border bg-card p-4">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          v-model.trim="search"
          type="search"
          placeholder="Search customers by name, email, or phone..."
          class="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading && customers.length === 0" class="flex justify-center py-16">
      <Loader2 class="h-6 w-6 animate-spin text-accent" />
    </div>

    <!-- Empty customer state -->
    <div
      v-else-if="filteredCustomers.length === 0"
      class="rounded-2xl border border-border bg-card p-10 text-center"
    >
      <h3 class="font-display text-xl font-bold text-primary">No customers found</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Adjust search parameters or verify if any orders are recorded in the database.
      </p>
    </div>

    <!-- Responsive Customers Table -->
    <div v-else class="rounded-2xl border border-border bg-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr
              class="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <th class="p-4">Customer</th>
              <th class="p-4">Total Orders</th>
              <th class="p-4">Active Orders</th>
              <th class="p-4">Est. Spent</th>
              <th class="p-4">Last Order</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="cust in filteredCustomers"
              :key="cust.email"
              class="hover:bg-secondary/15 transition-colors"
            >
              <td class="p-4">
                <div class="font-semibold text-primary text-base">{{ cust.customer_name }}</div>
                <div class="text-xs text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                  <span class="inline-flex items-center gap-1">
                    <Mail class="h-3 w-3" /> {{ cust.email }}
                  </span>
                  <span
                    v-if="cust.customer_phone"
                    class="inline-flex items-center gap-1 text-[10px]"
                  >
                    <Phone class="h-3 w-3" /> {{ cust.customer_phone }}
                  </span>
                </div>
              </td>
              <td class="p-4 text-primary font-medium text-base">
                {{ cust.total_orders }}
              </td>
              <td class="p-4">
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="
                    cust.active_orders > 0
                      ? 'bg-accent/10 text-accent'
                      : 'bg-secondary text-muted-foreground'
                  "
                >
                  {{ cust.active_orders }} active
                </span>
              </td>
              <td class="p-4 text-primary font-semibold">
                {{ formatPrice(cust.total_spent) }}
              </td>
              <td class="p-4 text-muted-foreground text-xs">
                {{ formatDate(cust.last_order_at) }}
              </td>
              <td class="p-4 text-right">
                <button
                  type="button"
                  class="click-pop inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-all"
                  @click="openDetails(cust)"
                >
                  View details &rarr;
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Slide-out Details Drawer Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="selectedCustomer"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-border bg-card shadow-gold p-6 flex flex-col justify-between overflow-y-auto animate-flip-in"
      >
        <div>
          <!-- Drawer Header -->
          <div class="flex items-start justify-between border-b border-border pb-4 mb-5">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-accent">
                Client Details
              </p>
              <h2 class="font-display text-2xl font-bold text-primary mt-1">
                {{ selectedCustomer.customer_name }}
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Mail class="h-3.5 w-3.5" /> {{ selectedCustomer.email }}
              </p>
              <p
                v-if="selectedCustomer.customer_phone"
                class="text-xs text-muted-foreground mt-1 flex items-center gap-1"
              >
                <Phone class="h-3.5 w-3.5" /> {{ selectedCustomer.customer_phone }}
              </p>
            </div>
            <button
              type="button"
              class="click-pop inline-flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary transition"
              @click="selectedCustomer = null"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Customer stats breakdown -->
          <div
            class="grid grid-cols-3 gap-2 rounded-xl bg-secondary/40 p-3 mb-6 text-center text-xs"
          >
            <div>
              <div class="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">
                Total Orders
              </div>
              <div class="font-display text-lg font-bold text-primary mt-1">
                {{ selectedCustomer.total_orders }}
              </div>
            </div>
            <div>
              <div class="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">
                Active processing
              </div>
              <div class="font-display text-lg font-bold text-accent mt-1">
                {{ selectedCustomer.active_orders }}
              </div>
            </div>
            <div>
              <div class="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">
                Total Spent
              </div>
              <div class="font-display text-lg font-bold text-green-600 mt-1">
                {{ formatPrice(selectedCustomer.total_spent) }}
              </div>
            </div>
          </div>

          <!-- Order lists inside Drawer -->
          <h3 class="font-display text-lg font-bold text-primary mb-3">Order History</h3>
          <div class="space-y-3">
            <div
              v-for="order in selectedCustomer.orders"
              :key="order.id"
              class="rounded-xl border border-border p-3 hover:border-accent/30 transition bg-secondary/10"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h4 class="font-semibold text-primary text-sm">{{ order.model_name }}</h4>
                  <p class="text-[11px] text-muted-foreground">
                    {{ order.collection_name }} &middot; Qty {{ order.quantity }}
                  </p>
                  <p class="text-[10px] text-muted-foreground mt-1">
                    Placed: {{ formatDate(order.created_at) }}
                  </p>
                  <p v-if="order.deadline" class="text-[10px] font-semibold text-accent mt-0.5">
                    Due: {{ formatDate(order.deadline) }}
                  </p>
                </div>
                <div class="flex flex-col items-end gap-1.5">
                  <span
                    class="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    :class="statusClass(order.status)"
                  >
                    {{ statusLabel(order.status) }}
                  </span>
                  <span
                    v-if="order.priority === 'rush'"
                    class="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse"
                  >
                    RUSH
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="click-pop w-full mt-6 rounded-full border border-border bg-background py-2 text-xs font-semibold hover:bg-secondary transition-all"
          @click="selectedCustomer = null"
        >
          Close details
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Loader2, Mail, Phone, RefreshCw, Search, X } from "@lucide/vue";

import { getAdminCustomers } from "@/lib/store";
import { useToast } from "@/composables/useToast";
import { statusClass, statusLabel } from "@/lib/orderWorkflow";

const toast = useToast();
const loading = ref(true);
const search = ref("");
const customers = ref([]);
const selectedCustomer = ref(null);

const filteredCustomers = computed(() => {
  const query = search.value.toLowerCase().trim();
  if (!query) return customers.value;
  return customers.value.filter((cust) => {
    return (
      cust.customer_name.toLowerCase().includes(query) ||
      cust.email.toLowerCase().includes(query) ||
      cust.customer_phone.toLowerCase().includes(query)
    );
  });
});

onMounted(load);

async function load() {
  loading.value = true;
  try {
    customers.value = await getAdminCustomers();
  } catch (err) {
    console.error(err);
    toast.error("Could not fetch customer analytics.");
  } finally {
    loading.value = false;
  }
}

function openDetails(cust) {
  selectedCustomer.value = cust;
}

function formatPrice(val) {
  if (val === undefined || val === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

function formatDate(val) {
  if (!val) return "-";
  return new Date(val).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>
