import React from "react";
import { useNavigate } from "react-router-dom";
import { adminSignOut } from "./adminAuth";
import { toast } from "../lib/toast";

export default function AdminLogout() {
  const nav = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        await adminSignOut();
        toast("Signed out.", "success", "Admin", 2200);
      } catch (e: any) {
        toast(String(e?.message || e || "Sign out failed."), "warning", "Admin", 2600);
      } finally {
        nav("/admin/login", { replace: true });
      }
    })();
  }, [nav]);

  return (
    <div className="panel card card-center" style={{ maxWidth: 720, margin: "0 auto", padding: 18 }}>
      <div style={{ fontWeight: 950 }}>Signing out…</div>
    </div>
  );
}
