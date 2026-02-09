import React from "react";
import { Navigate } from "react-router-dom";
import { clearAdminAuthed } from "./adminAuth";

export default function AdminLogout() {
  React.useEffect(() => { clearAdminAuthed(); }, []);
  return <Navigate to="/" replace />;
}
