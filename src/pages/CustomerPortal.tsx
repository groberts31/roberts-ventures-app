import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { findRequestsByPhone, type RVRequest } from "../lib/requestsStore";

function normalizePhone(p: string) {
  return String(p || "").replace(/\D+/g, "");
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusLabel(s: string) {
  const low = String(s || "").toLowerCase();
  if (low === "complete") return "Complete";
  if (low === "in_progress") return "In Progress";
  return "New";
}

export default function CustomerPortal() {
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);

  const matches: RVRequest[] = useMemo(() => {
    const p = normalizePhone(phone);
    if (!p) return [];
    return findRequestsByPhone(p).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [phone]);

  return (
    <div className="stack">
      <section className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 className="h2" style={{ margin: 0 }}>Customer Portal</h2>
        <p className="muted" style={{ fontWeight: 850, maxWidth: 720, textAlign: "center" }}>
          Enter the phone number used on your request to view your saved requests on this device/browser.
        </p>

        <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="label">Phone Number</span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              inputMode="tel"
            />
          </label>

          <button
            className="btn btn-primary"
            onClick={() => setSearched(true)}
            disabled={normalizePhone(phone).length < 10}
          >
            Find My Requests
          </button>

          <div className="muted" style={{ fontWeight: 850, textAlign: "center" }}>
            Tip: This works on the same device/browser where you submitted the request. We can make it cross-device once Firebase is connected.
          </div>
        </div>
      </section>

      {searched && (
        <section className="stack" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          {matches.length === 0 ? (
            <div className="panel card card-center">
              <div className="h3" style={{ margin: 0 }}>No requests found</div>
              <div className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 700 }}>
                If you submitted a request on a different device/browser, it won't appear here yet.
              </div>
              <Link className="btn btn-ghost" to="/services">Browse Services</Link>
            </div>
          ) : (
            <div className="stack">
              <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div className="h3" style={{ margin: 0 }}>Your Requests</div>
                  <div className="muted" style={{ fontWeight: 850 }}>
                    Found {matches.length} request{matches.length === 1 ? "" : "s"} for {phone}
                  </div>
                </div>
              </div>

              <div className="stack">
                {matches.map((r) => (
                  <article key={r.id} className="panel card" style={{ display: "grid", gap: 10 }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "grid", gap: 4 }}>
                        <div style={{ fontWeight: 950, color: "#0f172a" }}>
                          Request #{String(r.id).slice(-8).toUpperCase()}
                        </div>
                        <div className="muted" style={{ fontWeight: 850 }}>
                          Created: {prettyDate(r.createdAt)} • Appointment: {prettyDate(r.appointmentStart)}
                        </div>
                      </div>

                      <div className="row" style={{ gap: 10, alignItems: "center" }}>
                        <span className="badge" style={{ fontWeight: 950 }}>Status: {statusLabel(r.status)}</span>
                        <Link className="btn btn-primary" to={`/customer/requests/${r.id}`}>
                          View Details
                        </Link>
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                      <span className="badge">Items: {r.items?.length ?? 0}</span>
                      {r.customer?.address ? <span className="badge">Address: {r.customer.address}</span> : null}
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
