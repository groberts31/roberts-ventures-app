import { Link } from "react-router-dom";

export default function AdminBackToDashboard() {
  return (
    <div className="row" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
      <Link
        to="/admin"
        className="btn btn-ghost"
        style={{ fontWeight: 950 }}
        title="Back to Admin Dashboard"
      >
        ← Admin Dashboard
      </Link>
    </div>
  );
}
