import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, isFirebaseConfigured } from "@/lib/firebase";

const LOCAL_USER_KEY = "nexique.localUser";
const LEGACY_LOCAL_USER_KEY = "cardfest.localUser";

function localUser() {
  try {
    const storedUser =
      localStorage.getItem(LOCAL_USER_KEY) || localStorage.getItem(LEGACY_LOCAL_USER_KEY);
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

function setLocalUser(email) {
  const user = {
    uid: `local-${email.toLowerCase()}`,
    email,
    displayName: email.split("@")[0],
    local: true,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser() {
  if (!isFirebaseConfigured || !auth) return Promise.resolve(localUser());

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export function watchAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(localUser());
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInAdmin(email, password) {
  if (!email || password.length < 6) {
    throw new Error("Email and a 6+ character password are required.");
  }

  if (!isFirebaseConfigured || !auth) {
    return setLocalUser(email);
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function createAdmin(email, password) {
  if (!email || password.length < 6) {
    throw new Error("Email and a 6+ character password are required.");
  }

  if (!isFirebaseConfigured || !auth) {
    return setLocalUser(email);
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutAdmin() {
  if (!isFirebaseConfigured || !auth) {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LEGACY_LOCAL_USER_KEY);
    return;
  }

  await signOut(auth);
}
