<template>
  <header :class="headerClass">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <RouterLink to="/" class="group inline-flex items-center">
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
    </nav>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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

  return [
    "fixed inset-x-0 top-0 z-50 transition-all duration-300",
    scrolled.value ? "border-b border-border bg-background/90 shadow-sm backdrop-blur-md" : "",
  ];
});

function updateScroll() {
  scrolled.value = window.scrollY > 20;
}

function isActive(path) {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
}

onMounted(() => {
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScroll);
});
</script>
