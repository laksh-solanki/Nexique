import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db, isFirebaseConfigured } from "@/lib/firebase";

const ORDERS_KEY = "nexique.orders";
const MODELS_KEY = "nexique.customModels";
const LEGACY_ORDERS_KEY = "cardfest.orders";
const LEGACY_MODELS_KEY = "cardfest.customModels";

function readLocal(key, legacyKey) {
  try {
    const storedValue = localStorage.getItem(key) || localStorage.getItem(legacyKey);
    if (!storedValue) return [];

    const value = JSON.parse(storedValue);
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  } catch {
    return [];
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return value;
}

export async function createOrder(payload) {
  const order = {
    ...payload,
    status: "new",
    created_at: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const orders = readLocal(ORDERS_KEY, LEGACY_ORDERS_KEY);
    orders.unshift({ ...order, id: crypto.randomUUID() });
    writeLocal(ORDERS_KEY, orders);
    return;
  }

  await addDoc(collection(db, "orders"), {
    ...payload,
    status: "new",
    created_at: serverTimestamp(),
  });
}

export async function listOrders() {
  if (!isFirebaseConfigured || !db) return readLocal(ORDERS_KEY, LEGACY_ORDERS_KEY);

  const snapshot = await getDocs(query(collection(db, "orders"), orderBy("created_at", "desc")));
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      ...data,
      created_at: normalizeDate(data.created_at),
    };
  });
}

export async function updateOrderStatus(id, status) {
  if (!isFirebaseConfigured || !db) {
    const orders = readLocal(ORDERS_KEY, LEGACY_ORDERS_KEY).map((order) =>
      order.id === id ? { ...order, status } : order,
    );
    writeLocal(ORDERS_KEY, orders);
    return;
  }

  await updateDoc(doc(db, "orders", id), { status });
}

export async function deleteOrder(id) {
  if (!isFirebaseConfigured || !db) {
    writeLocal(
      ORDERS_KEY,
      readLocal(ORDERS_KEY, LEGACY_ORDERS_KEY).filter((order) => order.id !== id),
    );
    return;
  }

  await deleteDoc(doc(db, "orders", id));
}

export async function createCustomModel(payload) {
  const item = {
    ...payload,
    created_at: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const items = readLocal(MODELS_KEY, LEGACY_MODELS_KEY);
    items.unshift({ ...item, id: crypto.randomUUID() });
    writeLocal(MODELS_KEY, items);
    return;
  }

  await addDoc(collection(db, "custom_card_models"), {
    ...payload,
    created_at: serverTimestamp(),
  });
}

export async function listCustomModels() {
  if (!isFirebaseConfigured || !db) return readLocal(MODELS_KEY, LEGACY_MODELS_KEY);

  const snapshot = await getDocs(
    query(collection(db, "custom_card_models"), orderBy("created_at", "desc")),
  );
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      ...data,
      created_at: normalizeDate(data.created_at),
    };
  });
}

export async function deleteCustomModel(id) {
  if (!isFirebaseConfigured || !db) {
    writeLocal(
      MODELS_KEY,
      readLocal(MODELS_KEY, LEGACY_MODELS_KEY).filter((model) => model.id !== id),
    );
    return;
  }

  await deleteDoc(doc(db, "custom_card_models", id));
}
