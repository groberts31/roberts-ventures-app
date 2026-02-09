import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../lib/toast";
import {
  setAdminAuthed,
  isAdminLocked,
  recordAdminFail,
  getAdminLockRemainingMs,
} from "../../admin/adminAuth";

/**
 * Admin PIN Login (with lockout)
 * PIN source:
 *   .env.local => VITE_ADMIN_PIN="1234"
 */
export default function AdminLogin() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string>("");

  const correct = (import.meta as any).env?.VITE_ADMIN_PIN ?? "1234";

  const [lockMs, setLockMs] = useState<number>(0);

  // Tick lock timer while locked
  useEffect(() => {
    let t: any;
    const tick = () => setLockMs(getAdminLockRemainingMs());
    tick();
    t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const locked = useMemo(() => isAdminLocked(), [lockMs]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    // If locked, block attempts and show remaining time
    if (locked) {
      const s = Math.max(1, Math.ceil(lockMs / 1000));
      const msg = `Locked. Try again in ${s}s.`;
      setErr(msg);
      toast(msg, "error", "Admin Locked", 2600);
      return;
    }

    const entered = pin.trim();
    if (!entered) {
      setErr("Enter your admin PIN.");
      return;
    }

    if (entered !== String(correct).trim()) {
      const res = recordAdminFail(); // updates lock state / remaining fails internally
      const remain = (res as any)?.remainingFails ?? undefined
      const msg = remain !== undefined
        ? `Incorrect PIN. ${remain} attempt(s) left.`
        : "Incorrect PIN.";

      setErr(msg);
      setPin(""); // ✅ clear input after a bad attempt
      toast("Incorrect admin PIN.", "error", "Access Denied", 2600);
      return;
    }

    // ✅ Success
    setAdminAuthed();   // stored session (and resets lock inside adminAuth)
    setPin("");         // ✅ clear input
    setErr("");
    toast("Welcome back.", "success", "Admin Access", 2200, "Go to Dashboard", "/admin");
    nav("/admin", { replace: true });
  }

  const lockLabel =
    locked ? `Locked: ${Math.max(1, Math.ceil(lockMs / 1000))}s remaining` : "";

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
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.12)",
              color: "#7c2d12",
              fontWeight: 900,
              width: "100%",
              maxWidth: 420,
              textAlign: "center",
            }}
          >
            {lockLabel}
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
