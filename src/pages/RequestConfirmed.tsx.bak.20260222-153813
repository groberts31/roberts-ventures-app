import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { findRequestById } from "../lib/requestsStore";
import { SERVICES } from "../data/services";
import { ADD_ONS } from "../data/addOns";










const softPanel: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(2,6,23,0.14)",
  boxShadow: "0 18px 44px rgba(2,6,23,0.18)",
};

const softPanelTight: React.CSSProperties = {
  ...softPanel,
  padding: 14,
  borderRadius: 14,
};

const darkText: React.CSSProperties = {
  color: "#0f172a",
};

const heroCodeBox: React.CSSProperties = {
  ...softPanel,
  textAlign: "center",
  width: "100%",
  maxWidth: 620,
  padding: 16,
  borderRadius: 16,
};


function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function estimateLineLabel(s: any, qty: number) {
  if (!s) return "";
  const q = Number.isFinite(Number(qty)) && Number(qty) > 0 ? Number(qty) : 1;

  if (s.priceType === "quote") return "Quote";

  const price = typeof s.price === "number" ? s.price : 0;

  if (s.priceType === "starting_at") return `From ${money(price * q)}`;
  return money(price * q);
}

export default function RequestConfirmed() {
  const { id } = useParams();

  const req = useMemo(() => {
    if (!id) return undefined;
    return findRequestById(id);
  }, [id]);

  const ALL_SERVICES = useMemo(() => [...SERVICES, ...ADD_ONS], []);

  const detailed = useMemo(() => {
    const items = (req as any)?.items ?? [];
    return (Array.isArray(items) ? items : []).map((it: any) => {
      const serviceId = String(it?.serviceId || "");
      const qty = Number(it?.qty ?? 1);
      const note = String(it?.note || "");
      const svc = ALL_SERVICES.find((s: any) => String(s?.id) === serviceId);
      return {
        serviceId,
        qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
        note,
        svc,
        name: String(svc?.name || serviceId || "Service"),
        priceType: String((svc as any)?.priceType || ""),
        lineLabel: estimateLineLabel(svc as any, qty),
      };
    });
  }, [req, ALL_SERVICES]);

  const totals = useMemo(() => {
    let fixedSubtotal = 0;
    let startingSubtotal = 0;
    const quoteNames: string[] = [];

    for (const it of detailed) {
      const s: any = it.svc;
      const qty = Number(it.qty ?? 1);
      if (!s) continue;

      const price = typeof s.price === "number" ? s.price : 0;

      if (s.priceType === "quote") {
        quoteNames.push(it.name);
        continue;
      }
      if (s.priceType === "fixed") {
        fixedSubtotal += price * qty;
        continue;
      }
      if (s.priceType === "starting_at") {
        startingSubtotal += price * qty;
        continue;
      }
    }

    return {
      fixedSubtotal,
      startingSubtotal,
      minTotal: fixedSubtotal + startingSubtotal,
      quoteNames,
    };
  }, [detailed]);

  async function copyText(v: string) {
    const text = String(v || "").trim();
    if (!text) return;

    // Try modern clipboard first
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        alert("Copied.");
        return;
      }
    } catch {
      // fall through to legacy copy
    }

    // Legacy fallback (works even on http + some blocked clipboard contexts)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      alert("Copied.");
    } finally {
      document.body.removeChild(ta);
    }
  }

  if (!id) {
    return (
      <section
        className="panel card card-center"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: 18,
          borderRadius: 18,
        }}
      >
        <h2 className="h2" style={{ margin: 0 }}>Missing request id</h2>
        <p className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 720 }}>
          We couldn’t determine which request to display.
        </p>
        <Link className="btn btn-primary" to="/schedule">Back to Schedule</Link>
      </section>
    );
  }

  if (!req) {
    return (
      <section
        className="panel card card-center"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: 18,
          borderRadius: 18,
        }}
      >
        <h2 className="h2" style={{ margin: 0 }}>We couldn’t load the request details.</h2>
        <p className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 720 }}>
          This can happen if the request was cleared from this browser/device.
        </p>
        <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to="/customer">Go to Customer Portal</Link>
          <Link className="btn btn-ghost" to="/services">Browse Services</Link>
        </div>
      </section>
    );
  }

  const photos: any[] = Array.isArray((req as any)?.photos) ? (req as any).photos : [];
  const accessCode = (req as any)?.accessCode ? String((req as any).accessCode) : "";
  const rid = String((req as any)?.id || id);
  const customer = (req as any)?.customer ?? {};
  const appt = String((req as any)?.appointmentStart || "");
  const createdAt = String((req as any)?.createdAt || "");

  const phoneToCopy = String(customer?.phone || "");

  return (
    <div className="stack page" style={{ gap: 16, alignItems: "stretch" }}>
      <section
        className="panel card card-center"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: 18,
          borderRadius: 18,
        }}
      >
        <h2 className="h2" style={{ margin: 0 }}>Request Submitted ✅</h2>
        <p className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 820 }}>
          Here’s a full confirmation of what was submitted. Screenshot or copy the Access Code to open this request in the Customer Portal.
        </p>

        {/* Access Code (big) */}
        <div
          className="panel"
          style={{ ...heroCodeBox }}>
          <div className="label">Customer Access Code</div>
          <div style={{ ...darkText, fontWeight: 950, fontSize: 34, letterSpacing: 6, marginTop: 10, padding: "10px 14px", borderRadius: 14, background: "linear-gradient(90deg, rgba(99,102,241,0.16), rgba(56,189,248,0.14))", border: "1px solid rgba(99,102,241,0.22)", display: "inline-block", minWidth: 260 }}>
            {accessCode || "—"}
          </div>

          {/* ✅ COPY BUTTONS (ALWAYS RENDER) */}
          <div className="row" style={{ justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 950 }}
              onClick={() => copyText(accessCode)}
              disabled={!accessCode}
              title="Copy Access Code"
            >
              Copy Code
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontWeight: 950 }}
              onClick={() => copyText(phoneToCopy)}
              disabled={!phoneToCopy}
              title="Copy Phone Number"
            >
              Copy Phone
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontWeight: 950 }}
              onClick={() => copyText(rid)}
              disabled={!rid}
              title="Copy Request ID"
            >
              Copy ID
            </button>
          </div>

          <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>
            Use <strong>Phone + Access Code</strong> in the Customer Portal (on this device/browser until Firebase is connected).
          </div>
        </div>

        {/* Summary grid */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gap: 12,
            marginTop: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "start",
          }}
        >
          {/* Request meta */}
          <div className="panel" style={{ ...softPanelTight }}>
            <div className="h3" style={{ margin: 0, color: "#0f172a" }}>Request Details</div>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="label">Request ID</div>
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{rid}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="label">Submitted</div>
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{createdAt ? prettyDate(createdAt) : "—"}</div>
                </div>
              </div>

              <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="label">Customer</div>
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{customer?.name || "—"}</div>
                  <div className="muted" style={{ fontWeight: 850, marginTop: 4 }}>{phoneToCopy || "—"}</div>
                  {customer?.address ? (
                    <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                      <strong>Address:</strong> {String(customer.address)}
                    </div>
                  ) : null}
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="label">Appointment</div>
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{appt ? prettyDate(appt) : "—"}</div>
                </div>
              </div>

              {customer?.notes ? (
                <div className="panel" style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(2,6,23,0.12)" }}>
                  <div className="label">Notes</div>
                  <div className="muted" style={{ fontWeight: 850 }}>{String(customer.notes)}</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Items + totals */}
          <div className="panel" style={{ ...softPanelTight }}>
            <div className="h3" style={{ margin: 0, color: "#0f172a" }}>Services Requested</div>

            {detailed.length === 0 ? (
              <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>No items found on this request.</div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {detailed.map((it, idx) => (
                  <div
                    key={`${it.serviceId}-${idx}`}
                    className="panel"
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(2,6,23,0.12)",
                      background: "rgba(255,255,255,0.85)",
                    }}
                  >
                    <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 950, color: "#0f172a" }}>{it.name}</div>
                        <div className="muted" style={{ fontWeight: 850, marginTop: 4 }}>
                          Qty: <strong>{it.qty}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div className="badge" style={{ justifyContent: "center" }}>{it.lineLabel || "—"}</div>
                      </div>
                    </div>

                    {it.note ? (
                      <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
                        <strong>Note:</strong> {it.note}
                      </div>
                    ) : null}
                  </div>
                ))}

                <div className="panel" style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(2,6,23,0.12)", background: "rgba(255,255,255,0.85)" }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 950, color: "#0f172a" }}>Estimated Total (minimum)</div>
                    <div style={{ fontWeight: 950, color: "#0f172a" }}>{money(totals.minTotal)}</div>
                  </div>
                  <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                    Fixed: {money(totals.fixedSubtotal)} • Starting-at minimum: {money(totals.startingSubtotal)}
                  </div>
                  {totals.quoteNames.length > 0 ? (
                    <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
                      <strong>Quote required:</strong> {totals.quoteNames.join(", ")}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="panel" style={{ padding: 14, borderRadius: 14, width: "100%", maxWidth: 1100, marginTop: 6 }}>
          <div className="h3" style={{ margin: 0, color: "#0f172a" }}>Photos</div>
          {photos.length === 0 ? (
            <div className="muted" style={{ fontWeight: 850, marginTop: 10 }}>No photos were attached.</div>
          ) : (
            <div
              style={{
                marginTop: 10,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              {photos.slice(0, 12).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="panel"
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid rgba(2,6,23,0.12)",
                    background: "rgba(255,255,255,0.85)",
                  }}
                >
                  {p?.dataUrl ? (
                    <img
                      src={String(p.dataUrl)}
                      alt={String(p?.name || `Photo ${idx + 1}`)}
                      style={{
                        width: "100%",
                        height: 130,
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 10,
                        border: "1px solid rgba(2,6,23,0.12)",
                      }}
                    />
                  ) : (
                    <div className="muted" style={{ fontWeight: 850 }}>Missing image data</div>
                  )}
                  <div className="muted" style={{ fontWeight: 850, marginTop: 8, fontSize: 12 }}>
                    {String(p?.name || `Photo ${idx + 1}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Link className="btn btn-primary" to="/customer">Open Customer Portal</Link>
          <Link className="btn btn-ghost" to="/services">Browse Services</Link>
          <Link className="btn btn-ghost" to="/schedule">New Request</Link>
        </div>
      </section>
    </div>
  );
}
