import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthed } from "./adminAuth";

type Props = { children: React.ReactElement };

export default function AdminGuard({ children }: Props) {
  const loc = useLocation();
  if (isAdminAuthed()) return children;

  // Send them to /admin/login and remember where they were going
  return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
}
