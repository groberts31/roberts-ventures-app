import { Navigate } from "react-router-dom";

/**
 * Deprecated legacy passcode admin login page.
 * Admin access is now Firebase Auth (email + password) via /admin/login.
 *
 * This component intentionally just redirects to the real login page,
 * so older links/bookmarks do not break.
 */
export default function AdminLoginPage() {
  return (
    <div className="panel card card-center" style={{ maxWidth: 720, margin: "0 auto", padding: 18 }}>
      <div className="h2" style={{ margin: 0 }}>Admin Login</div>
      <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
        Admin sign-in has moved to Firebase Authentication.
      </div>
      <div style={{ marginTop: 12 }}>
        <Navigate to="/admin/login" replace />
      </div>
    </div>
  );
}
