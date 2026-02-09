import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "../data/firebase";

/**
 * Admin Auth (Firebase)
 * --------------------
 * This replaces the old PIN/localStorage auth.
 * Any Firebase user who can sign in is treated as "admin" for now.
 *
 * Later (optional hardening):
 * - restrict by email allowlist
 * - restrict by custom claims (recommended)
 */

export function onAdminAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export function getAdminUser(): User | null {
  return auth.currentUser;
}

export function isAdminAuthed(): boolean {
  return Boolean(auth.currentUser);
}

export async function adminSignIn(email: string, password: string) {
  const e = String(email || "").trim();
  const p = String(password || "");
  return signInWithEmailAndPassword(auth, e, p);
}

export async function adminSignOut() {
  return signOut(auth);
}

/**
 * Back-compat shims (older code may import these)
 * Keep them so the app compiles even if a page still calls them.
 */
export function isAdminLocked() {
  return false;
}

// Legacy: old PIN/localStorage auth used these.
// With Firebase Auth, "authed" is managed by Firebase. These are safe no-ops.
export function setAdminAuthed(_v: boolean = true) {
  // no-op (Firebase manages auth state)
}

export function clearAdminAuthed() {
  // For legacy callers that expect a sign-out side effect, kick off Firebase sign-out.
  // We intentionally do not await here because some older code expects this to be sync.
  void adminSignOut();
}
