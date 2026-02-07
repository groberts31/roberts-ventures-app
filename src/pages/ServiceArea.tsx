
export default function ServiceArea() {
  return (
    <div className="stack page" style={{ gap: 18 }}>
      <section
        className="panel card"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: 22,
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(2,6,23,0.12)",
        }}
      >
        <div className="card-center" style={{ gap: 10, textAlign: "center" }}>
          <div className="badge" style={{ width: "fit-content" }}>Roberts Ventures LLC</div>
          <h1 className="h2" style={{ margin: 0 }}>Service Area</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 920 }}>
            Where we operate - and how travel fees work (if applicable).
          </div>
        </div>
      </section>

      <section
        className="panel card"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: 18,
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(2,6,23,0.12)",
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950 }}>Primary area</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850 }}>
              Add your city/region list here. Example: Serving Charlotte + surrounding areas within 25 miles.
            </div>
          </div>

          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950 }}>Extended area</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850, lineHeight: 1.6 }}>
              For larger jobs we may travel further. If a travel fee applies, it will be shown or confirmed before booking.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
