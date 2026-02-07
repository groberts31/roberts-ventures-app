
export default function Policies() {
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
          <h1 className="h2" style={{ margin: 0 }}>Policies</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 920 }}>
            Clear expectations: cancellations, deposits, materials, and safety.
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
          {[
            ["Scheduling & Arrival", "Arrival windows may vary based on job length and traffic. We confirm before arrival."],
            ["Cancellations", "If you need to reschedule, please do so as early as possible so we can offer that slot to someone else."],
            ["Quotes & Materials", "Quote items depend on measurements, material choice, access, and project scope."],
            ["Safety & Work Area", "Please keep pets secured and the work area accessible for faster completion."],
          ].map(([h, d], idx) => (
            <div key={idx} className="panel" style={{ padding: 14, borderRadius: 14 }}>
              <div style={{ fontWeight: 950 }}>{h}</div>
              <div className="muted" style={{ marginTop: 8, fontWeight: 850, lineHeight: 1.6 }}>
                {d}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
