import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

function safeStatus(s: any): "new" | "in_progress" | "complete" {
  if (s === "in_progress" || s === "complete" || s === "new") return s;
  return "new";
}

function badgeStyle(status: string) {
  if (status === "complete")
    return { background: "rgba(34,197,94,0.12)", color: "#14532d", border: "1px solid rgba(34,197,94,0.20)" };
  if (status === "in_progress")
    return { background: "rgba(14,165,233,0.12)", color: "#0c4a6e", border: "1px solid rgba(14,165,233,0.20)" };
  return { background: "rgba(245,158,11,0.14)", color: "#7c2d12", border: "1px solid rgba(245,158,11,0.22)" };
}

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  if (Number.isNaN(d.getTime())) return dtIso;
  return d.toLocaleString();
}

function readRequests(): RequestRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r, status: safeStatus(r?.status) }));
  } catch (e) {
    return [];
  }
}

export default function Requests() {
  const [reqs, setReqs] = useState<RequestRecord[]>([]);
  const [q, setQ] = useState("");

  function refresh() {
    setReqs(readRequests());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reqs;

    return reqs.filter((r) => {
      const hay = [
        r.id,
        r.createdAt,
        r.appointmentStart,
        r.customer?.name,
        r.customer?.phone,
        r.customer?.address,
        r.customer?.notes,
        safeStatus(r.status),
        ...(r.items ?? []).map((i) => i.serviceId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(term);
    });
  }, [reqs, q]);

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h1 className="h2" style={{ margin: 0, fontWeight: 950 }}>My Requests</h1>
            <div className="muted" style={{ fontWeight: 850 }}>
              Track your request status: <strong>New</strong> → <strong>In Progress</strong> → <strong>Complete</strong>
            </div>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={refresh} style={{ fontWeight: 900 }}>Refresh</button>
            <Link className="btn btn-primary" to="/schedule" style={{ fontWeight: 950 }}>New Request</Link>
          </div>
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <input
            className="field"
            style={{ flex: 1, minWidth: 240 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, service…"
          />
          <span className="badge" style={{ justifyContent: "center" }}>Total: {filtered.length}</span>
        </div>
      </section>

      <section className="stack" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {filtered.length === 0 ? (
          <div className="panel card card-center" style={{ padding: 18 }}>
            <h3 className="h3">No requests yet</h3>
            <p className="body" style={{ maxWidth: 760 }}>
              Submit a request from the Schedule page and it will show up here.
            </p>
            <Link className="btn btn-primary" to="/services" style={{ fontWeight: 950 }}>Browse Services</Link>
          </div>
        ) : (
          filtered
            .slice()
            .sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")))
            .map((r, idx) => {
              const st = safeStatus(r.status);
              const rid = r.id ?? r.createdAt ?? `req-${idx}`;
              const items = r.items ?? [];

              return (
                <article key={rid} className="panel card" style={{ padding: 16 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 950, color: "#0f172a" }}>
                        Request <span className="badge" style={{ marginLeft: 8, fontSize: 12 }}>{rid}</span>
                        <span className="badge" style={{ marginLeft: 8, ...badgeStyle(st) }}>
                          {st.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="muted" style={{ fontWeight: 850 }}>
                        Requested: {fmt(r.appointmentStart)} · Submitted: {fmt(r.createdAt)}
                      </div>

                      <div className="muted" style={{ fontWeight: 850 }}>
                        Customer: <strong>{r.customer?.name || "—"}</strong> · {r.customer?.phone || "—"}
                      </div>
                    </div>

                    <Link
                      to={`/request-confirmed/${rid}`}
                      className="btn btn-primary"
                      style={{ fontWeight: 950 }}
                    >
                      View Details →
                    </Link>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {items.map((it, j) => (
                      <div key={j} className="muted" style={{ fontWeight: 900 }}>
                        • {it.serviceId} {it.qty ? `× ${it.qty}` : ""}{it.note ? ` — ${it.note}` : ""}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })
        )}
      </section>
    </div>
  );
}
