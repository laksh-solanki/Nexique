<template>
  <div class="min-h-screen bg-background">
    <SiteHeader />

    <section
      class="bg-hero-gradient relative overflow-hidden px-4 py-16 text-primary-foreground sm:px-6 sm:py-24"
    >
      <div class="pointer-events-none absolute inset-0 opacity-25">
        <div
          class="animate-float absolute left-1/4 top-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl"
        />
        <div
          class="animate-float absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
          style="animation-delay: 1.5s"
        />
      </div>
      <div class="animate-fade-up relative mx-auto max-w-4xl text-center">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest"
        >
          <Sparkles class="h-3.5 w-3.5" /> Our Vision
        </div>
        <h1
          class="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl"
        >
          Designed with <span class="text-shimmer italic">purpose</span>.
        </h1>
        <p
          class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg"
        >
          Nexique is a professional card studio dedicated to precision, polish, and the small
          details that turn a card into a keepsake.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="(pillar, index) in pillars"
          :key="pillar.title"
          class="group relative animate-fade-up rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div
            class="bg-gold-gradient absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-5"
          />
          <div class="relative">
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 transition-transform group-hover:scale-110"
            >
              <component :is="pillar.icon" class="h-6 w-6 text-burgundy" />
            </div>
            <h3 class="font-display mb-2 text-2xl font-bold tracking-tight">{{ pillar.title }}</h3>
            <p class="leading-relaxed text-muted-foreground">{{ pillar.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-secondary px-4 py-16 sm:px-6 sm:py-20">
      <div class="animate-fade-up mx-auto max-w-4xl text-center">
        <p class="text-xs font-medium uppercase tracking-widest text-accent">Our Story</p>
        <h2 class="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          A studio built on detail.
        </h2>
        <p class="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Nexique started with a simple idea: cards should feel as considered as the moments they
          mark. From wedding invitations to business introductions, from greeting cards to playing
          decks - we approach every project with a designer's eye and a printer's discipline.
          Premium stock, sharp typography, exact colour, and a process you can rely on.
        </p>
        <div class="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-6 min-[420px]:grid-cols-3">
          <div v-for="stat in stats" :key="stat.label" class="animate-fade-up">
            <component :is="stat.icon" class="mx-auto mb-2 h-5 w-5 text-accent" />
            <div class="font-display text-3xl font-bold text-primary">{{ stat.number }}</div>
            <div class="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 py-16 sm:px-6 sm:py-20">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Ready to design with us?
        </h2>
        <p class="mt-3 text-muted-foreground">
          Browse the collection or get in touch with the studio.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <RouterLink
            to="/collections"
            class="click-pop ripple bg-gold-gradient group flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-burgundy transition-all hover:shadow-gold"
          >
            Browse Collections <ArrowRight class="h-4 w-4 transition group-hover:translate-x-1" />
          </RouterLink>
          <a
            href="mailto:nexique@gmail.com"
            class="rounded-full border border-border px-7 py-3.5 font-medium transition hover:bg-secondary"
          >
            Email the studio
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ArrowRight, Award, Compass, Eye, ShieldCheck, Sparkles, Target, Users } from "@lucide/vue";

import SiteHeader from "@/components/SiteHeader.vue";

const pillars = [
  {
    icon: Eye,
    title: "Vision",
    body: "To become the most trusted name in printed cards - where every design tells a story worth keeping.",
  },
  {
    icon: Target,
    title: "Mission",
    body: "Deliver premium, precision-printed cards for every occasion, with reliable service and uncompromising quality.",
  },
  {
    icon: Compass,
    title: "Values",
    body: "Craft over quantity. Clarity over noise. Customer trust above all.",
  },
];

const stats = [
  { icon: Users, number: "9+", label: "Card Categories" },
  { icon: ShieldCheck, number: "24h", label: "Response Time" },
  { icon: Award, number: "100%", label: "Quality Promise" },
];
</script>
