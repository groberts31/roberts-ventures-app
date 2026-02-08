import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { estimateBuild } from "../lib/buildPricing";
import { getBuild, markSubmitted, upsertBuild, type BuildSubmission, type RenderJob } from "../lib/buildsStore";

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function svgPlaceholder(view: string, title: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.20"/>
        <stop offset="1" stop-color="#a78bfa" stop-opacity="0.18"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="rgba(2,6,23,0.85)"/>
    <rect x="40" y="40" width="1120" height="720" rx="24" fill="url(#g)" stroke="rgba(248,250,252,0.12)" />
    <text x="80" y="140" fill="rgba(248,250,252,0.92)" font-size="58" font-family="Arial" font-weight="800">${title}</text>
    <text x="80" y="215" fill="rgba(248,250,252,0.70)" font-size="32" font-family="Arial" font-weight="700">View: ${view}</text>
    <text x="80" y="270" fill="rgba(248,250,252,0.70)" font-size="28" font-family="Arial" font-weight="700">Preview render placeholder (Three.js upgrade later)</text>
    <circle cx="1020" cy="240" r="110" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.32)" />
    <circle cx="1070" cy="290" r="70" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.32)" />
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function BuildPreview() {
  const { id } = useParams();
  const [build, setBuild] = useState<BuildSubmission | null>(null);

  useEffect(() => {
    if (!id) return;
    setBuild(getBuild(id));
  }, [id]);

  const version = useMemo(() => build?.versions?.[0] ?? null, [build]);

  // Kick off “render jobs” for any queued renders (placeholder implementation).
  useEffect(() => {
    if (!build || !version) return;

    // Always run from the latest stored build (avoids stale closures)
    const latest0 = getBuild(build.id) ?? build;
    const lv0 = latest0.versions?.[0];
    if (!lv0) return;

    const renders0 = lv0.renders || [];

    // 1) If nothing is currently rendering, promote the FIRST queued render to "rendering"
    const currentlyRendering = renders0.find((r) => r.status === "rendering") ?? null;

    let target: RenderJob | null = currentlyRendering;

    if (!target) {
      const firstQueued = renders0.find((r) => r.status === "queued") ?? null;

      if (firstQueued) {
        const startedAt = new Date().toISOString();
        const updatedRenders = renders0.map((r) =>
          r.renderId === firstQueued.renderId
            ? ({ ...r, status: "rendering" as const, startedAt } as RenderJob)
            : r
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

    // If still nothing to do, exit
    if (!target) return;

    // 2) Complete ONLY the single "target" render after a short delay
    const delay = 900;
    const timer = setTimeout(() => {
      const latest = getBuild(build.id);
      if (!latest) return;

      const lv = latest.versions[0];
      const est = estimateBuild(lv.inputsSnapshot.dims, lv.inputsSnapshot.options);

      const title = `${lv.inputsSnapshot.type} • ${lv.inputsSnapshot.dims.lengthIn}"×${lv.inputsSnapshot.dims.widthIn}"×${lv.inputsSnapshot.dims.heightIn}"`;

      const updatedRenders = (lv.renders || []).map((x) => {
        if (x.renderId != target!.renderId) return x;

        return {
          ...x,
          status: "complete" as const,
          finishedAt: new Date().toISOString(),
          imageDataUrl: svgPlaceholder(x.view, title),
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
    }, delay);

    return () => clearTimeout(timer);
  }, [build?.id, version?.versionId]); // intentionally narrow deps

  if (!build || !version) {
    return (
      <div className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h3 className="h3">Build not found</h3>
        <Link className="btn btn-primary" to="/builds/new">Start a Build</Link>
      </div>
    );
  }

  const v = version;
    const b = build;
const est = v.estimatePublic;

  function submit() {
        const next = markSubmitted(b.id);
    if (!next) return alert("Could not submit. Try again.");
    setBuild(next);
    alert(`Submitted! Your Build Access Code: ${String(next.accessCode || "—")}`);
  }

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h1 className="h2" style={{ margin: 0, fontWeight: 950 }}>Build Preview</h1>
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
            Wood: {v.inputsSnapshot.options.woodSpecies} • Finish: {v.inputsSnapshot.options.finish} • Joinery: {v.inputsSnapshot.options.joinery}
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Link className="btn btn-ghost" to="/builds/new">Start Another</Link>
            <Link className="btn btn-ghost" to="/builds/portal">Build Portal</Link>
            <button className="btn btn-primary" onClick={submit} style={{ fontWeight: 950 }}>
              Submit for Review
            </button>
          </div>

          <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
            After submitting you’ll get a 6-digit Access Code to view your build in the portal.
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Estimate (public)</div>
          {!est ? (
            <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
              Estimating… (will populate as render previews complete)
            </div>
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
          Each render has its own estimate box that updates when the render completes.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 10 }}>
          {(v.renders || []).map((r) => (
            <article key={r.renderId} className="panel card" style={{ padding: 12, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>
                View: {String(r.view).toUpperCase()}
                <span className="badge" style={{ marginLeft: 8 }}>
                  {r.status.toUpperCase()}
                </span>
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
                  <img src={r.imageDataUrl} alt={`${r.view} render`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div className="card-center" style={{ width: "100%", height: "100%", padding: 12 }}>
                    <div className="muted" style={{ fontWeight: 900 }}>
                      {r.status === "queued" ? "Queued…" : r.status === "rendering" ? "Rendering…" : "No image"}
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
                {r.startedAt ? `Started: ${fmt(r.startedAt)}` : "Not started yet"}{r.finishedAt ? ` • Finished: ${fmt(r.finishedAt)}` : ""}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
