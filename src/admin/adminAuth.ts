import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "../data/firebase";

/**
 * Admin Auth (Firebase)
 * --------------------
 * Admin access = Firebase-authenticated user AND (optional) email allowlist match.
 *
 * Env (optional hardening):
 * - VITE_ADMIN_EMAIL_ALLOWLIST="a@b.com, c@d.com"
 *   If empty/missing => any signed-in Firebase user is treated as admin.
 */

function envValue(k: string): string {
  const env = (import.meta as any).env ?? {};
  return String(env?.[k] ?? "").trim();
}

function normalizeEmail(x: any): string {
  return String(x ?? "").trim().toLowerCase();
}

function getAllowlist(): string[] {
  const raw = envValue("VITE_ADMIN_EMAIL_ALLOWLIST");
  if (!raw) return [];
  return raw
    .split(/[,\n]/g)
    .map((s) => normalizeEmail(s))
    .filter(Boolean);
}

/** True if user is signed-in AND allowed by allowlist rules. */
export function isAdminUser(user: User | null): boolean {
  if (!user) return false;

  const allow = getAllowlist();
  if (allow.length === 0) return true; // no restriction configured

  const em = normalizeEmail(user.email);
  if (!em) return false;

  return allow.includes(em);
}

export function onAdminAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export function getAdminUser(): User | null {
  return auth.currentUser;
}

/**
 * IMPORTANT:
 * "Authed" means "signed in + allowed".
 * If you are signed in but NOT in allowlist, admin pages are blocked.
 */
export function isAdminAuthed(): boolean {
  return isAdminUser(auth.currentUser);
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
