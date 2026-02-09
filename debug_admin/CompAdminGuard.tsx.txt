import { Navigate } from "react-router-dom";

const KEY = "rv_admin_authed";

export function isAdminAuthed() {
  return localStorage.getItem(KEY) === "true";
}

export function setAdminAuthed(v: boolean) {
  localStorage.setItem(KEY, v ? "true" : "false");
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
