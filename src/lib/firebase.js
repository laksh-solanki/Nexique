import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbSignUp,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
} from "firebase/auth";

const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
);
const isMock = import.meta.env.DEV && !hasFirebaseConfig;
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
};

let app, auth;
const mockAuth = isMock ? createMockAuth() : null;

if (!isMock && hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else if (!isMock) {
  console.error("Firebase authentication is not configured for this build.");
}

export { auth, isMock };

export async function signIn(email, password) {
  if (isMock) {
    return mockAuth.signInWithEmailAndPassword(email, password);
  }
  if (!auth) throw new Error("Firebase authentication is not configured.");
  return fbSignIn(auth, email, password);
}

export async function signUp(email, password, name) {
  if (isMock) {
    const cred = await mockAuth.createUserWithEmailAndPassword(email, password);
    await mockAuth.updateProfile(cred.user, { displayName: name });
    return cred;
  }
  if (!auth) throw new Error("Firebase authentication is not configured.");
  const cred = await fbSignUp(auth, email, password);
  await fbUpdateProfile(cred.user, { displayName: name });
  return cred;
}

export async function logOut() {
  if (isMock) {
    return mockAuth.signOut();
  }
  if (!auth) return;
  return fbSignOut(auth);
}

export function onAuthState(cb) {
  if (isMock) {
    return mockAuth.onAuthStateChanged(cb);
  }
  if (!auth) {
    setTimeout(() => cb(null), 0);
    return () => {};
  }
  return auth.onAuthStateChanged(cb);
}

export async function getFirebaseToken() {
  if (isMock) {
    const user = mockAuth.currentUser;
    return user ? `mock-token-${user.email}` : "";
  }
  if (!auth) return "";
  const user = auth.currentUser;
  return user ? user.getIdToken() : "";
}

export function getCurrentFirebaseUser() {
  return isMock ? mockAuth.currentUser : auth?.currentUser || null;
}

export async function updateFirebaseProfile(displayName) {
  if (isMock) {
    await mockAuth.updateProfile(mockAuth.currentUser, { displayName });
    return;
  }
  if (auth.currentUser) {
    await fbUpdateProfile(auth.currentUser, { displayName });
  }
}

function createMockAuth() {
  const listeners = [];
  let currentUser = null;

  const cached = localStorage.getItem("nexique_mock_user");
  if (cached) {
    try {
      currentUser = JSON.parse(cached);
    } catch (err) {
      console.warn("Failed to parse cached mock user:", err);
    }
  }

  const notify = () => {
    listeners.forEach((cb) => cb(currentUser));
  };

  return {
    get currentUser() {
      return currentUser;
    },
    onAuthStateChanged: (cb) => {
      listeners.push(cb);
      setTimeout(() => cb(currentUser), 0);
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },
    signInWithEmailAndPassword: async (email, password) => {
      if (!email || !password) throw new Error("Email and password required.");
      currentUser = {
        uid: "mock-uid-" + email.replace(/[^a-z0-9]/g, ""),
        email,
        displayName: email.split("@")[0].toUpperCase(),
        emailVerified: true,
      };
      localStorage.setItem("nexique_mock_user", JSON.stringify(currentUser));
      notify();
      return { user: currentUser };
    },
    createUserWithEmailAndPassword: async (email, password) => {
      if (!email || !password) throw new Error("Email and password required.");
      currentUser = {
        uid: "mock-uid-" + email.replace(/[^a-z0-9]/g, ""),
        email,
        displayName: email.split("@")[0].toUpperCase(),
        emailVerified: true,
      };
      localStorage.setItem("nexique_mock_user", JSON.stringify(currentUser));
      notify();
      return { user: currentUser };
    },
    signOut: async () => {
      currentUser = null;
      localStorage.removeItem("nexique_mock_user");
      notify();
    },
    updateProfile: async (user, { displayName }) => {
      if (currentUser) {
        currentUser.displayName = displayName;
        localStorage.setItem("nexique_mock_user", JSON.stringify(currentUser));
        notify();
      }
    },
  };
}
