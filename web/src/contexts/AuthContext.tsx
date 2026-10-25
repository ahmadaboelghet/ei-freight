/**
 * @file src/contexts/AuthContext.tsx
 * @description Global authentication state manager.
 *
 *  Responsibilities:
 *    ① Wraps Firebase Auth's `onAuthStateChanged` observer.
 *    ② Fetches the extended AppUser profile from Firestore after sign-in.
 *    ③ Exposes login, signup, logout, and the live `user` / `loading` state.
 *    ④ Provides a `useAuth()` hook — the ONLY way for components to access auth.
 *
 *  Components NEVER import `auth` directly — they consume this context.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  AuthError,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { AppUser, UserRole } from "../types/domain";

// ─────────────────────────────────────────────────────────────
// CONTEXT SHAPE
// ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Enriched user profile loaded from Firestore (null if unauthenticated). */
  user: AppUser | null;
  /** Raw Firebase Auth user (useful for token refresh etc.). */
  firebaseUser: FirebaseUser | null;
  /** True while the auth observer hasn't resolved yet (prevents flash of login page). */
  loading: boolean;
  /** Non-null when the last auth action raised an error. */
  authError: string | null;

  // ── Actions ──────────────────────────────────────────────
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (demo: Partial<AppUser>) => void;
  signup: (
    email: string,
    password: string,
    displayName: string,
    role?: UserRole,
    extraData?: Partial<AppUser>
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

// ─────────────────────────────────────────────────────────────
// CONTEXT & HOOK
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used inside <AuthProvider>.");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Fetches the AppUser profile from Firestore for a given Firebase UID. */
async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
}

/** Human-readable error messages from Firebase Auth error codes. */
function parseAuthError(error: unknown): string {
  const code = (error as AuthError)?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid credentials. Please try again.",
  };
  return map[code] ?? (error as Error)?.message ?? "An unknown error occurred.";
}

// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── Observer: runs once on mount, cleans up on unmount ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await fetchUserProfile(fbUser.uid);
          setUser(profile);
        } catch {
          // Firestore might not have a profile yet (e.g., mid-signup)
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────

  const loginAsDemo = useCallback((demo: Partial<AppUser>) => {
    setAuthError(null);
    const mock: AppUser = {
      uid: demo.uid || `demo-${Date.now()}`,
      email: demo.email || "demo@eifreight.demo",
      displayName: demo.displayName || "Demo User",
      role: demo.role || "client",
      status: demo.status || "approved",
      clientType: demo.clientType || "personal",
      companyName: demo.companyName || "Demo Company",
      monthlyShipmentLimit: 10,
      monthlyShipmentUsed: 0,
      lang: "en",
    };
    setUser(mock);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      // Sign in — profile will be loaded automatically by onAuthStateChanged observer.
      // We do NOT call fetchUserProfile here to avoid a double Firestore read.
      // Instead, we temporarily fetch the profile only to validate account status.
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(cred.user.uid);
      if (profile?.status === "suspended" || profile?.status === "blocked") {
        await signOut(auth);
        throw new Error(`Your account is ${profile.status}. Contact support.`);
      }
      // onAuthStateChanged will handle setting the user profile in state
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: UserRole = "client",
      extraData: Partial<AppUser> = {}
    ) => {
      setAuthError(null);
      try {
        // 1. Create Firebase Auth account (or sign in if account was already created in previous step)
        let cred;
        try {
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } catch (authErr: any) {
          if (authErr?.code === "auth/email-already-in-use") {
            cred = await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw authErr;
          }
        }

        // 2. Update the Firebase Auth display name
        if (cred.user.displayName !== displayName) {
          await updateProfile(cred.user, { displayName });
        }

        // 3. Create the Firestore user profile document
        const profileData = {
          email,
          displayName,
          role,
          status: extraData.status || "approved", // Default approved for easy testing
          lang: "en",
          monthlyShipmentLimit: 10,
          monthlyShipmentUsed: 0,
          ...extraData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Strip out any undefined values because Firestore rejects undefined
        const cleanProfileData = Object.fromEntries(
          Object.entries(profileData).filter(([_, v]) => v !== undefined)
        );

        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            uid: cred.user.uid,
            ...cleanProfileData,
          },
          { merge: true }
        );

        // Update local context immediately
        setUser({
          uid: cred.user.uid,
          ...profileData,
        } as AppUser);
      } catch (err) {
        const msg = parseAuthError(err);
        setAuthError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  // ── Memoized context value to prevent unnecessary re-renders ──
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      firebaseUser,
      loading,
      authError,
      login,
      loginAsDemo,
      signup,
      logout,
      resetPassword,
      clearError,
    }),
    [user, firebaseUser, loading, authError, login, signup, logout, resetPassword, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
