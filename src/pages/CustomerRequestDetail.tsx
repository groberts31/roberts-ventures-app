import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { findRequestById } from "../lib/requestsStore";
import { SERVICES } from "../data/services";
import { ADD_ONS } from "../data/addOns";

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

export default function CustomerRequestDetail() {
  const { id } = useParams();
  const req = useMemo(() => (id ? findRequestById(id) : undefined), [id]);

  const byId = useMemo(() => {
    const all = [...SERVICES, ...ADD_ONS] as any[];
    return new Map(all.map((s) => [String(s.id), s]));
  }, []);

  if (!req) {
    return (
      <section className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 className="h2" style={{ margin: 0 }}>Request not found</h2>
        <p className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 720 }}>
          This can happen if the request was cleared from this browser/device.
        </p>
        <Link className="btn btn-primary" to="/customer">Back to Customer Portal</Link>
      </section>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <section className="panel card" style={{ display: "grid", gap: 10 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div className="h2" style={{ margin: 0 }}>Request Details</div>
            <div className="muted" style={{ fontWeight: 850 }}>
              Request #{String(req.id).slice(-8).toUpperCase()} • Status: {statusLabel(req.status)}
            </div>
          </div>
          <Link className="btn btn-ghost" to="/customer">Back</Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
            marginTop: 6,
          }}
        >
          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Customer</div>
            <div style={{ fontWeight: 950, marginTop: 6 }}>{req.customer?.name || "—"}</div>
            <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>{req.customer?.phone || "—"}</div>
          </div>

          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Appointment</div>
            <div style={{ fontWeight: 950, marginTop: 6 }}>{prettyDate(req.appointmentStart)}</div>
            <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>Created: {prettyDate(req.createdAt)}</div>
          </div>

          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Address</div>
            <div style={{ fontWeight: 950, marginTop: 6 }}>{req.customer?.address || "—"}</div>
          </div>
        </div>

        {req.customer?.notes ? (
          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Notes</div>
            <div className="body" style={{ marginTop: 6 }}>{req.customer.notes}</div>
          </div>
        ) : null}
      </section>

      <section className="panel card" style={{ display: "grid", gap: 10 }}>
        <div className="h3" style={{ margin: 0 }}>Selected Items</div>

        <div style={{ display: "grid", gap: 10 }}>
          {(req.items || []).map((it, idx) => {
            const svc: any = byId.get(String(it.serviceId));
            const name = svc?.name ?? it.serviceId;
            const isAddOn = Boolean(svc?.isAddOn);
            return (
              <article key={idx} className="panel" style={{ padding: 12, borderRadius: 14 }}>
                <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontWeight: 950, color: "#0f172a" }}>
                      {isAddOn ? `Add-on: ${name}` : name}
                    </div>
                    <div className="muted" style={{ fontWeight: 850 }}>
                      {svc?.category ?? (isAddOn ? "Add-Ons" : "Service")}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="badge">Qty: {it.qty ?? 1}</span>
                  </div>
                </div>

                {it.note ? (
                  <div className="muted" style={{ marginTop: 8, fontWeight: 850 }}>
                    Note: {it.note}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {(req.photos || []).length > 0 ? (
        <section className="panel card" style={{ display: "grid", gap: 10 }}>
          <div className="h3" style={{ margin: 0 }}>Photos</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            {req.photos.map((ph, i) => (
              <div key={i} className="panel" style={{ padding: 10, borderRadius: 14 }}>
                <div style={{ borderRadius: 12, overflow: "hidden" }}>
                  <img src={ph.dataUrl} alt={ph.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                </div>
                <div className="muted" style={{ fontWeight: 850, marginTop: 8, fontSize: 12, wordBreak: "break-word" }}>
                  {ph.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
