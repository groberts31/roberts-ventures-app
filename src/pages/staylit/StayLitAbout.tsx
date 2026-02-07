
export default function StayLitAbout() {
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
          <h1 className="h2" style={{ margin: 0, color: "#f8fafc" }}>About Stay Lit</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 900, color: "#cbd5f5" }}>
            Urban energy + smooth atmosphere. Hand-poured candles designed for vibe, focus, and relaxation.
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
          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950, color: "#f8fafc" }}>Our promise</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850, color: "#c7d2fe", lineHeight: 1.6 }}>
              Clean burn, premium wax, and a solid scent throw. We keep it simple: quality materials and consistent pours.
            </div>
          </div>

          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950, color: "#f8fafc" }}>Create your own</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850, color: "#c7d2fe", lineHeight: 1.6 }}>
              Choose your scent, jar, and wick — and you’ll see pricing as you build. Great for gifts and brand scents.
            </div>
          </div>

          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950, color: "#f8fafc" }}>Bulk / events</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850, color: "#c7d2fe", lineHeight: 1.6 }}>
              We can support bulk orders for weddings, events, corporate gifts, and custom label concepts (later upgrade).
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
