import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildsRemoteEnabled } from "../../lib/buildsRemoteStore";
import { syncBuildsFromRemote } from "../../lib/buildsSync";
import { getBuild, upsertBuild, removeLastCustomerNote, compileNotes, type BuildSubmission } from "../../lib/buildsStore";
import { estimateBuild } from "../../lib/buildPricing";
import { toast } from "../../lib/toast";
function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function AdminBuildDetail() {
  const { id } = useParams();
  const [build, setBuild] = useState<BuildSubmission | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!id) return;

      // If remote builds are enabled, sync first so this detail page is never stale.
      if (buildsRemoteEnabled()) {
        try {
          await syncBuildsFromRemote();
        } catch {
          // ignore: remote may be down/misconfigured
        }
      }

      if (!alive) return;
      setBuild(getBuild(id));
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const v = useMemo(() => build?.versions?.[0] ?? null, [build]);

  if (!build || !v) {
    return (
      <div className="panel card card-center" style={{ maxWidth: 980, margin: "0 auto" }}>
<h3 className="h3">Build not found</h3>
        <Link className="btn btn-primary" to="/admin/builds">Back</Link>
      </div>
    );
  }

  const b = build;
  const vv = v;

  function setStatus(status: BuildSubmission["status"]) {
    const next: BuildSubmission = { ...b, status, updatedAt: new Date().toISOString() };
    upsertBuild(next);
    setBuild(next);
    toast("Build status updated.", "success", "Saved", 1600);
  }

  function recalcEstimate() {
    const est = estimateBuild(vv.inputsSnapshot.dims, vv.inputsSnapshot.options);

    const nextV = {
      ...vv,
      estimatePublic: {
        total: est.total,
        rangeLow: est.rangeLow,
        rangeHigh: est.rangeHigh,
        materials: est.materials,
        labor: est.labor,
        overhead: est.overhead,
        finish: est.finish,
      },
    };

    const next: BuildSubmission = { ...b, updatedAt: new Date().toISOString(), versions: [nextV, ...b.versions.slice(1)] };
    upsertBuild(next);
    setBuild(next);
    toast("Estimate recalculated.", "success", "Saved", 1600);
  }

  function removeLastCustomerNoteAdmin() {
    if (!confirm("Remove the most recent customer note and regenerate previews?")) return;
    const next = removeLastCustomerNote(b.id);
    if (!next) {
      toast("Could not remove note.", "error", "Error", 1800);
      return;
    }
    setBuild(next);
    toast("Removed last customer note. Previews re-queued.", "success", "Saved", 1800);
  }

  const notesLog = ((vv.inputsSnapshot as any).notesLog || []) as any[];
  const compiledNotes = compileNotes(notesLog, vv.inputsSnapshot.notes);

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h1 className="h2" style={{ margin: 0 }}>Admin — Build Detail</h1>
            <div className="muted" style={{ fontWeight: 850 }}>
              Build: <span className="badge">{String(build.id).slice(-8).toUpperCase()}</span> • Created: {fmt(build.createdAt)} • Updated: {fmt(build.updatedAt)}
            </div>
            <div className="muted" style={{ fontWeight: 850 }}>
              Customer: <strong>{build.customer?.name || "—"}</strong> • {build.customer?.phone || "—"} • {build.customer?.email || "—"}
            </div>
            <div className="muted" style={{ fontWeight: 850 }}>
              Type: {build.project?.type || "—"} • Dims: {build.project?.dims?.lengthIn ?? "—"}×{build.project?.dims?.widthIn ?? "—"}×{build.project?.dims?.heightIn ?? "—"} in
            </div>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-ghost" to="/admin/builds">Back</Link>
            <Link className="btn btn-ghost" to={`/builds/${build.id}`}>Open customer preview</Link>
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 12, justifyContent: "center" }}>
          <span className="badge" style={{ fontWeight: 950 }}>Status: {String(build.status).toUpperCase()}</span>
          <button className="btn btn-ghost" onClick={() => setStatus("reviewing")}>Reviewing</button>
          <button className="btn btn-ghost" onClick={() => setStatus("quote_sent")}>Quote Sent</button>
          <button className="btn btn-ghost" onClick={() => setStatus("approved")}>Approved</button>
          <button className="btn btn-ghost" onClick={() => setStatus("in_build")}>In Build</button>
          <button className="btn btn-ghost" onClick={() => setStatus("complete")}>Complete</button>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Notes (compiled)</div>
          {compiledNotes ? (
            <div className="muted" style={{ fontWeight: 850, whiteSpace: "pre-wrap", marginTop: 8 }}>{compiledNotes}</div>
          ) : (
            <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>No notes</div>
          )}

          <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={removeLastCustomerNoteAdmin} style={{ fontWeight: 950 }}>
              Remove last customer note
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Public estimate (what customer sees)</div>
          {!v.estimatePublic ? (
            <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
              No estimate saved yet. Click “Recalculate Estimate”.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <span className="badge rate-bright">Total: {money(v.estimatePublic.total)}</span>
                <span className="badge">Range: {money(v.estimatePublic.rangeLow || v.estimatePublic.total)} – {money(v.estimatePublic.rangeHigh || v.estimatePublic.total)}</span>
              </div>
              <div className="muted" style={{ fontWeight: 850 }}>
                Materials {money(v.estimatePublic.materials)} • Labor {money(v.estimatePublic.labor)} • Finish {money(v.estimatePublic.finish)} • Overhead {money(v.estimatePublic.overhead)}
              </div>
            </div>
          )}

          <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
            <button className="btn btn-primary" onClick={recalcEstimate}>Recalculate Estimate</button>
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Renders (latest version)</div>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {(v.renders || []).map((r) => (
              <div key={r.renderId} className="panel" style={{ padding: 10, borderRadius: 12 }}>
                <div style={{ fontWeight: 950 }}>{String(r.view).toUpperCase()} <span className="badge" style={{ marginLeft: 8 }}>{String(r.status).toUpperCase()}</span></div>
                <div style={{ marginTop: 8, width: "100%", height: 140, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(15,23,42,0.16)" }}>
                  {r.imageDataUrl ? (
                    <img src={r.imageDataUrl} alt="render" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="card-center" style={{ width: "100%", height: "100%" }}>
                      <div className="muted" style={{ fontWeight: 850 }}>No image yet</div>
                    </div>
                  )}
                </div>
                <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
                  {r.estimatePublic ? `Render est: ${money(r.estimatePublic.total)}` : "Render est: —"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
