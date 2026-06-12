import {
  Briefcase,
  Gift,
  Heart,
  HeartHandshake,
  Layers,
  LayoutTemplate,
  Spade,
  Sparkles,
  Wand2,
} from "@lucide/vue";

import { weddingVariantAssetKey } from "@/lib/catalogAssetKeys";

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const model = (name, tag, tint) => ({
  name,
  tag,
  tint,
  slug: slugify(name),
});

const weddingPreviewPriority = ["Classic", "Modern", "Minimal", "Vintage", "Luxe Gold", "Bold"];

export const collections = {
  "greeting-cards": {
    slug: "greeting-cards",
    name: "Greeting Cards",
    tagline: "Heartfelt notes for every moment of the year.",
    icon: Heart,
    accent: "from-rose-200 to-rose-50",
    models: [
      model("Birthday Bloom", "Birthday", "from-rose-300 to-pink-100"),
      model("Thank You Petals", "Thank You", "from-amber-200 to-rose-100"),
      model("Get Well Soon", "Sympathy", "from-sky-200 to-emerald-100"),
      model("Happy Anniversary", "Love", "from-rose-400 to-rose-200"),
      model("Congrats Confetti", "Congrats", "from-yellow-200 to-pink-200"),
      model("Miss You", "Friendship", "from-purple-200 to-rose-100"),
    ],
  },
  "wedding-cards": {
    slug: "wedding-cards",
    name: "Wedding Cards",
    tagline: "Elegant invitations with premium gold detail.",
    icon: Sparkles,
    accent: "from-amber-100 to-rose-50",
    models: [
      model("Gilded Romance", "Gold Foil", "from-amber-200 to-amber-50"),
      model("Botanical Vows", "Floral", "from-emerald-200 to-rose-50"),
      model("Royal Burgundy", "Classic", "from-rose-400 to-amber-100"),
      model("Minimal Ivory", "Modern", "from-stone-100 to-amber-50"),
      model("Boho Sunset", "Boho", "from-orange-200 to-rose-200"),
      model("Royal Indian Motif", "Traditional", "from-red-300 to-amber-200"),
    ],
  },
  "business-cards": {
    slug: "business-cards",
    name: "Business Cards",
    tagline: "Make a lasting first impression in 90 x 55mm.",
    icon: Briefcase,
    accent: "from-stone-200 to-stone-50",
    models: [
      model("Matte Noir", "Minimal", "from-stone-700 to-stone-500"),
      model("Embossed Classic", "Premium", "from-stone-200 to-stone-100"),
      model("Gold Edge", "Luxury", "from-amber-200 to-stone-100"),
      model("Color Block", "Modern", "from-sky-200 to-rose-200"),
      model("Kraft Natural", "Eco", "from-amber-300 to-amber-100"),
      model("Holographic Foil", "Bold", "from-purple-200 to-sky-200"),
    ],
  },
  templates: {
    slug: "templates",
    name: "Templates",
    tagline: "Customizable designs, ready to download and print.",
    icon: LayoutTemplate,
    accent: "from-sky-100 to-stone-50",
    models: [
      model("Editable PSD Bundle", "Photoshop", "from-sky-200 to-sky-50"),
      model("Canva Wedding Pack", "Canva", "from-rose-200 to-sky-100"),
      model("Figma Brand Kit", "Figma", "from-purple-200 to-pink-100"),
      model("Print-Ready PDFs", "PDF", "from-emerald-200 to-sky-100"),
      model("Social Media Cards", "Digital", "from-amber-200 to-rose-100"),
      model("Resume + Cover Set", "Pro", "from-stone-200 to-stone-50"),
    ],
  },
  "collection-cards": {
    slug: "collection-cards",
    name: "Collection Cards",
    tagline: "Curated series for collectors and gift-givers.",
    icon: Layers,
    accent: "from-emerald-100 to-stone-50",
    models: [
      model("Vintage Travel Series", "Travel", "from-amber-300 to-emerald-100"),
      model("Botanical Atlas", "Nature", "from-emerald-300 to-emerald-100"),
      model("Zodiac Set", "Astrology", "from-purple-300 to-amber-100"),
      model("Cinema Posters", "Pop", "from-rose-300 to-stone-100"),
      model("Mythology Series", "Story", "from-amber-400 to-rose-100"),
      model("World Wonders", "Landmarks", "from-sky-300 to-amber-100"),
    ],
  },
  "playing-cards": {
    slug: "playing-cards",
    name: "Playing Cards",
    tagline: "Classic decks with a modern twist.",
    icon: Spade,
    accent: "from-stone-300 to-stone-100",
    models: [
      model("Royal Burgundy Deck", "Premium", "from-rose-400 to-amber-200"),
      model("Minimal Mono", "Modern", "from-stone-300 to-stone-100"),
      model("Art Deco Deck", "Vintage", "from-amber-300 to-stone-200"),
      model("Tarot Inspired", "Mystic", "from-purple-300 to-amber-100"),
      model("Travel Edition", "Themed", "from-sky-300 to-emerald-200"),
      model("Kids Animal Deck", "Fun", "from-yellow-200 to-rose-200"),
    ],
  },
  "gift-cards": {
    slug: "gift-cards",
    name: "Gift Cards",
    tagline: "The perfect any-occasion present.",
    icon: Gift,
    accent: "from-pink-100 to-amber-50",
    models: [
      model("Rs.500 Studio Credit", "Starter", "from-rose-200 to-amber-100"),
      model("Rs.1,000 Studio Credit", "Popular", "from-amber-300 to-rose-200"),
      model("Rs.2,500 Studio Credit", "Premium", "from-rose-400 to-amber-200"),
      model("Wedding Bundle Voucher", "Bundle", "from-pink-300 to-amber-100"),
      model("Custom Amount", "Flexible", "from-sky-200 to-rose-100"),
      model("Corporate Pack", "Bulk", "from-stone-300 to-amber-100"),
    ],
  },
  "valentine-special": {
    slug: "valentine-special",
    name: "Valentine Special",
    tagline: "Limited-edition named cards for the one you love.",
    icon: HeartHandshake,
    accent: "from-rose-300 to-pink-100",
    models: [
      model("Forever Yours", "Romantic", "from-rose-400 to-pink-200"),
      model("My Valentine", "Classic", "from-rose-300 to-rose-100"),
      model("Two Hearts, One Love", "Couples", "from-pink-300 to-rose-200"),
      model("Sealed with a Kiss", "Playful", "from-rose-400 to-amber-200"),
      model("Be Mine", "Minimal", "from-pink-200 to-rose-100"),
      model("Love Letter Edition", "Vintage", "from-amber-300 to-rose-300"),
    ],
  },
  "custom-wish-cards": {
    slug: "custom-wish-cards",
    name: "As Your Wish Cards",
    tagline: "Fully bespoke cards - designed exactly the way you imagine.",
    icon: Wand2,
    accent: "from-purple-100 to-amber-50",
    models: [
      model("Share Your Idea", "Concept", "from-purple-200 to-rose-100"),
      model("Custom Illustration", "Illustrated", "from-rose-200 to-amber-100"),
      model("Personalised Photo Card", "Photo", "from-sky-200 to-pink-100"),
      model("Bespoke Calligraphy", "Lettering", "from-amber-200 to-stone-100"),
      model("Themed Series (Your Story)", "Series", "from-emerald-200 to-amber-100"),
      model("Surprise Me - Designer Choice", "Mystery", "from-purple-300 to-amber-200"),
    ],
  },
};

export const designVariants = [
  {
    slug: "classic",
    name: "Classic",
    blurb: "Centred typography, balanced margins, timeless feel.",
    layout: "classic",
  },
  {
    slug: "modern",
    name: "Modern",
    blurb: "Asymmetric grid with bold colour-block accents.",
    layout: "modern",
  },
  {
    slug: "minimal",
    name: "Minimal",
    blurb: "Lots of breathing room, fine lines, one focal mark.",
    layout: "minimal",
  },
  {
    slug: "bold",
    name: "Bold",
    blurb: "Oversized display type and high-contrast colour.",
    layout: "bold",
  },
  {
    slug: "vintage",
    name: "Vintage",
    blurb: "Heritage borders, postmark stamps, warm paper.",
    layout: "vintage",
  },
  {
    slug: "luxe",
    name: "Luxe Gold",
    blurb: "Gold foil flourishes on deep burgundy stock.",
    layout: "luxe",
  },
];

export const baseDesignVariantSlugs = designVariants.map((variant) => variant.slug);
const designVariantBySlug = new Map(designVariants.map((variant) => [variant.slug, variant]));
const designVariantAliases = new Map(
  designVariants.flatMap((variant) => [
    [variant.slug, variant.slug],
    [slugify(variant.name), variant.slug],
  ]),
);

function titleCaseSlug(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function variantSlugFromInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const slug = slugify(raw);
  return designVariantAliases.get(slug) || slug;
}

export function normalizeDesignVariantSlugs(value, fallbackSlugs = []) {
  if (value == null) return [...fallbackSlugs];

  const rawValues = Array.isArray(value) ? value : String(value).split(/[\n,]+/);
  const slugs = [
    ...new Set(
      rawValues
        .map((item) => variantSlugFromInput(item))
        .filter(Boolean)
        .map((slug) => slug.slice(0, 40)),
    ),
  ].slice(0, 12);

  return slugs.length ? slugs : [...fallbackSlugs];
}

export function designVariantName(slug) {
  const normalizedSlug = variantSlugFromInput(slug);
  return designVariantBySlug.get(normalizedSlug)?.name || titleCaseSlug(normalizedSlug);
}

function designVariantForSlug(slug, index) {
  const normalizedSlug = variantSlugFromInput(slug);
  const existing = designVariantBySlug.get(normalizedSlug);
  if (existing) return existing;

  const template = designVariants[index % designVariants.length] || designVariants[0];
  return {
    slug: normalizedSlug,
    name: designVariantName(normalizedSlug),
    blurb: "A custom design subcategory configured from the admin catalog.",
    layout: template?.layout || "classic",
  };
}

export function getCollection(slug) {
  return collections[slug];
}

export function getModel(slug, modelSlug) {
  return collections[slug]?.models.find((item) => item.slug === modelSlug);
}

export function getDesignVariants(collectionSlug, modelName, assetMap = {}, variantSlugs = null) {
  const selectedSlugs = normalizeDesignVariantSlugs(variantSlugs);
  const selectedVariants = selectedSlugs.map((slug, index) => designVariantForSlug(slug, index));

  if (collectionSlug !== "wedding-cards" || !modelName) return selectedVariants;

  return selectedVariants.map((variant) => {
    const assetKey = weddingVariantAssetKey(modelName, variant.name);
    const asset = assetMap[assetKey];

    return asset?.image_data_url
      ? {
          ...variant,
          assetKey,
          imageSrc: asset.image_data_url,
          imageAlt: asset.alt || `${modelName} ${variant.name} wedding card design`,
        }
      : {
          ...variant,
          assetKey,
        };
  });
}

export function getWeddingVariantAssetKeys(modelName, variantSlugs = null) {
  if (!modelName) return [];
  return normalizeDesignVariantSlugs(variantSlugs).map((slug) =>
    weddingVariantAssetKey(modelName, designVariantName(slug)),
  );
}

export function getWeddingPreviewAssetKeys(modelName) {
  if (!modelName) return [];
  return weddingPreviewPriority.map((variantName) =>
    weddingVariantAssetKey(modelName, variantName),
  );
}

export function getModelPreviewAsset(collectionSlug, modelName, assetMap = {}) {
  if (collectionSlug !== "wedding-cards" || !modelName) return null;

  const variantName = weddingPreviewPriority.find((name) => {
    const asset = assetMap[weddingVariantAssetKey(modelName, name)];
    return asset?.image_data_url;
  });
  if (!variantName) return null;

  const asset = assetMap[weddingVariantAssetKey(modelName, variantName)];
  return {
    src: asset.image_data_url,
    alt: asset.alt || `${modelName} ${variantName} wedding card design`,
  };
}
