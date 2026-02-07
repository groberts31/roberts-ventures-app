import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";

type CartItem = { serviceId: string; qty: number; note: string };

type RequestRecord = {
  id?: string;
  createdAt: string;
  appointmentStart: string;
  customer: { name: string; phone: string; address?: string; notes?: string };
  items: CartItem[];
  status?: "new" | "in_progress" | "complete";
};

const KEY = "rv_requests";

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  if (Number.isNaN(d.getTime())) return dtIso;
  return d.toLocaleString();
}

export default function RequestConfirmed() {
  const { id } = useParams();

  const req = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      const arr = Array.isArray(raw) ? raw : [];
      return arr.find((r: any) => String(r?.id) === String(id)) as RequestRecord | undefined;
    } catch {
      return undefined;
    }
  }, [id]);

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <div className="badge" style={{ width: "fit-content" }}>Roberts Ventures LLC</div>

        <h1 className="h2" style={{ margin: "10px 0 0", fontWeight: 950, color: "#0f172a" }}>
          Request received ✅
        </h1>

        <p className="body" style={{ margin: "8px 0 0", fontWeight: 850, opacity: 0.85, maxWidth: 820 }}>
          Thanks! Your request is saved and ready for review. We’ll reach out to confirm details and finalize scheduling.
        </p>

        <div className="panel" style={{ marginTop: 14, padding: 12, borderRadius: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Reference ID</div>
            <div className="badge" style={{ width: "fit-content", fontSize: 13 }}>
              {id ?? "—"}
            </div>
          </div>
        </div>

        {!req ? (
          <div className="panel" style={{ marginTop: 14, padding: 12, borderRadius: 14 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>We couldn’t load the request details.</div>
            <div className="muted" style={{ marginTop: 6, fontWeight: 850 }}>
              This can happen if the request was cleared from this browser/device.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div className="label">Requested time</div>
              <div style={{ fontWeight: 950, color: "#0f172a", marginTop: 6 }}>
                {fmt(req.appointmentStart)}
              </div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Submitted: {fmt(req.createdAt)}
              </div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div className="label">Customer</div>
              <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 950, color: "#0f172a" }}>{req.customer?.name || "—"}</div>
                <div className="muted" style={{ fontWeight: 900 }}>{req.customer?.phone || "—"}</div>
                {req.customer?.address ? (
                  <div className="muted" style={{ fontWeight: 850 }}>{req.customer.address}</div>
                ) : null}
                {req.customer?.notes ? (
                  <div className="muted" style={{ fontWeight: 850 }}>
                    Notes: {req.customer.notes}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div className="label">Services selected</div>
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {(req.items ?? []).map((it, i) => (
                  <div key={i} className="panel" style={{ padding: 10, borderRadius: 12 }}>
                    <div style={{ fontWeight: 950, color: "#0f172a" }}>
                      {it.serviceId} <span className="muted">· qty {it.qty}</span>
                    </div>
                    {it.note ? (
                      <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>{it.note}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Next steps</div>
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18, fontWeight: 850, opacity: 0.85 }}>
                <li>We review your request and confirm details (measurements, materials, access, etc.).</li>
                <li>If a quote is needed, we’ll send one for approval.</li>
                <li>Once confirmed, we finalize the schedule and you’re locked in.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
          <Link to="/services" className="btn btn-primary" style={{ fontWeight: 950 }}>Browse Services</Link>
          <Link to="/schedule" className="btn btn-ghost" style={{ fontWeight: 950 }}>New Request</Link>
          <Link to="/" className="btn btn-ghost" style={{ fontWeight: 950 }}>Home</Link>
        </div>
      </section>
    </div>
  );
}
