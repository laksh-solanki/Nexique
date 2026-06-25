<template>
  <div class="min-h-screen overflow-x-hidden bg-background">
    <SiteHeader floating />

    <section class="relative bg-background px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex items-end justify-between border-b border-foreground/15 pb-5 sm:mb-12">
          <div
            class="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:gap-4 sm:text-[11px] sm:tracking-[0.25em]">
            <span>Vol. I</span>
            <span class="h-1 w-1 rounded-full bg-foreground/30" />
            <span>Issue 01 &middot; 2026</span>
          </div>
          <div
            class="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground md:flex">
            <Sparkles class="h-3 w-3" /> The Nexique Quarterly
          </div>
        </div>

        <div class="grid gap-10 lg:grid-cols-12">
          <article class="animate-fade-up lg:col-span-8">
            <p class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              &mdash; The Cover Story
            </p>
            <h1
              class="font-display text-4xl font-medium leading-[1.05] tracking-tight text-primary sm:text-5xl md:text-7xl lg:text-[5.5rem]">
              The quiet art of a <em class="font-normal italic text-accent">well-made</em> card.
            </h1>
            <p class="mt-6 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg">
              Nexique is a small professional studio designing cards with the rigour of a print
              magazine - sharp type, exact colour, and paper that holds the moment.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <RouterLink to="/collections"
                class="click-pop ripple group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition-all hover:bg-accent">
                Browse the catalogue
                <ArrowRight class="h-4 w-4 transition group-hover:translate-x-1" />
              </RouterLink>
              <RouterLink to="/vision"
                class="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-7 py-3.5 text-sm font-medium text-foreground transition hover:bg-foreground/5">
                Read our vision
                <ArrowUpRight class="h-4 w-4" />
              </RouterLink>
            </div>

            <figure class="relative mt-12">
              <div class="relative h-72 w-full overflow-hidden rounded-sm bg-secondary shadow-card sm:h-[460px]">
                <img v-if="heroAsset?.image_data_url" :src="heroAsset.image_data_url"
                  :alt="heroAsset.alt || 'Nexique editorial selection'" class="h-full w-full object-cover" />
                <div v-else
                  class="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Loader2 v-if="heroLoading" class="h-5 w-5 animate-spin text-accent" />
                  <ImageOff v-else class="h-5 w-5 text-accent" />
                  <span>{{ heroLoading ? "Loading image" : "Image not loaded" }}</span>
                  <span v-if="heroError" class="max-w-sm text-[10px] font-medium normal-case tracking-normal">
                    {{ heroError }}
                  </span>
                </div>
              </div>
              <figcaption
                class="mt-3 flex flex-col gap-1 border-t border-foreground/10 pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span class="uppercase tracking-widest">Plate 01 &mdash; Studio selection, spring edition</span>
                <span class="font-display italic">Photographed in-house</span>
              </figcaption>
            </figure>
          </article>

          <aside class="animate-fade-up space-y-8 lg:col-span-4 lg:border-l lg:border-foreground/10 lg:pl-10"
            style="animation-delay: 0.15s">
            <div>
              <p class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                &mdash; In This Issue
              </p>
              <ul class="divide-y divide-foreground/10">
                <li v-for="(item, index) in featured" :key="item.slug">
                  <RouterLink :to="`/collections/${item.slug}`"
                    class="click-pop group -mx-2 flex items-start gap-4 px-2 py-4 transition hover:bg-foreground/[0.02]">
                    <span class="font-display mt-1 w-8 text-2xl leading-none text-accent/70">
                      {{ String(index + 1).padStart(2, "0") }}
                    </span>
                    <div class="flex-1">
                      <h3 class="font-display text-xl text-primary transition group-hover:text-accent">
                        {{ item.name }}
                      </h3>
                      <p class="mt-0.5 text-sm text-muted-foreground">{{ item.desc }}</p>
                    </div>
                    <ArrowUpRight class="mt-1 h-4 w-4 text-muted-foreground transition group-hover:text-accent" />
                  </RouterLink>
                </li>
              </ul>
            </div>

            <div class="rounded-sm bg-primary p-7 text-primary-foreground">
              <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
                &mdash; Editor's Note
              </p>
              <p class="font-display text-2xl italic leading-snug">
                "Some moments are too precious to forget.
                Some feelings are too deep to speak.
                Hold them close, forever."
              </p>
              <p class="mt-4 text-xs uppercase tracking-widest text-primary-foreground/60">
                &mdash; Dwij Solanki, Founder
              </p>
            </div>
            <div class="rounded-sm bg-primary p-7 text-primary-foreground">
              <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
                &mdash; Editor's Note
              </p>
              <p class="font-display text-2xl italic leading-snug">
                "Every moment deserves to be remembered.
                Every emotion deserves to be expressed.
                Nexique helps you do both beautifully."
              </p>
              <p class="mt-4 text-xs uppercase tracking-widest text-primary-foreground/60">
                &mdash; Laksh Solanki, coFounder
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <div class="overflow-hidden border-y border-foreground/10 bg-background py-4">
      <div class="animate-marquee flex gap-10 whitespace-nowrap font-display text-2xl italic text-primary/70">
        <div v-for="item in 2" :key="item" class="flex items-center gap-10">
          <span v-for="word in marqueeWords" :key="`${item}-${word}`" class="flex items-center gap-10">
            {{ word }} <span class="text-base not-italic text-accent">&#10022;</span>
          </span>
        </div>
      </div>
    </div>

    <section id="collections" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/15 pb-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            &mdash; The Index
          </p>
          <h2 class="font-display mt-3 text-4xl font-medium tracking-tight text-primary md:text-5xl">
            Nine collections, one studio.
          </h2>
        </div>
        <RouterLink to="/collections"
          class="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-accent">
          View all
          <ArrowUpRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <div class="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="(category, index) in allCategories" :key="category.name"
          :to="`/collections/${category.slug}`" class="click-pop group block animate-fade-up"
          :style="{ animationDelay: `${index * 0.05}s` }">
          <div
            class="mb-5 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-sm border border-foreground/5 bg-secondary/60 transition-all duration-500 group-hover:border-accent/30">
            <div class="h-full w-full transition-transform duration-700 group-hover:scale-105">
              <CategoryCardArt :slug="category.slug" />
            </div>
          </div>
          <div class="flex items-start justify-between gap-3 border-t border-foreground/15 pt-4">
            <div>
              <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
                No. {{ String(index + 1).padStart(2, "0") }}
              </p>
              <h3 class="font-display text-2xl text-primary transition group-hover:text-accent">
                {{ category.name }}
              </h3>
              <p class="mt-1 text-sm text-muted-foreground">{{ category.desc }}</p>
            </div>
            <component :is="category.icon"
              class="mt-1.5 h-4 w-4 text-muted-foreground transition group-hover:text-accent" />
          </div>
        </RouterLink>
      </div>
    </section>

    <section id="about" class="bg-primary px-4 py-16 text-primary-foreground sm:px-6 sm:py-24">
      <div class="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-12">
        <div class="md:col-span-7">
          <p class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            &mdash; The Studio
          </p>
          <h2 class="font-display text-3xl font-medium leading-[1.08] tracking-tight sm:text-4xl md:text-6xl">
            A studio that treats every card like an <em class="italic text-accent">edition</em>.
          </h2>
          <p class="mt-6 max-w-xl text-base font-light leading-relaxed text-primary-foreground/75 sm:mt-7 sm:text-lg">
            Nexique works the way a small magazine works - a brief, a draft, a press check, a final.
            The result is a card that earns its place in a drawer, a frame, or a pocket.
          </p>
          <div
            class="mt-8 grid grid-cols-1 gap-5 border-t border-primary-foreground/15 pt-8 min-[420px]:grid-cols-3 sm:mt-10 sm:gap-8">
            <div v-for="stat in stats" :key="stat.label">
              <div class="font-display text-3xl text-accent sm:text-4xl">{{ stat.number }}</div>
              <div class="mt-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/60 sm:tracking-[0.25em]">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
        <div class="relative hidden h-96 md:col-span-5 md:block">
          <div
            class="absolute left-0 top-0 flex h-64 w-48 items-center justify-center rounded-sm border border-border bg-card shadow-card"
            style="transform: rotate(-5deg)">
            <Heart class="h-12 w-12 text-rose-400" fill="currentColor" />
          </div>
          <div
            class="absolute left-36 top-12 flex h-64 w-48 items-center justify-center rounded-sm bg-accent shadow-gold"
            style="transform: rotate(2deg)">
            <Sparkles class="h-12 w-12 text-primary" />
          </div>
          <div
            class="absolute left-72 top-2 flex h-64 w-48 items-center justify-center rounded-sm border border-border bg-background shadow-card"
            style="transform: rotate(-2deg)">
            <Spade class="h-12 w-12 text-primary" />
          </div>
        </div>
      </div>
    </section>

    <section id="ordering" class="bg-background px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/15 pb-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              &mdash; Order Desk
            </p>
            <h2 class="font-display mt-3 text-3xl font-medium tracking-tight text-primary sm:text-4xl md:text-5xl">
              Everything needed before we print.
            </h2>
          </div>
          <p class="max-w-md text-sm leading-relaxed text-muted-foreground">
            Clear details make the proof faster, the quote more accurate, and the final card easier
            to approve.
          </p>
        </div>

        <div class="grid gap-10 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <div class="divide-y divide-foreground/10 border-y border-foreground/10">
              <div v-for="(step, index) in processSteps" :key="step.title"
                class="grid gap-4 py-6 sm:grid-cols-[72px_1fr]">
                <div class="font-display text-3xl text-accent/80">
                  {{ String(index + 1).padStart(2, "0") }}
                </div>
                <div class="flex gap-4">
                  <div
                    class="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <component :is="step.icon" class="h-5 w-5" />
                  </div>
                  <div>
                    <h3 class="font-display text-2xl text-primary">{{ step.title }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {{ step.body }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 lg:col-span-5">
            <div class="rounded-sm border border-border bg-card p-7">
              <h3 class="font-display text-2xl text-primary">Send these details</h3>
              <ul class="mt-5 space-y-3 text-sm text-muted-foreground">
                <li v-for="detail in orderDetails" :key="detail" class="flex gap-3">
                  <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{{ detail }}</span>
                </li>
              </ul>
            </div>
            <div class="rounded-sm border border-border bg-card p-7">
              <h3 class="font-display text-2xl text-primary">We confirm before production</h3>
              <ul class="mt-5 space-y-3 text-sm text-muted-foreground">
                <li v-for="item in studioConfirms" :key="item" class="flex gap-3">
                  <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-secondary px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/15 pb-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              &mdash; Service Standards
            </p>
            <h2 class="font-display mt-3 text-3xl font-medium tracking-tight text-primary sm:text-4xl md:text-5xl">
              Professional handling from brief to handoff.
            </h2>
          </div>
          <p class="max-w-md text-sm leading-relaxed text-muted-foreground">
            Every order is managed with clear proofing, practical deadlines, and production notes so
            customers know what is confirmed before print.
          </p>
        </div>

        <div
          class="grid gap-px overflow-hidden rounded-sm border border-foreground/10 bg-foreground/10 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="item in serviceStandards" :key="item.title" class="bg-card p-7">
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <h3 class="font-display text-2xl text-primary">{{ item.title }}</h3>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ item.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="bg-background px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/15 pb-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              &mdash; Studio Notes
            </p>
            <h2 class="font-display mt-3 text-3xl font-medium tracking-tight text-primary sm:text-4xl md:text-5xl">
              Questions customers usually ask.
            </h2>
          </div>
          <RouterLink to="/collections"
            class="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-accent">
            Choose a collection
            <ArrowUpRight class="h-4 w-4" />
          </RouterLink>
        </div>

        <div class="grid gap-px overflow-hidden rounded-sm border border-foreground/10 bg-foreground/10 md:grid-cols-2">
          <div v-for="faq in faqs" :key="faq.question" class="bg-card p-7">
            <h3 class="font-display text-2xl text-primary">{{ faq.question }}</h3>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 flex flex-wrap items-end justify-between gap-3 border-b border-foreground/15 pb-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              &mdash; Correspondence
            </p>
            <h2 class="font-display mt-3 text-3xl font-medium tracking-tight text-primary sm:text-4xl md:text-5xl">
              The studio is open.
            </h2>
          </div>
          <p class="max-w-sm text-sm text-muted-foreground">
            Custom orders, bulk requests, or just curious - reach the studio directly.
          </p>
        </div>

        <div class="grid overflow-hidden rounded-sm border border-foreground/10 bg-foreground/10 md:grid-cols-3">
          <div class="bg-card p-8">
            <div class="mb-5 flex items-center gap-3">
              <Phone class="h-4 w-4 text-accent" />
              <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Contact 01
              </p>
            </div>
            <h3 class="font-display text-3xl text-primary">Dwij Solanki</h3>
            <p class="mt-2 text-sm italic text-muted-foreground">Founder &middot; Design lead</p>
          </div>
          <div class="bg-card p-8">
            <div class="mb-5 flex items-center gap-3">
              <Phone class="h-4 w-4 text-accent" />
              <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Contact 02
              </p>
            </div>
            <h3 class="font-display text-3xl text-primary">Laksh Solanki</h3>
            <p class="mt-2 text-sm italic text-muted-foreground">Co-founder &middot; Production</p>
          </div>
          <a href="mailto:nexique@gmail.com"
            class="group block bg-primary p-8 text-primary-foreground transition hover:bg-accent">
            <div class="mb-5 flex items-center gap-3">
              <Mail class="h-4 w-4 text-accent transition group-hover:text-primary" />
              <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/60">
                Email the studio
              </p>
            </div>
            <h3 class="font-display text-2xl">nexique@gmail.com</h3>
            <p class="mt-2 inline-flex items-center gap-1 text-sm text-primary-foreground/70">
              Send a message
              <ArrowUpRight class="h-3 w-3" />
            </p>
          </a>
        </div>

        <div class="mt-6 flex items-start gap-3 text-sm text-muted-foreground sm:items-center">
          <ShieldCheck class="h-4 w-4 text-accent" />
          <p>Replies within 24 hours &middot; Custom quotes always free</p>
        </div>
      </div>
    </section>

    <footer class="border-t border-foreground/15 bg-background px-4 py-10 sm:px-6">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <RouterLink to="/" class="inline-flex min-w-0 items-center">
          <BrandLockup compact />
        </RouterLink>
        <div
          class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground">
          <RouterLink to="/vision" class="transition hover:text-accent">Vision</RouterLink>
          <RouterLink to="/collections" class="transition hover:text-accent">Collections</RouterLink>
          <span class="hidden items-center gap-1.5 md:inline-flex">
            <MapPin class="h-3 w-3" /> By appointment
          </span>
        </div>
        <p class="text-xs text-muted-foreground">&copy; {{ currentYear }} Nexique Studio</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  FileCheck2,
  Gift,
  Heart,
  HeartHandshake,
  ImageOff,
  Layers,
  LayoutTemplate,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Spade,
  Sparkles,
  Wand2,
} from "@lucide/vue";

import CategoryCardArt from "@/components/CategoryCardArt.vue";
import BrandLockup from "@/components/BrandLockup.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import { siteAssetKey } from "@/lib/catalogAssetKeys";
import { useCatalogAsset } from "@/lib/catalogAssets";

const currentYear = new Date().getFullYear();
const {
  asset: heroAsset,
  loading: heroLoading,
  error: heroError,
} = useCatalogAsset(siteAssetKey("hero"));

const featured = [
  { slug: "wedding-cards", name: "Wedding", desc: "Gilded invitations." },
  { slug: "business-cards", name: "Business", desc: "First impressions." },
  { slug: "greeting-cards", name: "Greeting", desc: "Heartfelt notes." },
  { slug: "valentine-special", name: "Valentine", desc: "Named editions." },
];

const allCategories = [
  { slug: "greeting-cards", icon: Heart, name: "Greeting Cards", desc: "Heartfelt notes." },
  { slug: "wedding-cards", icon: Sparkles, name: "Wedding Cards", desc: "Gilded invitations." },
  { slug: "business-cards", icon: Briefcase, name: "Business Cards", desc: "Lasting impressions." },
  { slug: "templates", icon: LayoutTemplate, name: "Templates", desc: "Designed to customise." },
  { slug: "collection-cards", icon: Layers, name: "Collection Cards", desc: "Curated series." },
  { slug: "playing-cards", icon: Spade, name: "Playing Cards", desc: "Modern classics." },
  { slug: "gift-cards", icon: Gift, name: "Gift Cards", desc: "Any-occasion." },
  {
    slug: "valentine-special",
    icon: HeartHandshake,
    name: "Valentine Special",
    desc: "Named editions.",
  },
  { slug: "custom-wish-cards", icon: Wand2, name: "As Your Wish", desc: "Fully bespoke." },
];

const marqueeWords = [
  "Greeting",
  "Wedding",
  "Business",
  "Playing",
  "Collection",
  "Templates",
  "Valentine",
  "As Your Wish",
  "Gift",
];

const stats = [
  { number: "09", label: "Collections" },
  { number: "100%", label: "Studio quality" },
  { number: "24h", label: "Reply window" },
];

const processSteps = [
  {
    icon: ClipboardList,
    title: "Choose the collection",
    body: "Start with the card line that matches the occasion, then select a model and design variant.",
  },
  {
    icon: MessageCircle,
    title: "Share the brief",
    body: "Send names, event details, quantity, preferred size, deadline, and any wording you want printed.",
  },
  {
    icon: FileCheck2,
    title: "Approve the proof",
    body: "The studio confirms layout, spelling, colour direction, paper stock, and final quote before printing.",
  },
  {
    icon: PackageCheck,
    title: "Print and handoff",
    body: "Once approved, the order moves to production with pickup, local handoff, or delivery details confirmed.",
  },
];

const orderDetails = [
  "Occasion or card purpose, such as wedding, birthday, business, gift, or custom wish.",
  "Quantity, preferred card size, paper finish, and whether envelopes or extras are needed.",
  "Exact names, dates, message text, spelling, phone number, and delivery city.",
  "Deadline and any reference colours, photos, logos, or design examples.",
];

const studioConfirms = [
  "Design variant, wording, print-ready proof, and correction window.",
  "Paper stock, finish, quantity, timeline, and final quote before production.",
  "Pickup or delivery handoff details after the approved proof is ready.",
];

const serviceStandards = [
  {
    icon: FileCheck2,
    title: "Proof-first approval",
    body: "Printing starts only after names, wording, layout, finish, quantity, and quote are approved.",
  },
  {
    icon: Briefcase,
    title: "Bulk-ready quotes",
    body: "Business cards, invites, gift cards, and event cards are priced with quantity and finish clarity.",
  },
  {
    icon: Layers,
    title: "Finish control",
    body: "Paper stock, envelopes, colour direction, and extras are tracked before production begins.",
  },
  {
    icon: ShieldCheck,
    title: "Handoff clarity",
    body: "Pickup, local handoff, or delivery details stay visible until the final order is complete.",
  },
];

const faqs = [
  {
    question: "Can I customise the wording?",
    answer:
      "Yes. Names, dates, short messages, colour direction, and simple layout changes can be adjusted before the final proof is approved.",
  },
  {
    question: "Do you handle bulk orders?",
    answer:
      "Yes. Business cards, invitations, gift cards, and event cards can be quoted in batches based on quantity, paper, finish, and timeline.",
  },
  {
    question: "Will I see the design before print?",
    answer:
      "Yes. Production starts only after the studio confirms the selected design, wording, proof, quote, and deadline with you.",
  },
  {
    question: "How is pricing decided?",
    answer:
      "Pricing depends on card type, quantity, size, paper stock, finish, envelopes, and delivery needs. Custom quotes are free.",
  },
];
</script>
