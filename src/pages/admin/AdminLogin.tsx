import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../lib/toast";
import { setAdminAuthed } from "../../components/admin/AdminGuard";

/**
 * Admin Login Protection (Lockout)
 * - 5 failed attempts locks for 15 minutes
 * - Stores lock state in localStorage (per-browser)
 * - Clears lock on successful login
 *
 * PIN source:
 *   .env.local => VITE_ADMIN_PIN="1234"
 * Fallback if not set:
 *   "1234"
 */

const LOCK_KEY = "rv_admin_pin_lock_v1";

type LockState = {
  fails: number;
  lockUntil: number; // epoch ms, 0 if not locked
  lastFailAt: number; // epoch ms
};

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

function readLock(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { fails: 0, lockUntil: 0, lastFailAt: 0 };
    const data = JSON.parse(raw);
    const fails = Number(data?.fails ?? 0);
    const lockUntil = Number(data?.lockUntil ?? 0);
    const lastFailAt = Number(data?.lastFailAt ?? 0);
    return {
      fails: Number.isFinite(fails) ? fails : 0,
      lockUntil: Number.isFinite(lockUntil) ? lockUntil : 0,
      lastFailAt: Number.isFinite(lastFailAt) ? lastFailAt : 0,
    };
  } catch {
    return { fails: 0, lockUntil: 0, lastFailAt: 0 };
  }
}

function writeLock(next: LockState) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(next));
}

function clearLock() {
  localStorage.removeItem(LOCK_KEY);
}

function msToClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AdminLogin() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string>("");

  // Used to update remaining lock time while the page is open
  const [now, setNow] = useState(() => Date.now());

  // PIN from env (Vite)
  const correct = (import.meta as any).env?.VITE_ADMIN_PIN ?? "1234";

  const lock = useMemo(() => readLock(), [now]);

  const locked = lock.lockUntil > now;
  const remainingMs = locked ? lock.lockUntil - now : 0;

  // Auto-refresh the timer every 1s when locked (and also clears expired lock)
  useEffect(() => {
    if (!locked) {
      // If lock exists but expired, clear it once
      const st = readLock();
      if (st.lockUntil && st.lockUntil <= Date.now()) clearLock();
      return;
    }

    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [locked]);

  function recordFail() {
    const current = readLock();
    const nextFails = (current.fails ?? 0) + 1;

    // If this was the final allowed attempt, lock the user
    if (nextFails >= MAX_FAILS) {
      const lockUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
      writeLock({ fails: 0, lockUntil, lastFailAt: Date.now() });
      return { locked: true, remainingFails: 0, lockUntil };
    }

    writeLock({ fails: nextFails, lockUntil: 0, lastFailAt: Date.now() });
    return { locked: false, remainingFails: MAX_FAILS - nextFails, lockUntil: 0 };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    // If locked, block the attempt immediately
    if (locked) {
      const msg = `Too many attempts. Try again in ${msToClock(remainingMs)}.`;
      setErr(msg);
      toast(msg, "error", "Locked", 2600);
      return;
    }

    if (!pin.trim()) {
      setErr("Enter your admin PIN.");
      return;
    }

    if (pin.trim() !== String(correct)) {
      const res = recordFail();

      if (res.locked) {
        const msg = `Too many attempts. Locked for ${LOCK_MINUTES} minutes.`;
        setErr(msg);
        toast(msg, "error", "Locked", 3000);
        // Force re-render so the lock UI shows immediately
        setNow(Date.now());
        return;
      }

      const msg = `Incorrect PIN. ${res.remainingFails} attempt(s) left.`;
      setErr(msg);
      toast("Incorrect admin PIN.", "error", "Access Denied", 2600);
      return;
    }

    // Success: clear lock + auth + go to dashboard
    clearLock();
    setAdminAuthed(true);
    toast("Welcome back.", "success", "Admin Access", 2200, "Go to Dashboard", "/admin");
    nav("/admin");
  }

  return (
    <div className="stack page">
      <section className="panel card card-center" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 className="h2">Admin Login</h1>
        <p className="lead" style={{ maxWidth: 560 }}>
          Enter your admin PIN to access customer requests and manage statuses.
        </p>

        {locked ? (
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(245,158,11,0.28)",
              background: "rgba(245,158,11,0.10)",
              color: "#7c2d12",
              fontWeight: 950,
              textAlign: "center",
            }}
          >
            Too many attempts. Try again in <span style={{ fontVariantNumeric: "tabular-nums" }}>{msToClock(remainingMs)}</span>.
          </div>
        ) : null}

        <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="label">Admin PIN</span>
            <input
              className="field"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              inputMode="numeric"
              autoFocus
              disabled={locked}
            />
          </label>

          {err ? (
            <div
              className="panel"
              style={{
                padding: 10,
                borderRadius: 12,
                border: "1px solid rgba(220,38,38,0.25)",
                background: "rgba(220,38,38,0.08)",
                color: "#7f1d1d",
                fontWeight: 900,
              }}
            >
              {err}
            </div>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={locked}>
            Unlock Admin
          </button>

          <button className="btn btn-ghost" type="button" onClick={() => nav("/")}>
            Back to Home
          </button>

          <div className="muted" style={{ fontWeight: 900, marginTop: 8 }}>
            PIN is stored in <code>.env.local</code> as <code>VITE_ADMIN_PIN</code>.
          </div>
        </form>
      </section>
    </div>
  );
}
