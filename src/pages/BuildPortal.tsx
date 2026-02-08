import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { findBuildsByNameAndPhone, findBuildsByPhoneAndCode, type BuildSubmission, normalizePhone } from "../lib/buildsStore";

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusLabel(s: string) {
  const low = String(s || "").toLowerCase();
  if (low === "complete") return "Complete";
  if (low === "in_build") return "In Build";
  if (low === "approved") return "Approved";
  if (low === "quote_sent") return "Quote Sent";
  if (low === "reviewing") return "Reviewing";
  if (low === "submitted") return "Submitted";
  return "Draft";
}

export default function BuildPortal() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState(false);

  const [showRetrieve, setShowRetrieve] = useState(false);
  const [retrieveName, setRetrieveName] = useState("");
  const [retrievePhone, setRetrievePhone] = useState("");

  const matches: BuildSubmission[] = useMemo(() => {
    const p = normalizePhone(phone);
    if (!p) return [];
    return findBuildsByPhoneAndCode(p, code).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [phone, code]);

  const retrieveMatches = useMemo(() => {
    const n = String(retrieveName || "").trim();
    const p = String(retrievePhone || "").trim();
    if (!n || p.length < 7) return [];
    return findBuildsByNameAndPhone(n, p).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [retrieveName, retrievePhone]);

  async function copyText(text: string) {
    const v = String(text || "").trim();
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      alert(`Copied: ${v}`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = v;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        alert(`Copied: ${v}`);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  return (
    <div className="stack">
      <section className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 className="h2" style={{ margin: 0 }}>Build Portal</h2>
        <p className="muted" style={{ fontWeight: 850, maxWidth: 720, textAlign: "center" }}>
          Enter the phone number used on your build and your Build Access Code (shown after submitting) to view builds on this device/browser.
        </p>

        <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="label">Phone Number</span>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" inputMode="tel" />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span className="label">Access Code</span>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" inputMode="numeric" />
          </label>

          <button
            className="btn btn-primary"
            onClick={() => setSearched(true)}
            disabled={normalizePhone(phone).length < 10 || String(code).trim().length < 6}
          >
            Find My Builds
          </button>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowRetrieve((v) => !v)} style={{ width: "fit-content" }}>
              {showRetrieve ? "Hide" : "Forgot Access Code?"}
            </button>

            {showRetrieve && (
              <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
                <div style={{ fontWeight: 950, color: "#0f172a" }}>Retrieve Access Code</div>
                <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                  Enter the same name + phone used on the build. (Works on this device/browser until Firebase is connected.)
                </div>

                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span className="label">Full Name</span>
                    <input className="input" value={retrieveName} onChange={(e) => setRetrieveName(e.target.value)} placeholder="First Last" autoComplete="name" />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span className="label">Phone Number</span>
                    <input className="input" value={retrievePhone} onChange={(e) => setRetrievePhone(e.target.value)} placeholder="(555) 555-5555" inputMode="tel" autoComplete="tel" />
                  </label>

                  {retrieveMatches.length === 0 ? (
                    <div className="muted" style={{ fontWeight: 850 }}>No matching builds found yet.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {retrieveMatches.slice(0, 6).map((b) => (
                        <div key={String(b.id)} className="panel" style={{ padding: 12, borderRadius: 14 }}>
                          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 950, color: "#0f172a" }}>
                              Build: {String(b.id).slice(-8).toUpperCase()}
                            </div>
                            <button
                              type="button"
                              className="badge"
                              onClick={() => copyText(String(b.accessCode || ""))}
                              title="Click to copy"
                              style={{ cursor: "pointer", justifyContent: "center", border: "1px solid rgba(2,6,23,0.14)" }}
                            >
                              Code: {String(b.accessCode || "—")}
                            </button>
                          </div>
                          <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                            Created: {prettyDate(b.createdAt)}
                          </div>
                        </div>
                      ))}
                      <div className="muted" style={{ fontWeight: 850 }}>
                        Tip: Copy the code above and use it in the main search (Phone + Access Code).
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="muted" style={{ fontWeight: 850, textAlign: "center" }}>
              Tip: Your Access Code appears after you submit a build—save it. This portal works on the same device/browser until Firebase is connected.
            </div>
          </div>
        </div>
      </section>

      {searched && (
        <section className="stack" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          {matches.length === 0 ? (
            <div className="panel card card-center">
              <div className="h3" style={{ margin: 0 }}>No builds found</div>
              <div className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 700 }}>
                If you submitted on a different device/browser, it won’t appear here yet.
              </div>
              <Link className="btn btn-ghost" to="/builds/new">Start a Build</Link>
            </div>
          ) : (
            <div className="stack">
              <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div className="h3" style={{ margin: 0 }}>Your Builds</div>
                  <div className="muted" style={{ fontWeight: 850 }}>
                    Found {matches.length} build{matches.length === 1 ? "" : "s"} for {phone}
                  </div>
                </div>
              </div>

              <div className="stack">
                {matches.map((b) => (
                  <article key={b.id} className="panel card" style={{ display: "grid", gap: 10 }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "grid", gap: 4 }}>
                        <div style={{ fontWeight: 950, color: "#0f172a" }}>
                          Build #{String(b.id).slice(-8).toUpperCase()}
                        </div>
                        <div className="muted" style={{ fontWeight: 850 }}>
                          Created: {prettyDate(b.createdAt)} • Type: {b.project?.type || "—"}
                        </div>
                      </div>

                      <div className="row" style={{ gap: 10, alignItems: "center" }}>
                        <span className="badge" style={{ fontWeight: 950 }}>Status: {statusLabel(b.status)}</span>
                        <Link className="btn btn-primary" to={`/builds/${b.id}`}>
                          View Renders
                        </Link>
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                      <span className="badge">Versions: {b.versions?.length ?? 0}</span>
                      <span className="badge">Dims: {b.project?.dims?.lengthIn ?? "—"}×{b.project?.dims?.widthIn ?? "—"}×{b.project?.dims?.heightIn ?? "—"} in</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
