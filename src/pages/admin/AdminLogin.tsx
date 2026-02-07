import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../lib/toast";
import { setAdminAuthed } from "../../components/admin/AdminGuard";

export default function AdminLogin() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string>("");

  const correct = (import.meta as any).env?.VITE_ADMIN_PIN ?? "1234";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!pin.trim()) {
      setErr("Enter your admin PIN.");
      return;
    }

    if (pin.trim() !== String(correct)) {
      setErr("Incorrect PIN.");
      toast("Incorrect admin PIN.", "error", "Access Denied", 2600);
      return;
    }

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

          <button className="btn btn-primary" type="submit">
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
