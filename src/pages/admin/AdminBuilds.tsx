import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readBuilds as readBuildsLocal, writeBuilds as writeBuildsLocal, type BuildSubmission } from "../../lib/buildsStore";
import { buildsRemoteEnabled, subscribeBuildsRemote, bulkDeleteRemote, bulkStatusRemote } from "../../lib/buildsRemoteStore";
import { toast } from "../../lib/toast";
import { syncBuildsFromRemote } from "../../lib/buildsSync";
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

  // Bulk selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<BuildSubmission["status"] | "">("");
  const [syncBusy, setSyncBusy] = useState(false);

  function refresh() {
    setAll(readBuildsLocal());
  }

  
  async function doSync() {
    if (syncBusy) return;

    // Only meaningful when remote is configured. If not, show a friendly message.
    if (!buildsRemoteEnabled()) {
      toast("Remote sync is not enabled yet (Firebase env values still set to PASTE_ME).", "warning", "Sync", 3200);
      return;
    }

    setSyncBusy(true);
    try {
      const res = await syncBuildsFromRemote();
      if (!res.enabled) {
        toast("Remote sync is not enabled yet.", "warning", "Sync", 2400);
      } else {
        toast(`Sync complete. Pushed ${res.pushed}.`, "success", "Synced", 2400);
      }
    } catch {
      toast("Sync failed (network/Firebase config).", "warning", "Sync Error", 3200);
    } finally {
      setSyncBusy(false);
    }
  }
  useEffect(() => {
    let unsub: null | (() => void) = null;
    let alive = true;

    (async () => {
      // If remote is enabled, do a one-time merge/push first (prevents stale local from overwriting).
      if (buildsRemoteEnabled()) {
        try {
          await syncBuildsFromRemote();
        } catch {
          // ignore: remote might be misconfigured, network down, etc.
        }

        if (!alive) return;
        unsub = subscribeBuildsRemote((items) => setAll(items));
        return;
      }

      // Local-only mode
      refresh();
    })();

    return () => {
      alive = false;
      if (unsub) unsub();
    };
  }, []);

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

  // IDs visible in the current filter (what Select All should target)
  const visibleIds = useMemo(() => filtered.map((b) => String(b.id)), [filtered]);

  const selectedIds = useMemo(() => {
    return visibleIds.filter((id) => Boolean(selected[id]));
  }, [selected, visibleIds]);

  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false;
    return visibleIds.every((id) => Boolean(selected[id]));
  }, [visibleIds, selected]);

  const anySelected = selectedIds.length > 0;

  function toggleOne(id: string, v: boolean) {
    setSelected((prev) => ({ ...prev, [id]: v }));
  }

  function toggleAllVisible(v: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      for (const id of visibleIds) next[id] = v;
      return next;
    });
  }

  function clearSelection() {
    setSelected({});
  }

  async function clearAll() {
    if (!confirm("Delete ALL build submissions stored in this browser? This cannot be undone.")) return;
    if (buildsRemoteEnabled()) {
    await bulkDeleteRemote(all.map((x) => String(x.id)));
    setAll([]);
  } else {
    writeBuildsLocal([]);
    refresh();
  }
  clearSelection();
  toast("All build submissions cleared (local only).", "warning", "Cleared", 2400);
}

  async function applyBulkStatus() {
    if (!anySelected) {
      toast("Select at least one build first.", "warning", "Nothing Selected", 2200);
      return;
    }
    const nextStatus = bulkStatus as BuildSubmission["status"];
    if (!nextStatus) {
      toast("Choose a status to apply.", "warning", "Missing Status", 2200);
      return;
    }

    const nowIso = new Date().toISOString();
    const ids = new Set(selectedIds);

    const updated = all.map((b) => {
      const id = String(b.id);
      if (!ids.has(id)) return b;
      return {
        ...b,
        status: nextStatus as BuildSubmission["status"],
        updatedAt: nowIso,
      };
    });

    if (buildsRemoteEnabled()) {
    await bulkStatusRemote(selectedIds, nextStatus);
  } else {
    writeBuildsLocal(updated);
    setAll(updated);
  }

    toast(`Updated ${selectedIds.length} build(s) to "${nextStatus}".`, "success", "Bulk Update", 2400);

    setBulkStatus("");
    clearSelection();
  }

  async function bulkDeleteSelected() {
    if (!anySelected) {
      toast("Select at least one build first.", "warning", "Nothing Selected", 2200);
      return;
    }

    const count = selectedIds.length;
    const ok = confirm(`Delete ${count} selected build submission(s)? This cannot be undone.`);
    if (!ok) return;

    const ids = new Set(selectedIds);
    const next = all.filter((b) => !ids.has(String(b.id)));

    if (buildsRemoteEnabled()) {
    await bulkDeleteRemote(selectedIds);
  } else {
    writeBuildsLocal(next);
    setAll(next);
  }

    toast(`Deleted ${count} build(s).`, "warning", "Bulk Delete", 2400);

    // Clean UI state after delete
    clearSelection();
    setBulkStatus("");
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
            <button className="btn btn-ghost" onClick={doSync} disabled={syncBusy || !buildsRemoteEnabled()}>{syncBusy ? "Syncing…" : "Sync Now"}</button>
            <button className="btn btn-ghost" onClick={clearAll}>Clear All</button>
            <Link className="btn btn-primary" to="/admin">Back to Admin Dashboard</Link>
          </div>
        </div>

        <div className="row" style={{ width: "100%", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
          <input
            className="field"
            style={{ flex: 1, minWidth: 240 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email, status, type…"
          />
          <span className="badge" style={{ justifyContent: "center" }}>Total: {filtered.length}</span>
        </div>

        {/* BULK ACTION BAR */}
        <div
          className="row"
          style={{
            width: "100%",
            marginTop: 12,
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label className="row" style={{ gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={(e) => toggleAllVisible(e.target.checked)}
            />
            <span style={{ fontWeight: 900 }}>
              Select All (filtered)
            </span>
            <span className="badge">
              Selected: {selectedIds.length}
            </span>
          </label>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <select
              className="field"
              style={{ width: 220 }}
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as BuildSubmission["status"] | "")}
            >
              <option value="">Bulk status…</option>
              <option value="draft">DRAFT</option>
              <option value="submitted">SUBMITTED</option>
              <option value="reviewing">REVIEWING</option>
              <option value="quote_sent">QUOTE SENT</option>
              <option value="approved">APPROVED</option>
              <option value="in_build">IN BUILD</option>
              <option value="complete">COMPLETE</option>
            </select>

            <button className="btn btn-primary" onClick={applyBulkStatus} disabled={!anySelected}>
              Apply
            </button>

            <button className="btn btn-ghost" onClick={clearSelection} disabled={!anySelected}>
              Clear Selection
            </button>

            <button
              className="btn"
              onClick={bulkDeleteSelected}
              disabled={!anySelected}
              style={{
                borderColor: "rgba(220,38,38,0.35)",
                background: "rgba(220,38,38,0.06)",
                color: "#7f1d1d",
                fontWeight: 950,
              }}
            >
              Delete Selected
            </button>
          </div>
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
            .map((b) => {
              const id = String(b.id);
              return (
                <article key={b.id} className="panel card" style={{ padding: 16 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div className="row" style={{ alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <input
                          type="checkbox"
                          checked={Boolean(selected[id])}
                          onChange={(e) => toggleOne(id, e.target.checked)}
                        />

                        <div style={{ fontWeight: 950, color: "#0f172a" }}>
                          Build <span className="badge" style={{ marginLeft: 8, fontSize: 12 }}>{String(b.id).slice(-8).toUpperCase()}</span>
                          <span className="badge" style={{ marginLeft: 8 }}>{String(b.status || "draft").toUpperCase()}</span>
                        </div>
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
              );
            })}
        </section>
      )}
    </div>
  );
}
