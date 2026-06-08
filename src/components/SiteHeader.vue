<template>
  <header :class="headerClass">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:py-5"
    >
      <RouterLink to="/" class="group inline-flex min-w-0 items-center" @click="closeMenu">
        <BrandLockup />
      </RouterLink>

      <div
        class="hidden items-center gap-8 text-[13px] font-medium uppercase tracking-[0.18em] md:flex"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative text-foreground/80 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:content-[''] hover:text-accent hover:after:w-full"
          :class="{ 'text-accent': isActive(item.to) }"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          to="/collections"
          class="click-pop ripple rounded-full bg-primary px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-all hover:bg-accent"
        >
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
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80 transition hover:bg-secondary hover:text-accent"
            :class="{ 'bg-accent/10 text-accent': isActive(item.to) }"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink
            to="/collections"
            class="click-pop ripple mt-1 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground transition hover:bg-accent"
            @click="closeMenu"
          >
            Order Now
          </RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { Menu, X } from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import BrandLockup from "@/components/BrandLockup.vue";

const props = defineProps({
  floating: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const scrolled = ref(false);
const mobileMenuOpen = ref(false);

const navItems = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/vision", label: "Our Vision" },
  { to: "/auth", label: "Login" },
];

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

function isActive(path) {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
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
