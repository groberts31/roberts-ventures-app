import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminAuthed } from "../admin/adminAuth";

/**
 * Legacy wrapper used by some pages.
 * If you still have routes using <AdminRoute>, this will now check Firebase auth.
 */
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
