import { computed, ref, unref, watch } from "vue";

import { listCatalogAssets } from "@/lib/store";

export const catalogAssetCache = ref({});
export const catalogAssetLoading = ref({});
export const catalogAssetErrors = ref({});

const pendingRequests = new Map();
const maxAssetKeysPerRequest = 1;

export function catalogAssetByKey(key) {
  return catalogAssetCache.value[key] || null;
}

export function catalogAssetIsLoading(key) {
  return Boolean(catalogAssetLoading.value[key]);
}

export function catalogAssetError(key) {
  return catalogAssetErrors.value[key] || "";
}

export async function loadCatalogAssets(keys, options = {}) {
  const uniqueKeys = [...new Set((Array.isArray(keys) ? keys : [keys]).filter(Boolean))];
  if (!uniqueKeys.length) return;

  const requestsToWaitFor = [];
  const requestKeys = [];

  for (const key of uniqueKeys) {
    if (!options.force && catalogAssetCache.value[key]) continue;

    if (pendingRequests.has(key)) {
      requestsToWaitFor.push(pendingRequests.get(key));
      continue;
    }

    requestKeys.push(key);
  }

  if (requestKeys.length) {
    setLoading(requestKeys, true);
    setErrors(requestKeys, "");

    for (const batchKeys of chunkKeys(requestKeys, maxAssetKeysPerRequest)) {
      const request = listCatalogAssets({ keys: batchKeys })
        .then((assets) => {
          const updates = {};
          const foundKeys = new Set();

          for (const asset of assets) {
            foundKeys.add(asset.key);
            updates[asset.key] = asset;
          }

          if (Object.keys(updates).length) {
            catalogAssetCache.value = { ...catalogAssetCache.value, ...updates };
          }

          const missingKeys = batchKeys.filter((key) => !foundKeys.has(key));
          if (missingKeys.length) setErrors(missingKeys, "Image was not found in MongoDB.");
        })
        .catch((err) => {
          setErrors(batchKeys, err.message || "Image could not load from MongoDB.");
        })
        .finally(() => {
          setLoading(batchKeys, false);
          batchKeys.forEach((key) => pendingRequests.delete(key));
        });

      batchKeys.forEach((key) => pendingRequests.set(key, request));
      requestsToWaitFor.push(request);
    }
  }

  if (requestsToWaitFor.length) await Promise.all([...new Set(requestsToWaitFor)]);
}

export function useCatalogAsset(keySource) {
  const key = computed(() => unref(keySource));
  const asset = computed(() => catalogAssetByKey(key.value));
  const loading = computed(() => catalogAssetIsLoading(key.value));
  const error = computed(() => catalogAssetError(key.value));

  watch(
    key,
    (assetKey) => {
      if (assetKey) loadCatalogAssets([assetKey]);
    },
    { immediate: true },
  );

  return {
    asset,
    loading,
    error,
    reload: () => loadCatalogAssets([key.value], { force: true }),
  };
}

function chunkKeys(keys, size) {
  const chunks = [];
  for (let index = 0; index < keys.length; index += size) {
    chunks.push(keys.slice(index, index + size));
  }
  return chunks;
}

function setLoading(keys, isLoading) {
  catalogAssetLoading.value = {
    ...catalogAssetLoading.value,
    ...Object.fromEntries(keys.map((key) => [key, isLoading])),
  };
}

function setErrors(keys, message) {
  catalogAssetErrors.value = {
    ...catalogAssetErrors.value,
    ...Object.fromEntries(keys.map((key) => [key, message])),
  };
}
