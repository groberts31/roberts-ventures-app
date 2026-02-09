// src/admin/adminAuth.ts

const KEY = "rv_admin_session_v1";

// --- Lockout (brute-force protection) ---
const LOCK_KEY = "rv_admin_lock_v1";
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

type LockState = {
  fails: number;
  lockedUntil: number; // epoch ms; 0 means not locked
};

function now(): number {
  return Date.now();
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ============================
// Session auth (existing)
// ============================

export function isAdminAuthed(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // session expires after 12 hours
    return Boolean(data?.ok) && typeof data?.exp === "number" && now() < data.exp;
  } catch {
    return false;
  }
}

export function setAdminAuthed(): void {
  const exp = now() + 12 * 60 * 60 * 1000;
  localStorage.setItem(KEY, JSON.stringify({ ok: true, exp }));

  // successful login should reset lock state
  resetAdminLock();
}

export function clearAdminAuthed(): void {
  localStorage.removeItem(KEY);
}

// ============================
// Lockout helpers (NEW)
// ============================

export function getAdminLock(): LockState {
  const state = safeParse<LockState>(localStorage.getItem(LOCK_KEY));
  if (!state) return { fails: 0, lockedUntil: 0 };

  // If lock expired, normalize back to unlocked
  if (state.lockedUntil && now() >= state.lockedUntil) {
    const cleared = { fails: 0, lockedUntil: 0 };
    localStorage.setItem(LOCK_KEY, JSON.stringify(cleared));
    return cleared;
  }

  // Ensure fields exist
  return {
    fails: typeof state.fails === "number" ? state.fails : 0,
    lockedUntil: typeof state.lockedUntil === "number" ? state.lockedUntil : 0,
  };
}

export function isAdminLocked(): boolean {
  const s = getAdminLock();
  return Boolean(s.lockedUntil && now() < s.lockedUntil);
}

export function getAdminLockRemainingMs(): number {
  const s = getAdminLock();
  if (!s.lockedUntil) return 0;
  return Math.max(0, s.lockedUntil - now());
}

export function recordAdminFail(): LockState {
  const s = getAdminLock();
  const nextFails = (s.fails || 0) + 1;

  // If you hit max fails, lock for LOCK_MINUTES
  const lockedUntil =
    nextFails >= MAX_FAILS ? now() + LOCK_MINUTES * 60 * 1000 : 0;

  const next: LockState = { fails: nextFails, lockedUntil };
  localStorage.setItem(LOCK_KEY, JSON.stringify(next));
  return next;
}

export function resetAdminLock(): void {
  localStorage.setItem(LOCK_KEY, JSON.stringify({ fails: 0, lockedUntil: 0 }));
}
