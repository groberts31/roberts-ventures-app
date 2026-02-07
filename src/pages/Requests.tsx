import { useMemo, useState } from "react";
import { SERVICES } from "../data/services";

type PhotoAttachment = {
  name: string;
  type: string;
  dataUrl: string;
};

type SavedRequest = {
  createdAt: string;
  appointmentStart: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  items: { serviceId: string; qty: number; note: string }[];
  photos?: PhotoAttachment[];
  status?: "new" | "confirmed" | "completed";
};

function loadRequests(): SavedRequest[] {
  try {
    return JSON.parse(localStorage.getItem("rv_requests") ?? "[]");
  } catch {
    return [];
  }
}

function saveRequests(reqs: SavedRequest[]) {
  localStorage.setItem("rv_requests", JSON.stringify(reqs));
}

function serviceName(serviceId: string) {
  return SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId;
}

export default function Requests() {
  const [requests, setRequests] = useState<SavedRequest[]>(() => loadRequests());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selected = useMemo(() => {
    if (selectedIndex === null) return null;
    return requests[selectedIndex] ?? null;
  }, [selectedIndex, requests]);

  function setStatus(index: number, status: SavedRequest["status"]) {
    const next = [...requests];
    next[index] = { ...next[index], status };
    setRequests(next);
    saveRequests(next);
  }

  function clearAll() {
    if (!confirm("Delete all saved requests from this device?")) return;
    setRequests([]);
    saveRequests([]);
    setSelectedIndex(null);
  }

  function exportJSON() {
    const text = JSON.stringify(requests, null, 2);
    navigator.clipboard.writeText(text);
    alert("Copied requests JSON to clipboard.");
  }

  return (
    <div className="stack page">
      <section className="panel card card-center">
        <h1 className="h2">Requests</h1>
        <p className="lead" style={{ maxWidth: 720 }}>
          Local “mini admin” view. Requests (and photos) are stored on this device for now.
        </p>

        <div className="row">
          <span className="badge">Total: {requests.length}</span>
          <button className="btn btn-ghost" onClick={exportJSON} disabled={requests.length === 0}>
            Copy JSON
          </button>
          <button className="btn" onClick={clearAll} disabled={requests.length === 0}>
            Clear All
          </button>
        </div>
      </section>

      {requests.length === 0 ? (
        <section className="panel card card-center">
          <h3 className="h3">No requests yet</h3>
          <p className="body" style={{ maxWidth: 520 }}>
            Submit a request from the Schedule page and it will show up here.
          </p>
        </section>
      ) : (
        <section className="stack">
          {requests.map((r, idx) => {
            const status = r.status ?? "new";
            const created = new Date(r.createdAt).toLocaleString();
            const appt = r.appointmentStart ? new Date(r.appointmentStart).toLocaleString() : "(none)";
            const photoCount = r.photos?.length ?? 0;

            return (
              <article
                key={idx}
                className="panel card"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedIndex(idx)}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div className="h3">{r.customer?.name || "(no name)"}</div>
                    <div className="muted" style={{ fontWeight: 900, fontSize: 13 }}>
                      Created: {created}
                    </div>
                    <div className="muted" style={{ fontWeight: 900, fontSize: 13 }}>
                      Appointment: {appt}
                    </div>
                  </div>

                  <div className="row">
                    <span className="badge">Status: {status}</span>
                    <span className="badge">Items: {r.items?.length ?? 0}</span>
                    <span className="badge">Photos: {photoCount}</span>
                  </div>
                </div>

                <div className="row" style={{ marginTop: 10, justifyContent: "center" }}>
                  <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setStatus(idx, "new"); }}>
                    New
                  </button>
                  <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setStatus(idx, "confirmed"); }}>
                    Confirmed
                  </button>
                  <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setStatus(idx, "completed"); }}>
                    Completed
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.6)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 999,
          }}
        >
          <div
            className="panel card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 920 }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="h3">{selected.customer?.name || "(no name)"}</div>
                <div className="muted" style={{ fontWeight: 900, fontSize: 13 }}>
                  {selected.customer?.phone || "(no phone)"} • {selected.customer?.address || "(no address)"}
                </div>
              </div>

              <button className="btn" onClick={() => setSelectedIndex(null)}>
                Close
              </button>
            </div>

            <div className="stack" style={{ marginTop: 12 }}>
              <div className="badge" style={{ justifyContent: "center" }}>
                Appointment: {selected.appointmentStart ? new Date(selected.appointmentStart).toLocaleString() : "(none)"}
              </div>

              <div>
                <div className="label">General Notes</div>
                <div className="body">{selected.customer?.notes || "(none)"}</div>
              </div>

              {/* Photos */}
              <div>
                <div className="label">Photos</div>
                {(!selected.photos || selected.photos.length === 0) ? (
                  <div className="body">(none)</div>
                ) : (
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {selected.photos.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="panel"
                        style={{ padding: 10, borderRadius: 12 }}
                        title="Open full image"
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: 130,
                            objectFit: "cover",
                            borderRadius: 10,
                            border: "1px solid rgba(15,23,42,0.15)",
                          }}
                        />
                        <div className="muted" style={{ fontSize: 11, fontWeight: 900, marginTop: 6, wordBreak: "break-word" }}>
                          {p.name}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="label">Items</div>
                <div className="stack" style={{ marginTop: 8 }}>
                  {(selected.items || []).map((it, i) => (
                    <div key={i} className="panel card" style={{ padding: 12 }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 950 }}>{serviceName(it.serviceId)}</div>
                        <span className="badge">Qty: {it.qty}</span>
                      </div>
                      {it.note ? <div className="body" style={{ marginTop: 6 }}>{it.note}</div> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="label">Raw</div>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12 }}>
{JSON.stringify(selected, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
