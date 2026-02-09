import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function isAdmin(): boolean {
  try {
    const role =
      localStorage.getItem("rv_role") ||
      sessionStorage.getItem("rv_role") ||
      localStorage.getItem("role") ||
      sessionStorage.getItem("role");

    const adminFlag =
      localStorage.getItem("rv_admin") ||
      sessionStorage.getItem("rv_admin") ||
      localStorage.getItem("isAdmin") ||
      sessionStorage.getItem("isAdmin");

    if (role && role.toLowerCase() === "admin") return true;
    if (adminFlag && (adminFlag === "1" || adminFlag.toLowerCase() === "true")) return true;

    // Optional escape hatch if you ever set this in dev tools:
    // (window as any).__RV_IS_ADMIN__ = true
    if ((window as any).__RV_IS_ADMIN__ === true) return true;

    return false;
  } catch {
    return false;
  }
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  if (!isAdmin()) {
    return <Navigate to="/" replace state={{ from: loc.pathname, reason: "admin_only" }} />;
  }
  return <>{children}</>;
}
