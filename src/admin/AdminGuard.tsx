import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAdminAuthChanged } from "./adminAuth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAdminAuthChanged((u) => {
      setAuthed(Boolean(u));
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

  return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
}
