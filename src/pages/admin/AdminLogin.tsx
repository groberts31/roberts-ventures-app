import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminSignIn } from "../../admin/adminAuth";
import { toast } from "../../lib/toast";

type LocState = { from?: string };

export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation();

  const from = useMemo(() => {
    const s = (loc.state || {}) as LocState;
    return s.from || "/admin";
  }, [loc.state]);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const em = String(email || "").trim();
    const ps = String(pw || "");

    if (!em || !ps) {
      toast("Enter email + password.", "warning", "Admin Login", 2400);
      return;
    }

    setBusy(true);
    try {
      await adminSignIn(em, ps);
      toast("Admin login successful.", "success", "Welcome", 2200);
      nav(from, { replace: true });
    } catch (err: any) {
      const msg = String(err?.message || err || "Login failed.");
      toast(msg, "warning", "Login Failed", 3200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel card card-center" style={{ maxWidth: 720, margin: "0 auto", padding: 18 }}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="h2" style={{ margin: 0 }}>Admin Login</div>

        <div className="muted" style={{ fontWeight: 850 }}>
          This uses Firebase Authentication (email + password). Make sure Email/Password sign-in is enabled in your Firebase console.
        </div>

        <form className="stack" style={{ gap: 10, marginTop: 6 }} onSubmit={submit}>
          <label className="stack" style={{ gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Email</div>
            <input
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="admin@yourdomain.com"
              inputMode="email"
            />
          </label>

          <label className="stack" style={{ gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Password</div>
            <input
              className="field"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              type="password"
            />
          </label>

          <button className="btn btn-primary" disabled={busy} type="submit" style={{ fontWeight: 950, marginTop: 6 }}>
            {busy ? "Signing in…" : "Sign In"}
          </button>

          <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
            After signing in, you’ll be sent to: <code>{from}</code>
          </div>
        </form>
      </div>
    </div>
  );
}
