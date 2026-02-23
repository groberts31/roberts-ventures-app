import React from "react";
import { Link, Navigate } from "react-router-dom";
import { isAdminAuthed } from "../admin/adminAuth";

/**
 * Legacy wrapper used by some pages.
 * If you still have routes using <AdminRoute>, this will now check Firebase auth.
 */
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;
  return <>      <div style={{ padding: "10px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Link
            to="/admin"
            className="btn btn-ghost"
            style={{ fontWeight: 950, width: "fit-content" }}
          >
            ← Admin Dashboard
          </Link>
        </div>
      </div>

{children}</>;
}
