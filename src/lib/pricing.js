function normalizePrice(value) {
  if (value == null) return null;
  const raw = String(value).replace(/,/g, "").trim();
  if (!raw) return null;

  const price = Number(raw);
  if (!Number.isFinite(price) || price <= 0) return null;

  return Math.round(price * 100) / 100;
}

export function parsePriceInput(value) {
  return normalizePrice(value);
}

export function formatPrice(value, fallback = "") {
  const price = normalizePrice(value);
  if (price == null) return fallback;

  const hasDecimals = Math.round(price * 100) % 100 !== 0;
  const amount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(price);

  return `Rs. ${amount}`;
}
