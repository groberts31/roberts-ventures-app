import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { estimateBuild } from "../lib/buildPricing";
import { renderBuildPreviewPng } from "../lib/render3d";
import {
  addCustomerNote,
  compileNotes,
  getBuild,
  markSubmitted,
  removeLastCustomerNote,
  type BuildSubmission,
  type RenderJob,
  upsertBuild,
} from "../lib/buildsStore";

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function BuildPreview() {
  const { id } = useParams();
  const [build, setBuild] = useState<BuildSubmission | null>(null);

  // Customer refinement fields
  const [changeRequest, setChangeRequest] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    setBuild(getBuild(id));
  }, [id]);

  const version = useMemo(() => build?.versions?.[0] ?? null, [build]);

  // Render queue: ONE image at a time
  useEffect(() => {
    if (!build || !version) return;

    const latest0 = getBuild(build.id) ?? build;
    const lv0 = latest0.versions?.[0];
    if (!lv0) return;

    const renders0 = lv0.renders || [];

    const currentlyRendering = renders0.find((r) => r.status === "rendering") ?? null;
    let target: RenderJob | null = currentlyRendering;

    if (!target) {
      const firstQueued = renders0.find((r) => r.status === "queued") ?? null;

      if (firstQueued) {
        const startedAt = new Date().toISOString();
        const updatedRenders = renders0.map((r) =>
          r.renderId === firstQueued.renderId ? ({ ...r, status: "rendering" as const, startedAt } as RenderJob) : r
        );

        const nextV = { ...lv0, renders: updatedRenders };
        const nextBuild: BuildSubmission = {
          ...latest0,
          updatedAt: new Date().toISOString(),
          versions: [nextV, ...latest0.versions.slice(1)],
        };

        upsertBuild(nextBuild);
        setBuild(nextBuild);

        target = updatedRenders.find((r) => r.renderId === firstQueued.renderId) as RenderJob;
      }
    }

    if (!target) return;

    let cancelled = false;

    const run = async () => {
      try {
        await new Promise((res) => setTimeout(res, 450));
        if (cancelled) return;

        const latest = getBuild(build.id);
        if (!latest) return;

        const lv = latest.versions[0];
        const est = estimateBuild(lv.inputsSnapshot.dims, lv.inputsSnapshot.options);

        const title = `${lv.inputsSnapshot.type} • ${lv.inputsSnapshot.dims.lengthIn}"×${lv.inputsSnapshot.dims.widthIn}"×${lv.inputsSnapshot.dims.heightIn}"`;

        const notesCompiled = compileNotes(lv.inputsSnapshot.notesLog, lv.inputsSnapshot.notes);

        const png = await renderBuildPreviewPng({
          projectType: lv.inputsSnapshot.type,
          view: target!.view,
          title,
          notes: notesCompiled,
          dims: lv.inputsSnapshot.dims,
          options: lv.inputsSnapshot.options,
          width: 1200,
          height: 800,
        });

        if (cancelled) return;

        const updatedRenders = (lv.renders || []).map((x) => {
          if (x.renderId !== target!.renderId) return x;
          return {
            ...x,
            status: "complete" as const,
            finishedAt: new Date().toISOString(),
            imageDataUrl: png,
            estimatePublic: {
              total: est.total,
              rangeLow: est.rangeLow,
              rangeHigh: est.rangeHigh,
              label: "Est. total (updates per view)",
            },
          };
        });

        const nextV = {
          ...lv,
          renders: updatedRenders,
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

        const nextBuild: BuildSubmission = {
          ...latest,
          updatedAt: new Date().toISOString(),
          versions: [nextV, ...latest.versions.slice(1)],
        };

        upsertBuild(nextBuild);
        setBuild(nextBuild);
      } catch (e) {
        console.error(e);
        if (cancelled) return;

        const latest = getBuild(build.id);
        if (!latest) return;

        const lv = latest.versions[0];
        const updatedRenders = (lv.renders || []).map((x) => {
          if (x.renderId !== target!.renderId) return x;
          return { ...x, status: "failed" as const, finishedAt: new Date().toISOString() };
        });

        const nextV = { ...lv, renders: updatedRenders };
        const nextBuild: BuildSubmission = {
          ...latest,
          updatedAt: new Date().toISOString(),
          versions: [nextV, ...latest.versions.slice(1)],
        };

        upsertBuild(nextBuild);
        setBuild(nextBuild);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [build?.id, build?.updatedAt, version?.versionId]);

  if (!build || !version) {
    return (
      <div className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h3 className="h3">Build not found</h3>
        <Link className="btn btn-primary" to="/builds/new">
          Start a Build
        </Link>
      </div>
    );
  }

  const v = version;
  const b = build;
  const est = v.estimatePublic;

  const notesLog = v.inputsSnapshot.notesLog || [];
  const compiledNotes = compileNotes(notesLog, v.inputsSnapshot.notes);

  const canRemoveCustomerNote = Array.isArray(notesLog)
    ? notesLog.some(n => String(n?.author||"").toLowerCase()==="customer")
    : false;


  function submit() {
    const next = markSubmitted(b.id);
    if (!next) return alert("Could not submit. Try again.");
    setBuild(next);
    alert(`Submitted! Your Build Access Code: ${String(next.accessCode || "—")}`);
  }

  function submitRefinement() {
    const req = changeRequest.trim();
    const add = extraNotes.trim();

    if (!req && !add) {
      alert("Please add a change request and/or extra notes.");
      return;
    }

  function removeLastNote(){
    if(!canRemoveCustomerNote) return;

    const next = removeLastCustomerNote(b.id);

    if(!next){
      alert("Could not remove note. Try refresh.");
      return;
    }

    setBuild(next);
    alert("Last note removed. Re-rendering now.");
  }


    const next = addCustomerNote(b.id, req, add);
    if (!next) {
      alert("Could not save changes. Please refresh and try again.");
      return;
    }

    setChangeRequest("");
    setExtraNotes("");
    setBuild(next);
    alert("Saved! We’re generating updated previews now.");
  }

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h1 className="h2" style={{ margin: 0, fontWeight: 950 }}>
            Build Preview
          </h1>
          <div className="muted" style={{ fontWeight: 850 }}>
            Created: {fmt(build.createdAt)} • Status: <span className="badge">{build.status.toUpperCase()}</span>
          </div>
          <div className="muted" style={{ fontWeight: 850 }}>
            Customer: <strong>{build.customer?.name}</strong> • {build.customer?.phone} • {build.customer?.email}
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>
            {v.inputsSnapshot.type} — {v.inputsSnapshot.dims.lengthIn}" × {v.inputsSnapshot.dims.widthIn}" × {v.inputsSnapshot.dims.heightIn}"
          </div>
          <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
            Wood: {v.inputsSnapshot.options.woodSpecies} • Finish: {v.inputsSnapshot.options.finish} • Joinery:{" "}
            {v.inputsSnapshot.options.joinery}
          </div>

          {compiledNotes ? (
            <div className="panel" style={{ padding: 12, borderRadius: 12, marginTop: 10 }}>
              <div className="label">Notes on file (used to improve the model)</div>
              <div className="muted" style={{ fontWeight: 850, whiteSpace: "pre-wrap", marginTop: 6 }}>
                {compiledNotes}
              </div>
            </div>
          ) : null}

          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Link className="btn btn-ghost" to="/builds/new">
              Start Another
            </Link>
            <Link className="btn btn-ghost" to="/builds/portal">
              Build Portal
            </Link>
            <button className="btn btn-primary" onClick={submit} style={{ fontWeight: 950 }}>
              Submit for Review
            </button>
          </div>

          <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
            After submitting you’ll get a 6-digit Access Code to view your build in the Build Portal.
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Refine this build (add details)</div>
          <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
            Add specific details and we’ll regenerate previews. Examples: “tapered legs”, “lower shelf”, “drawer”, “apron”, “feet”, “2 shelves”.
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">What would you like changed?</span>
              <input
                className="field"
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                placeholder="Example: Add a lower shelf and tapered legs"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">Extra notes (used by the renderer)</span>
              <textarea
                className="field"
                rows={4}
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                placeholder="Example: drawer centered on front, apron on all sides, rounded corners, etc."
              />
            </label>

            <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={submitRefinement} style={{ fontWeight: 950 }}>
                Save refinement + regenerate previews →
              </button>

              <button
                className="btn btn-ghost"
                onClick={removeLastNote}
                disabled={!canRemoveCustomerNote}
                style={{ fontWeight: 950 }}
              >
                Remove my last note
              </button>
            </div>
          </div>

          {Array.isArray(notesLog) && notesLog.length ? (
            <div className="panel" style={{ padding: 12, borderRadius: 12, marginTop: 12 }}>
              <div className="label">Notes timeline</div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Notes are saved in separate chunks so Admin can remove any later if needed.
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {notesLog.map((n) => (
                  <div key={n.noteId} className="panel" style={{ padding: 10, borderRadius: 12 }}>
                    <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 950, color: "#0f172a" }}>
                        {String(n.kind).toUpperCase()} • {String(n.author).toUpperCase()}
                        <span className="badge" style={{ marginLeft: 8 }}>{fmt(n.createdAt)}</span>
                      </div>
                      <div className="muted" style={{ fontWeight: 850 }}>
                        Note ID: <span className="badge">{String(n.noteId).slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="muted" style={{ fontWeight: 850, whiteSpace: "pre-wrap", marginTop: 8 }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Estimate (public)</div>
          {!est ? (
            <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>Estimating… (will populate as render previews complete)</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <span className="badge rate-bright">Estimated Total: {money(est.total)}</span>
                {typeof est.rangeLow === "number" && typeof est.rangeHigh === "number" ? (
                  <span className="badge">Range: {money(est.rangeLow)} – {money(est.rangeHigh)}</span>
                ) : null}
              </div>

              <div className="muted" style={{ fontWeight: 850 }}>
                Breakdown (customer-safe): Materials {money(est.materials)} • Labor {money(est.labor)} • Finish {money(est.finish)} • Overhead {money(est.overhead)}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="stack" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div className="h3" style={{ margin: 0 }}>Render Previews</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          One render runs at a time (queued → rendering → complete). Each render has its own estimate box.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 10 }}>
          {(v.renders || []).map((r) => (
            <article key={r.renderId} className="panel card" style={{ padding: 12, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>
                View: {String(r.view).toUpperCase()}
                <span className="badge" style={{ marginLeft: 8 }}>{r.status.toUpperCase()}</span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.18)",
                  background: "rgba(2,6,23,0.25)",
                }}
              >
                {r.imageDataUrl ? (
                  <img
                    src={r.imageDataUrl}
                    alt={`${r.view} render`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div className="card-center" style={{ width: "100%", height: "100%", padding: 12 }}>
                    <div className="muted" style={{ fontWeight: 900 }}>
                      {r.status === "queued"
                        ? "Queued…"
                        : r.status === "rendering"
                        ? "Rendering…"
                        : r.status === "failed"
                        ? "Render failed (will re-run on refresh later)"
                        : "No image"}
                    </div>
                  </div>
                )}
              </div>

              <div className="panel" style={{ padding: 10, borderRadius: 12 }}>
                <div className="label">Estimate for this render</div>
                {!r.estimatePublic ? (
                  <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                    {r.status === "complete" ? "Finalizing estimate…" : "Waiting for render to complete…"}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    <div className="badge rate-bright" style={{ justifyContent: "center" }}>
                      {r.estimatePublic.label || "Estimated Total"}: {money(r.estimatePublic.total)}
                    </div>
                    {typeof r.estimatePublic.rangeLow === "number" && typeof r.estimatePublic.rangeHigh === "number" ? (
                      <div className="muted" style={{ fontWeight: 850 }}>
                        Range: {money(r.estimatePublic.rangeLow)} – {money(r.estimatePublic.rangeHigh)}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="muted" style={{ fontWeight: 850 }}>
                {r.startedAt ? `Started: ${fmt(r.startedAt)}` : "Not started yet"}
                {r.finishedAt ? ` • Finished: ${fmt(r.finishedAt)}` : ""}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
