
export default function StayLitPolicies() {
  return (
    <div className="stack page" style={{ gap: 18 }}>
      <section
        className="panel card"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: 22,
          textAlign: "center",
          background: "rgba(10,10,15,0.78)",
          border: "1px solid rgba(148,163,184,0.15)",
          boxShadow: "0 0 24px rgba(59,130,246,0.25)",
        }}
      >
        <div className="card-center" style={{ gap: 10 }}>
          <div className="badge" style={{ width: "fit-content" }}>Stay Lit Candle Co.</div>
          <h1 className="h2" style={{ margin: 0, color: "#f8fafc" }}>Policies</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 900, color: "#cbd5f5" }}>
            Shipping, returns, and custom order expectations.
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
          background: "rgba(15,23,42,0.70)",
          border: "1px solid rgba(148,163,184,0.15)",
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          {[
            ["Processing time", "Pre-made candles typically ship quickly. Custom builds may take longer depending on volume."],
            ["Returns", "If an item arrives damaged, contact us with photos and we’ll make it right."],
            ["Custom items", "Custom candles are made to order. Scent/jar/wick selections should be reviewed carefully."],
            ["Safety", "Never leave a candle unattended. Keep away from children/pets and flammable materials."],
          ].map(([h, d], idx) => (
            <div key={idx} className="panel" style={{ padding: 14, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "#f8fafc" }}>{h}</div>
              <div className="muted" style={{ marginTop: 8, fontWeight: 850, color: "#c7d2fe", lineHeight: 1.6 }}>
                {d}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
