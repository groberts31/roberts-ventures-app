import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAdminAuthed } from "./adminAuth";

/**
 * Admin Login Protection
 * - Uses a simple passcode stored in an env var.
 * - This is NOT true security by itself; it’s route protection / UX protection.
 *
 * Set in: .env (Vite) => VITE_ADMIN_PASSCODE="your-passcode"
 */
export default function AdminLoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc?.state?.from || "/admin";

  const [code, setCode] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  const expected = (import.meta as any).env?.VITE_ADMIN_PASSCODE || "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!expected) {
      setErr("Admin passcode is not set. Add VITE_ADMIN_PASSCODE to your .env file.");
      return;
    }

    if (code.trim() !== String(expected).trim()) {
      setErr("Invalid passcode.");
      return;
    }

    setAdminAuthed();
    nav(from, { replace: true });
  }

  return (
    <div className="page" style={{ maxWidth: 520, margin: "0 auto", padding: "26px 16px" }}>
      <div className="panel card">
        <div className="h2" style={{ marginBottom: 8 }}>Admin Login</div>
        <div className="muted" style={{ marginBottom: 16 }}>
          Enter the admin passcode to continue.
        </div>

        <form onSubmit={submit} className="stack">
          <input
            className="field"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Passcode"
            autoComplete="current-password"
          />

          {err ? <div style={{ color: "crimson", fontWeight: 800 }}>{err}</div> : null}

          <button className="btn btn-primary" type="submit">Unlock Admin</button>
        </form>
      </div>
    </div>
  );
}
