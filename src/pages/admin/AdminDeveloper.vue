<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Developer desk</p>
        <h1 class="font-display mt-2 text-3xl font-bold tracking-tight">
          System Controls & Diagnostics
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Monitor database health, trigger database seeders, check configuration, and view admin
          activity logs.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="loadStats"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin text-accent" />
        <RefreshCw v-else class="h-4 w-4" />
        Refresh metrics
      </button>
    </div>

    <!-- Diagnostic Stats Grid -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          DB Ping Latency
        </p>
        <div
          class="font-display mt-4 text-3xl font-bold"
          :class="stats?.mongodb?.ok ? 'text-green-600' : 'text-destructive'"
        >
          {{ stats?.mongodb?.latencyMs !== undefined ? `${stats.mongodb.latencyMs} ms` : "-" }}
        </div>
        <p class="mt-1 text-xs text-muted-foreground">Database roundtrip time</p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Server Uptime
        </p>
        <div class="font-display mt-4 text-3xl font-bold text-primary">
          {{ formatUptime(stats?.node?.uptime) }}
        </div>
        <p class="mt-1 text-xs text-muted-foreground">Server process running duration</p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Memory Usage
        </p>
        <div class="font-display mt-4 text-3xl font-bold text-primary">
          {{ formatMemory(stats?.node?.memory?.heapUsed) }}
        </div>
        <p class="mt-1 text-xs text-muted-foreground">
          Heap size (Total: {{ formatMemory(stats?.node?.memory?.heapTotal) }})
        </p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Environment
        </p>
        <div class="font-display mt-4 text-3xl font-bold text-primary capitalize">
          {{ stats?.env?.nodeEnv || "-" }}
        </div>
        <p class="mt-1 text-xs text-muted-foreground">Node execution context</p>
      </div>
    </section>

    <!-- Main Workspace Layout -->
    <div class="grid gap-6 lg:grid-cols-12">
      <!-- Seeding Controls & Logs -->
      <div class="space-y-6 lg:col-span-8">
        <!-- DB Operations Sandbox -->
        <div class="rounded-2xl border border-border bg-card p-6">
          <h2 class="font-display text-xl font-bold text-primary mb-3">
            Database Operations Sandbox
          </h2>
          <p class="text-sm text-muted-foreground mb-5">
            Safely execute database tasks directly from the administrative session. These operations
            write to the active database.
          </p>

          <div class="grid gap-4 sm:grid-cols-2">
            <!-- Orders Management -->
            <div class="rounded-xl border border-border p-4 bg-secondary/35">
              <h3 class="text-sm font-semibold text-primary mb-2">Orders Management</h3>
              <p class="text-xs text-muted-foreground mb-4">
                Populate or delete customer order requests.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                  :disabled="seederLoading"
                  @click="runSeeder('seed_demo_orders')"
                >
                  Seed Demo Orders
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15 disabled:opacity-60"
                  :disabled="seederLoading"
                  @click="runSeeder('clear_orders')"
                >
                  Clear Orders
                </button>
              </div>
            </div>

            <!-- Catalog Management -->
            <div class="rounded-xl border border-border p-4 bg-secondary/35">
              <h3 class="text-sm font-semibold text-primary mb-2">Catalog & Assets</h3>
              <p class="text-xs text-muted-foreground mb-4">
                Reset overrides or re-process local catalog assets.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                  :disabled="seederLoading"
                  @click="runSeeder('seed_assets')"
                >
                  Seed Assets
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15 disabled:opacity-60"
                  :disabled="seederLoading"
                  @click="runSeeder('clear_cards')"
                >
                  Clear Custom Cards
                </button>
              </div>
            </div>
          </div>

          <!-- Sandbox Execution Log Output -->
          <div
            v-if="seederOutput"
            class="mt-4 rounded-xl bg-primary text-primary-foreground font-mono text-xs p-4 overflow-x-auto shadow-inner"
          >
            <div class="flex justify-between items-center mb-1">
              <span class="text-accent font-semibold">Sandbox Execution Log</span>
              <button class="hover:underline text-[10px]" @click="seederOutput = ''">
                Clear display
              </button>
            </div>
            <pre class="whitespace-pre-wrap">{{ seederOutput }}</pre>
          </div>
        </div>

        <!-- Administrative Audit Trail -->
        <div class="rounded-2xl border border-border bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="font-display text-xl font-bold text-primary">Admin Audit Trail</h2>
              <p class="text-xs text-muted-foreground">
                Recent actions performed by administration
              </p>
            </div>
            <button
              type="button"
              class="text-xs text-accent hover:underline flex items-center gap-1"
              @click="loadLogs"
            >
              <RefreshCw class="h-3 w-3" /> Refresh logs
            </button>
          </div>

          <div v-if="logsLoading" class="flex justify-center py-12">
            <Loader2 class="h-6 w-6 animate-spin text-accent" />
          </div>
          <div
            v-else-if="logs.length === 0"
            class="rounded-xl bg-secondary p-5 text-center text-xs text-muted-foreground"
          >
            No administrative audit logs recorded.
          </div>
          <div v-else class="overflow-x-auto border-y border-border">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-border text-muted-foreground bg-secondary/20">
                  <th class="py-2.5 px-3">Timestamp</th>
                  <th class="py-2.5 px-3">Admin</th>
                  <th class="py-2.5 px-3">Action</th>
                  <th class="py-2.5 px-3">Metadata</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border font-mono text-[11px]">
                <tr v-for="log in logs" :key="log._id" class="hover:bg-secondary/25">
                  <td class="py-2 px-3 whitespace-nowrap text-muted-foreground">
                    {{ formatDate(log.created_at) }}
                  </td>
                  <td class="py-2 px-3 font-semibold text-primary">{{ log.admin_email }}</td>
                  <td class="py-2 px-3">
                    <span
                      class="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider"
                      :class="logActionClass(log.action)"
                    >
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="py-2 px-3 max-w-xs truncate" :title="JSON.stringify(log.details)">
                    {{ log.details ? JSON.stringify(log.details) : "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Environment & Settings Diagnostics -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Configuration Checks -->
        <div class="rounded-2xl border border-border bg-card p-6">
          <h2 class="font-display text-xl font-bold text-primary mb-3">Configuration Checklist</h2>
          <p class="text-sm text-muted-foreground mb-4">
            Verification status of server environment settings
          </p>

          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p class="text-xs font-semibold text-primary">Database connection</p>
                <p class="text-[10px] text-muted-foreground">MONGODB_URI variable status</p>
              </div>
              <div class="flex items-center gap-1">
                <CheckCircle2 v-if="stats?.env?.hasMongoUri" class="h-4 w-4 text-green-600" />
                <AlertCircle v-else class="h-4 w-4 text-destructive" />
                <span
                  class="text-xs font-bold"
                  :class="stats?.env?.hasMongoUri ? 'text-green-600' : 'text-destructive'"
                >
                  {{ stats?.env?.hasMongoUri ? "CONFIGURED" : "MISSING" }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p class="text-xs font-semibold text-primary">Database Namespace</p>
                <p class="text-[10px] text-muted-foreground">
                  MONGODB_DB_NAME: {{ stats?.mongodb?.database || "-" }}
                </p>
              </div>
              <div class="flex items-center gap-1">
                <CheckCircle2 v-if="stats?.env?.hasDbName" class="h-4 w-4 text-green-600" />
                <AlertCircle v-else class="h-4 w-4 text-destructive" />
                <span
                  class="text-xs font-bold"
                  :class="stats?.env?.hasDbName ? 'text-green-600' : 'text-destructive'"
                >
                  {{ stats?.env?.hasDbName ? "CONFIGURED" : "MISSING" }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p class="text-xs font-semibold text-primary">Session Security</p>
                <p class="text-[10px] text-muted-foreground">SESSION_SECRET encryption key</p>
              </div>
              <div class="flex items-center gap-1">
                <CheckCircle2 v-if="stats?.env?.hasSessionSecret" class="h-4 w-4 text-green-600" />
                <AlertCircle v-else class="h-4 w-4 text-amber-500" />
                <span
                  class="text-xs font-bold"
                  :class="stats?.env?.hasSessionSecret ? 'text-green-600' : 'text-amber-500'"
                >
                  {{ stats?.env?.hasSessionSecret ? "CONFIGURED" : "DEV FALLBACK" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Stats Details -->
        <div class="rounded-2xl border border-border bg-card p-6">
          <h2 class="font-display text-xl font-bold text-primary mb-3">System Information</h2>
          <ul class="space-y-2 text-xs divide-y divide-border">
            <li class="flex justify-between py-1.5">
              <span class="text-muted-foreground">Node Version</span>
              <span class="font-semibold text-primary">{{ stats?.node?.version || "-" }}</span>
            </li>
            <li class="flex justify-between py-1.5">
              <span class="text-muted-foreground">OS Platform</span>
              <span class="font-semibold text-primary capitalize">{{
                stats?.node?.platform || "-"
              }}</span>
            </li>
            <li class="flex justify-between py-1.5">
              <span class="text-muted-foreground">Architecture</span>
              <span class="font-semibold text-primary uppercase">{{
                stats?.node?.arch || "-"
              }}</span>
            </li>
            <li class="flex justify-between py-1.5">
              <span class="text-muted-foreground">Mongo DB counts</span>
              <div class="text-right">
                <p class="text-[10px] text-muted-foreground">
                  Admins: {{ stats?.mongodb?.counts?.admins ?? "-" }}
                </p>
                <p class="text-[10px] text-muted-foreground">
                  Orders: {{ stats?.mongodb?.counts?.orders ?? "-" }}
                </p>
                <p class="text-[10px] text-muted-foreground">
                  Catalog: {{ stats?.mongodb?.counts?.custom_card_models ?? "-" }}
                </p>
                <p class="text-[10px] text-muted-foreground">
                  Assets: {{ stats?.mongodb?.counts?.catalog_assets ?? "-" }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "@lucide/vue";

import { useToast } from "@/composables/useToast";
import { getDevStats, getAdminLogs, runAdminSeeder } from "@/lib/store";

const toast = useToast();
const loading = ref(false);
const seederLoading = ref(false);
const logsLoading = ref(false);

const stats = ref(null);
const logs = ref([]);
const seederOutput = ref("");

onMounted(async () => {
  await Promise.all([loadStats(), loadLogs()]);
});

async function loadStats() {
  loading.value = true;
  try {
    stats.value = await getDevStats();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not retrieve system stats.");
  } finally {
    loading.value = false;
  }
}

async function loadLogs() {
  logsLoading.value = true;
  try {
    const res = await getAdminLogs(50);
    logs.value = res.data || [];
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Could not retrieve admin logs.");
  } finally {
    logsLoading.value = false;
  }
}

async function runSeeder(action) {
  let confirmMsg = "";
  if (action === "clear_orders") {
    confirmMsg = "Are you sure you want to permanently clear ALL customer orders?";
  } else if (action === "clear_cards") {
    confirmMsg = "Are you sure you want to clear ALL custom cards in the catalog?";
  }

  if (confirmMsg && !confirm(confirmMsg)) return;

  seederLoading.value = true;
  seederOutput.value = `Running sandbox operation: ${action}...\n`;
  try {
    const res = await runAdminSeeder(action);
    seederOutput.value += `OK: ${res.message || "Operation completed successfully."}\n`;
    seederOutput.value += JSON.stringify(res, null, 2);
    toast.success(res.message || "Operation completed.");
    await Promise.all([loadStats(), loadLogs()]);
  } catch (err) {
    console.error(err);
    seederOutput.value += `ERROR: ${err.message || "Failed to execute."}`;
    toast.error(err.message || "Operation failed.");
  } finally {
    seederLoading.value = false;
  }
}

function formatUptime(seconds) {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}

function formatMemory(bytes) {
  if (!bytes) return "-";
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)} MB`;
}

function formatDate(val) {
  if (!val) return "-";
  return new Date(val).toLocaleString();
}

function logActionClass(action) {
  if (action === "login") return "bg-green-100 text-green-800";
  if (action.startsWith("delete_") || action.startsWith("clear_"))
    return "bg-red-100 text-red-800 border border-red-200";
  if (action.startsWith("create_") || action.startsWith("seed_"))
    return "bg-blue-100 text-blue-800 border border-blue-200";
  return "bg-amber-100 text-amber-800 border border-amber-200";
}
</script>
