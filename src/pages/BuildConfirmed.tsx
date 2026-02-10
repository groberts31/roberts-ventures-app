import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBuild, type BuildSubmission } from "../lib/buildsStore";
import { estimateBuild } from "../lib/buildPricing";

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function BuildConfirmed() {
  const { id } = useParams();
  const [build, setBuild] = useState<BuildSubmission | null>(null);

  useEffect(() => {
    if (!id) return;
    setBuild(getBuild(id));
  }, [id]);

  const v = useMemo(() => build?.versions?.[0] ?? null, [build]);

  const est = useMemo(() => {
    if (!v) return null;
    try {
      return estimateBuild(v.inputsSnapshot.dims, v.inputsSnapshot.options);
    } catch {
      return null;
    }
  }, [v]);

  if (!build || !v) {
    return (
      <div className="panel card card-center" style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <h2 className="h2" style={{ margin: 0 }}>Submission not found</h2>
        <div className="muted" style={{ fontWeight: 850, marginTop: 10, textAlign: "center" }}>
          If you submitted on a different device/browser, it may not appear here yet.
        </div>
        <div className="row" style={{ gap: 10, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to="/builds/new" style={{ fontWeight: 950 }}>Start a New Build</Link>
          <Link className="btn btn-ghost" to="/builds/portal" style={{ fontWeight: 950, textDecoration: "none" }}>Go to Build Portal</Link>
        </div>
      </div>
    );
  }

  const dims = v.inputsSnapshot.dims;
  const opts = v.inputsSnapshot.options;

  const access = String(build.accessCode || "—");
  const status = String(build.status || "submitted").toUpperCase();

  const summaryLines = [
    `Build ID: ${String(build.id)}`,
    `Access Code: ${access}`,
    `Submitted: ${fmt(build.updatedAt || build.createdAt)}`,
    `Status: ${status}`,
    `Customer: ${build.customer?.name || "—"}`,
    `Phone: ${build.customer?.phone || "—"}`,
    `Email: ${build.customer?.email || "—"}`,
    `Address: ${build.customer?.address || "—"}`,
    `Type: ${v.inputsSnapshot.type || "—"}`,
    `Dims (in): ${dims.lengthIn} x ${dims.widthIn} x ${dims.heightIn} (top ${dims.topThicknessIn}")`,
    `Wood: ${opts.woodSpecies || "—"}`,
    `Finish: ${opts.finish || "—"}`,
    `Joinery: ${opts.joinery || "—"}`,
  ];

  if (v.inputsSnapshot.notes) summaryLines.push(`Notes: ${v.inputsSnapshot.notes}`);

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div className="badge" style={{ width: "fit-content" }}>Build Submitted</div>

          <h1 className="h2" style={{ margin: 0, fontWeight: 950 }}>✅ Submission Received</h1>

          <div className="muted" style={{ fontWeight: 900 }}>
            Save your Access Code — you’ll use it in the Build Portal.
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Access Code</div>
              <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: ".08em", color: "#0f172a" }}>
                {access}
              </div>
              <div className="muted" style={{ fontWeight: 850 }}>
                Build #{String(build.id).slice(-8).toUpperCase()} • {fmt(build.updatedAt || build.createdAt)}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 950 }}
              onClick={async () => {
                const txt = `Build Access Code: ${access}\nBuild ID: ${String(build.id)}\nPhone: ${build.customer?.phone || ""}`;
                try {
                  await navigator.clipboard.writeText(txt);
                  alert("Copied build info to clipboard.");
                } catch {
                  alert("Clipboard blocked. Copy the Access Code manually.");
                }
              }}
            >
              Copy Code + Info
            </button>
          </div>
        </div>

        {est ? (
          <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Estimate (initial)</div>
            <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <span className="badge" style={{ fontWeight: 950 }}>Range: {money(est.rangeLow)} – {money(est.rangeHigh)}</span>
              <span className="badge" style={{ fontWeight: 950 }}>Materials: {money(est.materials)}</span>
              <span className="badge" style={{ fontWeight: 950 }}>Labor: {money(est.labor)}</span>
              <span className="badge" style={{ fontWeight: 950 }}>Overhead: {money(est.overhead)}</span>
              <span className="badge" style={{ fontWeight: 950 }}>Finish: {money(est.finish)}</span>
            </div>
            <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
              This is a rough estimate. Final quote may change based on details/material availability.
            </div>
          </div>
        ) : null}

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Submission Summary</div>

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {summaryLines.map((line) => (
              <div key={line} className="muted" style={{ fontWeight: 850 }}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, marginTop: 12, width: "100%", maxWidth: 1000 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>What happens next</div>
          <ul className="muted" style={{ fontWeight: 850, marginTop: 10, lineHeight: 1.5 }}>
            <li>We review your build details + notes.</li>
            <li>We may follow up for measurements/photos if needed.</li>
            <li>You’ll receive a quote and timeline once confirmed.</li>
          </ul>
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
          <Link className="btn btn-primary" to={`/builds/${build.id}`} style={{ fontWeight: 950 }}>
            View Renders
          </Link>
          <Link className="btn btn-ghost" to="/builds/portal" style={{ fontWeight: 950, textDecoration: "none" }}>
            Go to Build Portal
          </Link>
          <Link className="btn btn-ghost" to="/" style={{ fontWeight: 950, textDecoration: "none" }}>
            Back Home
          </Link>
        </div>
      </section>
    </div>
  );
}
