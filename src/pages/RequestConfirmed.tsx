import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { findRequestById } from "../lib/requestsStore";

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function RequestConfirmed() {
  const { id } = useParams();

  const req = useMemo(() => {
    if (!id) return undefined;
    return findRequestById(id);
  }, [id]);

  if (!id) {
    return (
      <section className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
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
      <section className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
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

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 className="h2" style={{ margin: 0 }}>Request Submitted ✅</h2>
        <p className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 760 }}>
          Your request has been saved locally for now. You can use the Access Code + Phone Number in the Customer Portal
          to view this request on this device/browser.
        </p>

        <div
          className="panel"
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,255,255,0.90)",
            border: "1px solid rgba(2,6,23,0.14)",
            textAlign: "center",
            width: "100%",
            maxWidth: 520,
          }}
        >
          <div className="label">Customer Access Code</div>
          <div style={{ fontWeight: 950, fontSize: 28, letterSpacing: 3, marginTop: 6, color: "#0f172a" }}>
            {(req as any)?.accessCode ? String((req as any).accessCode) : "—"}
          </div>
          <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
            Save this code (screenshot it). You’ll need it with your phone number in the Customer Portal.
          </div>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 720,
            display: "grid",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div className="label">Request ID</div>
                <div style={{ fontWeight: 950 }}>{String(req.id)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label">Created</div>
                <div style={{ fontWeight: 950 }}>{prettyDate(req.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div className="label">Customer</div>
                <div style={{ fontWeight: 950 }}>{req.customer?.name || "—"}</div>
                <div className="muted" style={{ fontWeight: 850, marginTop: 4 }}>{req.customer?.phone || "—"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label">Appointment</div>
                <div style={{ fontWeight: 950 }}>{prettyDate(req.appointmentStart)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
          <Link className="btn btn-primary" to="/customer">Open Customer Portal</Link>
          <Link className="btn btn-ghost" to="/services">Add More Services</Link>
        </div>
      </section>
    </div>
  );
}
