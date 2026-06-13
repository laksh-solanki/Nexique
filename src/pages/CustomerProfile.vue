<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Profile Card Header -->
    <div
      class="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Customer Profile
        </p>
        <h1 class="font-display mt-2 text-3xl font-bold tracking-tight text-primary">
          {{ user?.displayName || "Valued Client" }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ user?.email }}</p>
      </div>
      <button
        type="button"
        class="click-pop inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition"
        @click="handleSignOut"
      >
        <LogOut class="h-3.5 w-3.5" /> Sign out
      </button>
    </div>

    <!-- Orders Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between border-b border-border pb-3">
        <h2 class="font-display text-2xl font-bold text-primary flex items-center gap-2">
          <Inbox class="h-5 w-5 text-accent" /> Your Order Requests
        </h2>
        <span class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          {{ orders.length }} Order{{ orders.length === 1 ? "" : "s" }}
        </span>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-6 w-6 animate-spin text-accent" />
      </div>

      <div
        v-else-if="orders.length === 0"
        class="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50"
      >
        <Inbox class="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 class="font-display mt-4 text-xl font-bold text-primary">No orders placed yet</h3>
        <p class="mt-2 text-sm text-muted-foreground">
          Browse our custom design collections and place your first bespoke order request.
        </p>
        <RouterLink
          to="/collections"
          class="click-pop mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          View collections
        </RouterLink>
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="order in orders"
          :key="order.id"
          class="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/40"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4">
              <!-- Card tint preview box matching system design -->
              <div
                class="h-14 w-20 shrink-0 rounded-lg bg-gradient-to-br bg-secondary/80 flex items-center justify-center font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border"
              >
                Card
              </div>
              <div class="min-w-0">
                <h3 class="font-display text-lg font-bold text-primary leading-tight">
                  {{ order.model_name }}
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ order.collection_name }}
                  <span v-if="order.design_variant">&middot; {{ order.design_variant }}</span>
                </p>

                <div class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span
                    >Quantity: <strong class="text-primary">{{ order.quantity }}</strong></span
                  >
                  <span>Date: {{ formatDate(order.created_at) }}</span>
                  <span v-if="order.deadline"
                    >Due:
                    <strong class="text-primary">{{ formatDate(order.deadline) }}</strong></span
                  >
                </div>
                <p
                  v-if="order.message"
                  class="mt-2 text-xs italic text-muted-foreground bg-secondary/30 rounded-lg p-2 max-w-xl"
                >
                  "{{ order.message }}"
                </p>
              </div>
            </div>

            <!-- Status tag + Cancel button -->
            <div class="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-3">
              <span
                class="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider select-none"
                :class="statusClass(order.status)"
              >
                {{ statusLabel(order.status) }}
              </span>

              <!-- Cancel Order trigger -->
              <button
                v-if="order.status === 'new'"
                type="button"
                :disabled="cancellingId === order.id"
                class="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-3.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15 transition disabled:opacity-60"
                @click="handleCancel(order.id)"
              >
                <Loader2 v-if="cancellingId === order.id" class="h-3.5 w-3.5 animate-spin" />
                Cancel request
              </button>
              <span
                v-else-if="order.status !== 'cancelled'"
                class="text-[10px] text-muted-foreground italic select-none"
              >
                Processing (ReadOnly)
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Inbox, Loader2, LogOut } from "@lucide/vue";

import { onAuthState, logOut, getFirebaseToken } from "@/lib/firebase";
import { getCustomerOrders, cancelCustomerOrder } from "@/lib/store";
import { useToast } from "@/composables/useToast";
import { statusClass, statusLabel } from "@/lib/orderWorkflow";

const router = useRouter();
const toast = useToast();

const user = ref(null);
const orders = ref([]);
const loading = ref(true);
const cancellingId = ref("");

onMounted(() => {
  onAuthState(async (currentUser) => {
    if (!currentUser) {
      toast.info("Please sign in to view your profile.");
      router.push({ name: "login" });
      return;
    }
    user.value = currentUser;
    await fetchOrders();
  });
});

async function fetchOrders() {
  loading.value = true;
  try {
    const token = await getFirebaseToken();
    const res = await getCustomerOrders(token);
    orders.value = res.data || [];
  } catch (err) {
    console.error(err);
    toast.error("Failed to load your orders.");
  } finally {
    loading.value = false;
  }
}

async function handleCancel(orderId) {
  if (!confirm("Are you sure you want to cancel this order request?")) return;

  cancellingId.value = orderId;
  try {
    const token = await getFirebaseToken();
    await cancelCustomerOrder(orderId, token);
    toast.success("Order request cancelled.");
    await fetchOrders();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to cancel order.");
  } finally {
    cancellingId.value = "";
  }
}

async function handleSignOut() {
  try {
    await logOut();
    toast.success("Signed out successfully.");
    router.push("/");
  } catch (err) {
    console.error(err);
    toast.error("Could not sign out.");
  }
}

function formatDate(val) {
  if (!val) return "";
  return new Date(val).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>
