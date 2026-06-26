<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-up">
    <!-- Back to Home navigation -->
    <div class="mb-6">
      <RouterLink
        to="/"
        class="click-pop inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-accent/40 shadow-sm transition"
      >
        <ArrowLeft class="h-3.5 w-3.5" /> Back to Home
      </RouterLink>
    </div>

    <!-- Profile Header Banner -->
    <div
      class="mb-8 rounded-2xl border border-border bg-card/75 backdrop-blur-md p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden"
    >
      <!-- Premium background tint matching branding -->
      <div class="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-accent/5 blur-3xl"></div>

      <div class="flex items-center gap-4">
        <!-- Initials Avatar with dynamic customizer color -->
        <div
          class="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center font-display text-2xl font-bold text-white shadow-md transition-all duration-300"
          :class="avatarBgClass"
        >
          {{ userInitials }}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="font-display text-2xl font-bold tracking-tight text-primary truncate">
              {{ user?.displayName || "Valued Client" }}
            </h1>
            <span
              class="rounded-full bg-accent/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent select-none"
            >
              Client Member
            </span>
          </div>
          <p class="mt-0.5 text-sm text-muted-foreground truncate">{{ user?.email }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="click-pop inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition shadow-sm"
          @click="handleSignOut"
        >
          <LogOut class="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>

    <!-- Metrics Cards Grid -->
    <section class="mb-8 grid gap-4 grid-cols-2 sm:grid-cols-3">
      <div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Total Requests
        </p>
        <p class="font-display mt-2 text-3xl font-bold text-primary">{{ orders.length }}</p>
        <p class="mt-1 text-[10px] text-muted-foreground">Bespoke card orders placed</p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Active Work
        </p>
        <p class="font-display mt-2 text-3xl font-bold text-accent">{{ activeOrdersCount }}</p>
        <p class="mt-1 text-[10px] text-muted-foreground">Designs currently in workflow</p>
      </div>
      <div
        class="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between"
      >
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Account Status
          </p>
          <p
            class="font-display mt-2 text-xl font-bold text-emerald-600 flex items-center gap-1.5 leading-none"
          >
            <CheckCircle2 class="h-4.5 w-4.5" /> Active Verified
          </p>
        </div>
        <p class="mt-1 text-[10px] text-muted-foreground">Authenticated via secure session</p>
      </div>
    </section>

    <!-- Tabbed Navigation Panel -->
    <div class="mb-6 border-b border-border">
      <nav class="-mb-px flex gap-6" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="click-pop relative pb-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
          :class="
            activeTab === tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-primary hover:border-border'
          "
          @click="activeTab = tab.id"
        >
          <span class="flex items-center gap-2">
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.name }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Loader state during profile loading -->
    <div v-if="pageLoading" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="h-8 w-8 animate-spin text-accent" />
      <p class="mt-4 text-xs text-muted-foreground">
        Synchronizing your dashboard with database...
      </p>
    </div>

    <div v-else>
      <!-- Tab 1: Orders and Status Tracker -->
      <section v-if="activeTab === 'orders'" class="space-y-6 animate-fade-up">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl font-bold text-primary flex items-center gap-2">
            <ClipboardList class="h-5 w-5 text-accent" /> Custom Design Portfolio
          </h2>
          <button
            type="button"
            class="text-xs text-accent hover:underline flex items-center gap-1"
            @click="fetchOrders"
          >
            Refresh records
          </button>
        </div>

        <div
          v-if="orders.length === 0"
          class="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50"
        >
          <Inbox class="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h3 class="font-display mt-4 text-xl font-bold text-primary">No orders requests found</h3>
          <p class="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
            Submit your first bespoke request using our constructor or browse predefined studio
            cards.
          </p>
          <div class="mt-5 flex justify-center gap-3">
            <button
              type="button"
              class="click-pop rounded-full bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition shadow-sm"
              @click="activeTab = 'custom-request'"
            >
              Request custom card
            </button>
            <RouterLink
              to="/collections"
              class="click-pop rounded-full border border-border bg-background px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-accent/30 transition shadow-sm"
            >
              Browse collections
            </RouterLink>
          </div>
        </div>

        <div v-else class="space-y-6">
          <article
            v-for="order in orders"
            :key="order.id"
            class="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-accent/40"
          >
            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4"
            >
              <div class="flex items-start gap-4">
                <!-- Preview card color styling block -->
                <div
                  class="h-14 w-20 shrink-0 rounded-lg bg-linear-to-br bg-secondary/80 flex items-center justify-center font-display text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest border border-border"
                >
                  Model
                </div>
                <div class="min-w-0">
                  <h3 class="font-display text-lg font-bold text-primary leading-tight">
                    {{ order.model_name }}
                  </h3>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Category:
                    <span class="font-semibold text-primary">{{ order.collection_name }}</span>
                    <span v-if="order.design_variant"
                      >&middot; Theme: {{ order.design_variant }}</span
                    >
                  </p>
                  <div
                    class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground"
                  >
                    <span
                      >Qty: <strong class="text-primary">{{ order.quantity }}</strong></span
                    >
                    <span>Date: {{ formatDate(order.created_at) }}</span>
                    <span v-if="order.deadline"
                      >Required:
                      <strong class="text-primary">{{ formatDate(order.deadline) }}</strong></span
                    >
                  </div>
                </div>
              </div>

              <!-- Status controls and Cancel actions -->
              <div
                class="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-3"
              >
                <span
                  class="rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider"
                  :class="statusClass(order.status)"
                >
                  {{ statusLabel(order.status) }}
                </span>

                <button
                  v-if="order.status === 'new'"
                  type="button"
                  :disabled="cancellingId === order.id"
                  class="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/15 transition disabled:opacity-60"
                  @click="handleCancel(order.id)"
                >
                  <Loader2 v-if="cancellingId === order.id" class="h-3 w-3 animate-spin" />
                  Cancel Request
                </button>
                <span
                  v-else-if="order.status !== 'cancelled'"
                  class="text-[10px] text-muted-foreground italic select-none"
                >
                  Processing (Locked)
                </span>
              </div>
            </div>

            <!-- Custom Message details -->
            <div
              v-if="order.message"
              class="my-4 text-xs italic text-muted-foreground bg-secondary/30 rounded-xl p-3 max-w-2xl border border-border/50"
            >
              "{{ order.message }}"
            </div>

            <!-- Dynamic Workflow Stepper -->
            <div v-if="order.status !== 'cancelled'" class="mt-6 pt-4 border-t border-border/40">
              <p class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Design Proof Workflow progress
              </p>

              <div class="relative flex items-center justify-between px-2 sm:px-6">
                <!-- Connect Line -->
                <div
                  class="absolute left-6 right-6 top-[11px] h-0.5 bg-border -translate-y-1/2 -z-10"
                ></div>
                <div
                  class="absolute left-6 top-[11px] h-0.5 bg-accent -translate-y-1/2 -z-10 transition-all duration-700 ease-in-out"
                  :style="{ width: `${(getStepIndex(order.status) / 4) * 88}%` }"
                ></div>

                <!-- Stepper Nodes -->
                <div
                  v-for="(step, idx) in stepperSteps"
                  :key="step.label"
                  class="flex flex-col items-center"
                >
                  <div
                    class="h-5.5 w-5.5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all duration-500"
                    :class="
                      idx <= getStepIndex(order.status)
                        ? 'bg-accent border-accent text-white shadow-sm scale-110'
                        : 'bg-background border-border text-muted-foreground'
                    "
                  >
                    <Check v-if="idx < getStepIndex(order.status)" class="h-3 w-3" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <span
                    class="text-[9px] font-semibold mt-2.5 bg-card px-1 transition-colors duration-300"
                    :class="
                      idx <= getStepIndex(order.status) ? 'text-primary' : 'text-muted-foreground'
                    "
                  >
                    {{ step.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Cancelled Alert Callout -->
            <div
              v-else
              class="mt-4 rounded-xl border border-destructive/15 bg-destructive/5 p-3 flex items-center gap-2 text-xs text-destructive"
            >
              <AlertCircle class="h-4 w-4 shrink-0" />
              This request was cancelled on the client's request. To submit modifications, please
              initiate a new request.
            </div>
          </article>
        </div>
      </section>

      <!-- Tab 2: Place Custom Request ("customer items add" feature) -->
      <section
        v-else-if="activeTab === 'custom-request'"
        class="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-up"
      >
        <div class="mb-6 flex items-center gap-2 border-b border-border pb-3">
          <Sparkles class="h-5 w-5 text-accent" />
          <div>
            <h2 class="font-display text-xl font-bold text-primary">Submit Bespoke Card Request</h2>
            <p class="text-xs text-muted-foreground">
              Order a fully custom card styling directly created for your project.
            </p>
          </div>
        </div>

        <form @submit.prevent="submitCustomRequest" class="grid gap-4 sm:grid-cols-2">
          <!-- Card Title -->
          <div class="space-y-1.5 sm:col-span-2">
            <label
              for="custom_model_name"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Card design request title *
            </label>
            <input
              id="custom_model_name"
              v-model.trim="customForm.model_name"
              type="text"
              required
              maxlength="100"
              placeholder="e.g., Emily & Jack's Gold Foil Wedding Suite"
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <!-- Collection category dropdown -->
          <div class="space-y-1.5">
            <label
              for="custom_collection_name"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Design category / Event *
            </label>
            <select
              id="custom_collection_name"
              v-model="customForm.collection_name"
              required
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="" disabled>Select event category</option>
              <option value="Wedding Suite">Wedding Suite</option>
              <option value="Greeting Card">Greeting Card</option>
              <option value="Business Cards">Business Cards</option>
              <option value="Valentine Collection">Valentine Collection</option>
              <option value="Playing Cards">Playing Cards</option>
              <option value="Custom Event Portfolio">Custom Event Portfolio</option>
            </select>
          </div>

          <!-- Theme variant input -->
          <div class="space-y-1.5">
            <label
              for="custom_design_variant"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Preferred theme / Material variant
            </label>
            <input
              id="custom_design_variant"
              v-model.trim="customForm.design_variant"
              type="text"
              maxlength="80"
              placeholder="e.g., Heavy Cotton Matte, Letterpress"
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <!-- Quantity input -->
          <div class="space-y-1.5">
            <label
              for="custom_quantity"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Quantity needed *
            </label>
            <input
              id="custom_quantity"
              v-model.number="customForm.quantity"
              type="number"
              min="1"
              max="10000"
              required
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <!-- Deadline Date -->
          <div class="space-y-1.5">
            <label
              for="custom_deadline"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Required by (optional deadline)
            </label>
            <input
              id="custom_deadline"
              v-model="customForm.deadline"
              type="date"
              class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <!-- Telephone number -->
          <div class="space-y-1.5 sm:col-span-2">
            <label
              for="custom_phone"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Contact Phone number *
            </label>
            <div class="relative">
              <input
                id="custom_phone"
                v-model.trim="customForm.customer_phone"
                type="text"
                required
                maxlength="30"
                placeholder="+1 (555) 012-3456"
                class="min-h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <Phone class="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <!-- Message box -->
          <div class="space-y-1.5 sm:col-span-2">
            <label
              for="custom_message"
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Design specifications / Editorial notes
            </label>
            <textarea
              id="custom_message"
              v-model.trim="customForm.message"
              rows="4"
              maxlength="1000"
              placeholder="Specify calligraphy preferences, text layouts, wording, ink colors..."
              class="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            ></textarea>
          </div>

          <!-- Submit button -->
          <div class="mt-2 flex justify-end sm:col-span-2">
            <button
              type="submit"
              :disabled="submittingCustom"
              class="click-pop ripple inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/95 disabled:opacity-60"
            >
              <Loader2 v-if="submittingCustom" class="h-4 w-4 animate-spin" />
              <Plus v-else class="h-4 w-4" />
              {{ submittingCustom ? "Submitting Request..." : "Add custom design request" }}
            </button>
          </div>
        </form>
      </section>

      <!-- Tab 3: Account and Settings -->
      <section v-else-if="activeTab === 'settings'" class="space-y-6 animate-fade-up">
        <!-- Settings Form Card -->
        <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 class="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Settings class="h-5 w-5 text-accent" /> Profile Configuration
          </h2>

          <form @submit.prevent="saveProfileSettings" class="space-y-4">
            <!-- Full Name input -->
            <div class="space-y-1.5">
              <label
                for="settings_display_name"
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Display name
              </label>
              <input
                id="settings_display_name"
                v-model.trim="profileForm.displayName"
                type="text"
                required
                maxlength="100"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <!-- Email (disabled, read-only) -->
            <div class="space-y-1.5">
              <label
                for="settings_email"
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Primary Email
              </label>
              <input
                id="settings_email"
                v-model="user.email"
                disabled
                class="min-h-11 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm outline-none cursor-not-allowed opacity-80"
              />
              <p class="text-[10px] text-muted-foreground">
                Contact Nexique support to alter your primary email credential.
              </p>
            </div>

            <!-- Phone number -->
            <div class="space-y-1.5">
              <label
                for="settings_phone"
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Phone Number
              </label>
              <input
                id="settings_phone"
                v-model.trim="profileForm.phone"
                type="text"
                maxlength="30"
                placeholder="+1 (555) 012-3456"
                class="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <!-- User Theme Avatar customization -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Avatar color theme</span
              >
              <div class="flex flex-wrap gap-3 mt-1.5">
                <button
                  v-for="color in themeColors"
                  :key="color.id"
                  type="button"
                  class="click-pop px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition"
                  :class="
                    profileForm.avatarColor === color.id
                      ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20'
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                  "
                  @click="profileForm.avatarColor = color.id"
                >
                  <div class="h-3.5 w-3.5 rounded-full" :class="color.colorClass"></div>
                  {{ color.name }}
                </button>
              </div>
            </div>

            <!-- Newsletter checkbox -->
            <div class="flex items-start gap-2 pt-2">
              <input
                id="settings_newsletter"
                v-model="profileForm.newsletter"
                type="checkbox"
                class="mt-1 rounded border-border bg-background text-accent outline-none focus:ring-accent"
              />
              <label for="settings_newsletter" class="text-xs text-muted-foreground select-none">
                Subscribe to Nexique Editorial Newsletter. Receive design drops, print suggestions,
                and portfolio launches.
              </label>
            </div>

            <!-- Save buttons -->
            <div class="mt-4 flex justify-end">
              <button
                type="submit"
                :disabled="savingSettings"
                class="click-pop ripple inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/95 disabled:opacity-60"
              >
                <Loader2 v-if="savingSettings" class="h-4 w-4 animate-spin" />
                {{ savingSettings ? "Saving configuration..." : "Save details" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Billing Info section -->
        <div
          class="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="flex items-start gap-3">
            <div class="mt-1 p-2 rounded-xl bg-secondary/80 text-accent border border-border">
              <CreditCard class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-display text-lg font-bold text-primary">Billing Details</h3>
              <p v-if="profile?.billing" class="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Saved for: <strong>{{ profile.billing.cardholderName || user?.displayName }}</strong
                ><br />
                {{ profile.billing.street }}, {{ profile.billing.city }},
                {{ profile.billing.state }} {{ profile.billing.zip }}, {{ profile.billing.country }}
              </p>
              <p v-else class="text-xs text-muted-foreground mt-0.5">
                No billing credentials registered yet. Register details to expedite design quotes
                and billing agreements.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="click-pop shrink-0 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-primary hover:border-accent/30 transition shadow-sm"
            @click="showBillingModal = true"
          >
            {{ profile?.billing ? "Update billing details" : "Register billing info" }}
          </button>
        </div>
      </section>
    </div>

    <!-- Billing Dialog Box Modal -->
    <Transition name="modal-fade">
      <div
        v-if="showBillingModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-labelledby="billing-dialog-title"
        role="dialog"
        aria-modal="true"
        @click.self="showBillingModal = false"
      >
        <div
          class="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-up"
        >
          <!-- Close button -->
          <button
            type="button"
            class="click-pop absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition"
            aria-label="Close dialog"
            @click="showBillingModal = false"
          >
            <X class="h-4.5 w-4.5" />
          </button>

          <!-- Modal Header -->
          <div class="mb-5 flex items-start gap-2.5">
            <div class="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20">
              <CreditCard class="h-5 w-5" />
            </div>
            <div>
              <h3 id="billing-dialog-title" class="font-display text-xl font-bold text-primary">
                Edit Billing Credentials
              </h3>
              <p class="text-xs text-muted-foreground">
                These credentials populate invoice documentation and design contracts. Stored
                securely on MongoDB.
              </p>
            </div>
          </div>

          <!-- Modal Form -->
          <form @submit.prevent="saveBillingDetails" class="space-y-4">
            <!-- Cardholder Name -->
            <div class="space-y-1">
              <label
                for="billing_name"
                class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Cardholder full name *
              </label>
              <input
                id="billing_name"
                v-model.trim="billingForm.cardholderName"
                type="text"
                required
                maxlength="100"
                placeholder="e.g. Dwij Solanki"
                class="min-h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <!-- Billing address: Street -->
            <div class="space-y-1">
              <label
                for="billing_street"
                class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Street Address *
              </label>
              <input
                id="billing_street"
                v-model.trim="billingForm.street"
                type="text"
                required
                maxlength="200"
                placeholder="e.g., 456 Luxury Prints Blvd"
                class="min-h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <!-- City and State Grid -->
            <div class="grid gap-4 grid-cols-2">
              <div class="space-y-1">
                <label
                  for="billing_city"
                  class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  City *
                </label>
                <input
                  id="billing_city"
                  v-model.trim="billingForm.city"
                  type="text"
                  required
                  maxlength="100"
                  placeholder="e.g., Mumbai"
                  class="min-h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div class="space-y-1">
                <label
                  for="billing_state"
                  class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  State / Province *
                </label>
                <input
                  id="billing_state"
                  v-model.trim="billingForm.state"
                  type="text"
                  required
                  maxlength="100"
                  placeholder="e.g., Maharashtra"
                  class="min-h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <!-- Zip and Country Grid -->
            <div class="grid gap-4 grid-cols-2">
              <div class="space-y-1">
                <label
                  for="billing_zip"
                  class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Zip / Postal Code *
                </label>
                <input
                  id="billing_zip"
                  v-model.trim="billingForm.zip"
                  type="text"
                  required
                  maxlength="20"
                  placeholder="e.g., 400001"
                  class="min-h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div class="space-y-1">
                <label
                  for="billing_country"
                  class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Country *
                </label>
                <input
                  id="billing_country"
                  v-model.trim="billingForm.country"
                  type="text"
                  required
                  maxlength="100"
                  placeholder="e.g., India"
                  class="min-h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <!-- Action buttons -->
            <div class="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                class="click-pop rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition"
                @click="showBillingModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="savingBilling"
                class="click-pop ripple rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition flex items-center gap-1.5"
              >
                <Loader2 v-if="savingBilling" class="h-3.5 w-3.5 animate-spin" />
                Save Billing Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Inbox,
  Loader2,
  LogOut,
  ArrowLeft,
  User,
  Plus,
  CreditCard,
  Settings,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  X,
  Check,
} from "@lucide/vue";

import { onAuthState, logOut, getFirebaseToken, updateFirebaseProfile } from "@/lib/firebase";
import {
  getCustomerOrders,
  cancelCustomerOrder,
  createOrder,
  getCustomerProfile,
  updateCustomerProfile,
} from "@/lib/store";
import { useToast } from "@/composables/useToast";
import { statusClass, statusLabel } from "@/lib/orderWorkflow";

const router = useRouter();
const toast = useToast();

const user = ref(null);
const profile = ref(null);
const orders = ref([]);
const activeTab = ref("orders");

const pageLoading = ref(true);
const savingSettings = ref(false);
const savingBilling = ref(false);
const cancellingId = ref("");
const submittingCustom = ref(false);
const showBillingModal = ref(false);

const stepperSteps = [
  { label: "Submitted" },
  { label: "Reviewed" },
  { label: "Proofing" },
  { label: "Production" },
  { label: "Delivered" },
];

const themeColors = [
  { id: "accent", name: "Steel Accent", colorClass: "bg-accent" },
  { id: "blue", name: "Deep Indigo", colorClass: "bg-blue-600" },
  { id: "gold", name: "Saffron Gold", colorClass: "bg-amber-500" },
  { id: "burgundy", name: "Imperial Burgundy", colorClass: "bg-rose-800" },
];

const tabs = [
  { id: "orders", name: "Orders & Proofs", icon: ClipboardList },
  { id: "custom-request", name: "Custom Request", icon: Plus },
  { id: "settings", name: "Account & Settings", icon: User },
];

// Profile forms state
const profileForm = reactive({
  displayName: "",
  phone: "",
  newsletter: false,
  avatarColor: "accent",
});

// Billing form state
const billingForm = reactive({
  cardholderName: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
});

// Custom card request state
const customForm = reactive({
  model_name: "",
  collection_name: "",
  design_variant: "",
  quantity: 100,
  deadline: "",
  customer_phone: "",
  message: "",
});

let signingOut = false;

onMounted(() => {
  onAuthState(async (currentUser) => {
    if (!currentUser) {
      if (!signingOut) {
        toast.info("Please sign in to view your profile.");
      }
      router.push({ name: "login" });
      return;
    }
    user.value = currentUser;
    profileForm.displayName = currentUser.displayName || "";

    await Promise.all([fetchOrders(), fetchProfile()]);
    pageLoading.value = false;
  });
});

const userInitials = computed(() => {
  if (!user.value) return "N";
  const name = user.value.displayName || user.value.email || "";
  const parts = name.split(/[\s@]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const avatarBgClass = computed(() => {
  const color = profileForm.avatarColor;
  if (color === "blue") return "bg-gradient-to-br from-blue-500 to-indigo-600";
  if (color === "gold") return "bg-gradient-to-br from-amber-400 to-yellow-600";
  if (color === "burgundy") return "bg-gradient-to-br from-rose-800 to-red-950";
  return "bg-gradient-to-br from-accent to-primary";
});

const activeOrdersCount = computed(() => {
  return orders.value.filter((order) =>
    ["new", "contacted", "proofing", "in_production"].includes(order.status),
  ).length;
});

async function handleSignOut() {
  try {
    signingOut = true;
    await logOut();
    router.push({ name: "login" });
  } catch (err) {
    console.error(err);
    toast.error("Failed to sign out.");
    signingOut = false;
  }
}

async function fetchOrders() {
  try {
    const token = await getFirebaseToken();
    const res = await getCustomerOrders(token);
    orders.value = res.data || [];
  } catch (err) {
    console.error(err);
    toast.error("Failed to load your orders.");
  }
}

async function fetchProfile() {
  try {
    const token = await getFirebaseToken();
    const data = await getCustomerProfile(token);
    profile.value = data || null;
    if (data) {
      profileForm.phone = data.phone || "";
      profileForm.newsletter = !!data.preferences?.newsletter;
      profileForm.avatarColor = data.preferences?.avatarColor || "accent";

      // Auto populate phone in custom order form if available
      if (data.phone) {
        customForm.customer_phone = data.phone;
      }

      // Load billing details
      if (data.billing) {
        billingForm.cardholderName = data.billing.cardholderName || "";
        billingForm.street = data.billing.street || "";
        billingForm.city = data.billing.city || "";
        billingForm.state = data.billing.state || "";
        billingForm.zip = data.billing.zip || "";
        billingForm.country = data.billing.country || "";
      }
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to retrieve profile configuration.");
  }
}

async function saveProfileSettings() {
  savingSettings.value = true;
  try {
    const token = await getFirebaseToken();

    // Sync display name with Firebase Auth
    if (profileForm.displayName && profileForm.displayName !== user.value.displayName) {
      await updateFirebaseProfile(profileForm.displayName);
      user.value.displayName = profileForm.displayName;
    }

    // Update preferences in MongoDB profile
    const response = await updateCustomerProfile(
      {
        phone: profileForm.phone,
        billing: profile.value?.billing || null,
        preferences: {
          newsletter: profileForm.newsletter,
          avatarColor: profileForm.avatarColor,
          accentColor: "default",
        },
      },
      token,
    );

    profile.value = response;
    toast.success("Profile configuration updated successfully.");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to update profile configurations.");
  } finally {
    savingSettings.value = false;
  }
}

async function saveBillingDetails() {
  savingBilling.value = true;
  try {
    const token = await getFirebaseToken();
    const response = await updateCustomerProfile(
      {
        phone: profileForm.phone,
        billing: {
          cardholderName: billingForm.cardholderName,
          street: billingForm.street,
          city: billingForm.city,
          state: billingForm.state,
          zip: billingForm.zip,
          country: billingForm.country,
        },
        preferences: {
          newsletter: profileForm.newsletter,
          avatarColor: profileForm.avatarColor,
          accentColor: "default",
        },
      },
      token,
    );

    profile.value = response;
    showBillingModal.value = false;
    toast.success("Billing credentials registered successfully.");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to save billing information.");
  } finally {
    savingBilling.value = false;
  }
}

async function submitCustomRequest() {
  if (!customForm.model_name || !customForm.collection_name || !customForm.customer_phone) {
    toast.error("Please fill in all required fields.");
    return;
  }

  submittingCustom.value = true;
  try {
    const deadlineVal = customForm.deadline ? new Date(customForm.deadline).toISOString() : null;

    await createOrder({
      customer_name: user.value.displayName || user.value.email.split("@")[0].toUpperCase(),
      customer_email: user.value.email,
      customer_phone: customForm.customer_phone,
      quantity: Number(customForm.quantity || 100),
      message: customForm.message || "Bespoke Request submitted from Customer profile.",
      collection_slug: customForm.collection_name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      collection_name: customForm.collection_name,
      model_slug: customForm.model_name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      model_name: customForm.model_name,
      design_variant: customForm.design_variant || "Custom Request Theme",
      customer_uid: user.value.uid,
      deadline: deadlineVal,
    });

    toast.success("Bespoke request added to portfolio!");

    // Reset custom request form fields, saving the phone number
    const savedPhone = customForm.customer_phone;
    Object.keys(customForm).forEach((key) => {
      customForm[key] = "";
    });
    customForm.quantity = 100;
    customForm.customer_phone = savedPhone;

    await fetchOrders();
    activeTab.value = "orders";
  } catch (err) {
    console.error(err);
    toast.error("Could not register custom request. Try again or email Nexique.");
  } finally {
    submittingCustom.value = false;
  }
}

async function handleCancel(orderId) {
  if (!confirm("Are you sure you want to cancel this design request?")) return;

  cancellingId.value = orderId;
  try {
    const token = await getFirebaseToken();
    await cancelCustomerOrder(orderId, token);
    toast.success("Design request has been cancelled.");
    await fetchOrders();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to cancel request.");
  } finally {
    cancellingId.value = "";
  }
}

function getStepIndex(status) {
  switch (status) {
    case "new":
      return 0;
    case "contacted":
      return 1;
    case "proofing":
      return 2;
    case "in_production":
      return 3;
    case "completed":
      return 4;
    default:
      return 0;
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

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
