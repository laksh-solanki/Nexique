<template>
  <header :class="headerClass">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:py-5"
    >
      <RouterLink to="/" class="group inline-flex min-w-0 items-center" @click="closeMenu">
        <BrandLockup />
      </RouterLink>

      <div
        class="hidden items-center gap-5 text-[12px] font-medium uppercase tracking-[0.16em] md:flex lg:gap-7 lg:text-[13px] lg:tracking-[0.18em]"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="relative text-foreground/80 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:content-[''] hover:text-accent hover:after:w-full"
          :class="{ 'text-accent': isActiveNav(item) }"
        >
          {{ item.label }}
        </RouterLink>

        <RouterLink
          :to="accountPath"
          class="click-pop inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/85 text-primary shadow-sm transition hover:border-accent/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          :class="{ 'border-accent/50 text-accent': isActivePath(accountPath) }"
          :aria-label="accountLabel"
          :title="accountLabel"
        >
          <component :is="accountIcon" class="h-4 w-4" />
        </RouterLink>

        <RouterLink
          to="/collections"
          class="click-pop ripple inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-primary-foreground transition-all hover:bg-accent lg:px-5 lg:tracking-[0.18em]"
        >
          <ShoppingBag class="h-3.5 w-3.5" />
          Order Now
        </RouterLink>
      </div>

      <button
        type="button"
        class="click-pop inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/90 text-primary shadow-sm transition hover:border-accent/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/25 md:hidden"
        :aria-label="mobileMenuOpen ? 'Close navigation' : 'Open navigation'"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-navigation"
        @click="toggleMenu"
      >
        <X v-if="mobileMenuOpen" class="h-5 w-5" />
        <Menu v-else class="h-5 w-5" />
      </button>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        id="mobile-navigation"
        class="border-t border-border bg-background/95 shadow-sm backdrop-blur-md md:hidden"
      >
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80 transition hover:bg-secondary hover:text-accent"
            :class="{ 'bg-accent/10 text-accent': isActiveNav(item) }"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>

          <div class="mt-2 flex items-center gap-2 border-t border-border pt-3">
            <RouterLink
              :to="accountPath"
              class="click-pop inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition hover:border-accent/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              :class="{ 'border-accent/50 text-accent': isActivePath(accountPath) }"
              :aria-label="accountLabel"
              :title="accountLabel"
              @click="closeMenu"
            >
              <component :is="accountIcon" class="h-4.5 w-4.5" />
            </RouterLink>

            <RouterLink
              to="/collections"
              class="click-pop ripple inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground transition hover:bg-accent"
              @click="closeMenu"
            >
              <ShoppingBag class="h-4 w-4" />
              Order Now
            </RouterLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { LogIn, Menu, ShoppingBag, UserRound, X } from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import BrandLockup from "@/components/BrandLockup.vue";
import { onAuthState } from "@/lib/firebase";

const props = defineProps({
  floating: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const scrolled = ref(false);
const mobileMenuOpen = ref(false);
const customer = ref(null);

onMounted(() => {
  onAuthState((user) => {
    customer.value = user;
  });
});

const navItems = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: { path: "/", hash: "#ordering" }, label: "Process", path: "/", hash: "#ordering" },
  { to: { path: "/", hash: "#contact" }, label: "Contact", path: "/", hash: "#contact" },
  { to: "/vision", label: "Vision" },
];

const accountPath = computed(() => (customer.value ? "/profile" : "/login"));
const accountLabel = computed(() => (customer.value ? "Open profile" : "Sign in"));
const accountIcon = computed(() => (customer.value ? UserRound : LogIn));

const headerClass = computed(() => {
  if (!props.floating) {
    return "sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md";
  }

  const hasSurface = scrolled.value || mobileMenuOpen.value;

  return [
    "fixed inset-x-0 top-0 z-50 transition-all duration-300",
    hasSurface ? "border-b border-border bg-background/90 shadow-sm backdrop-blur-md" : "",
  ];
});

function toggleMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMenu() {
  mobileMenuOpen.value = false;
}

function updateScroll() {
  scrolled.value = window.scrollY > 20;
}

function handleResize() {
  if (window.innerWidth >= 768) closeMenu();
}

function isActivePath(path) {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
}

function isActiveNav(item) {
  if (item.hash) return route.path === item.path && route.hash === item.hash;
  return isActivePath(item.to);
}

onMounted(() => {
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScroll);
  window.removeEventListener("resize", handleResize);
});

watch(
  () => route.fullPath,
  () => closeMenu(),
);
</script>
