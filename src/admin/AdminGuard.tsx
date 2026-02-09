import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAdminAuthChanged, isAdminUser } from "./adminAuth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [denied, setDenied] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onAdminAuthChanged((u) => {
      const allowed = isAdminUser(u);
      setAuthed(allowed);
      setDenied(u && !allowed ? "This account is signed in, but it is not allowed to access Admin on this app." : null);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <div className="panel card card-center" style={{ maxWidth: 720, margin: "0 auto", padding: 18 }}>
        <div style={{ fontWeight: 950 }}>Checking admin session…</div>
        <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
          Firebase Auth is initializing.
        </div>
      </div>
    );
  }

  if (authed) return <>{children}</>;

  // If someone IS signed in but not allowlisted, show a clearer message before redirecting.
  if (denied) {
    return (
      <div className="panel card card-center" style={{ maxWidth: 760, margin: "0 auto", padding: 18 }}>
        <div className="h2" style={{ margin: 0 }}>Admin Access Denied</div>
        <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
          {denied}
        </div>
        <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
          Fix: add this user email to <code>VITE_ADMIN_EMAIL_ALLOWLIST</code> (comma-separated) or remove the allowlist to allow any signed-in Firebase user.
        </div>
        <div style={{ marginTop: 12 }}>
          <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />
        </div>
      </div>
    );
  }

  return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
}
