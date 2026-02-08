import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readBuilds, type BuildSubmission } from "../../lib/buildsStore";
import { toast } from "../../lib/toast";

function safe(s: any) {
  return String(s || "").toLowerCase();
}

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function AdminBuilds() {
  const [all, setAll] = useState<BuildSubmission[]>([]);
  const [q, setQ] = useState("");

  function refresh() {
    setAll(readBuilds());
  }

  useEffect(() => refresh(), []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter((b) => {
      const hay = [
        b.id,
        b.status,
        b.createdAt,
        b.updatedAt,
        b.customer?.name,
        b.customer?.phone,
        b.customer?.email,
        b.project?.type,
        b.project?.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [all, q]);

  function clearAll() {
    if (!confirm("Delete ALL build submissions stored in this browser? This cannot be undone.")) return;
    localStorage.setItem("rv_build_submissions", "[]");
    refresh();
    toast("All build submissions cleared (local only).", "warning", "Cleared", 2400);
  }

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h1 className="h2" style={{ margin: 0 }}>Admin — Build Submissions</h1>
            <div className="muted" style={{ fontWeight: 900 }}>
              Stored locally in this browser (Firebase later). Customers see renders + public estimate only.
            </div>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={refresh}>Refresh</button>
            <button className="btn btn-ghost" onClick={clearAll}>Clear All</button>
            <Link className="btn btn-primary" to="/admin">Back to Admin Dashboard</Link>
          </div>
        </div>

        <div className="row" style={{ width: "100%", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
          <input className="field" style={{ flex: 1, minWidth: 240 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, status, type…" />
          <span className="badge" style={{ justifyContent: "center" }}>Total: {filtered.length}</span>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h3 className="h3">No build submissions found</h3>
          <p className="body" style={{ maxWidth: 780 }}>
            Builds are stored in <code>localStorage</code> on the same device/browser. Once Firebase is connected, these will sync.
          </p>
          <Link className="btn btn-ghost" to="/builds/new">Create a test build</Link>
        </section>
      ) : (
        <section className="stack" style={{ maxWidth: 1100, margin: "0 auto" }}>
          {filtered
            .slice()
            .sort((a, b) => safe(b.createdAt).localeCompare(safe(a.createdAt)))
            .map((b) => (
              <article key={b.id} className="panel card" style={{ padding: 16 }}>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontWeight: 950, color: "#0f172a" }}>
                      Build <span className="badge" style={{ marginLeft: 8, fontSize: 12 }}>{String(b.id).slice(-8).toUpperCase()}</span>
                      <span className="badge" style={{ marginLeft: 8 }}>{String(b.status || "draft").toUpperCase()}</span>
                    </div>

                    <div className="muted" style={{ fontWeight: 850 }}>
                      Created: {fmt(b.createdAt)} • Updated: {fmt(b.updatedAt)}
                    </div>

                    <div className="muted" style={{ fontWeight: 850 }}>
                      Customer: <strong>{b.customer?.name || "—"}</strong> • {b.customer?.phone || "—"} • {b.customer?.email || "—"}
                    </div>

                    <div className="muted" style={{ fontWeight: 850 }}>
                      Type: {b.project?.type || "—"} • Dims: {b.project?.dims?.lengthIn ?? "—"}×{b.project?.dims?.widthIn ?? "—"}×{b.project?.dims?.heightIn ?? "—"} in
                    </div>
                  </div>

                  <Link className="btn btn-primary" to={`/admin/builds/${b.id}`} style={{ fontWeight: 950 }}>
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
        </section>
      )}
    </div>
  );
}
