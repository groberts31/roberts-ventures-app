
export default function FAQ() {
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
          <h1 className="h2" style={{ margin: 0 }}>FAQ</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 920 }}>
            Quick answers to common questions about pricing, scheduling, and what to expect.
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
            ["Do you provide quotes?", "Yes - some services are quote-based depending on scope, materials, and access."],
            ["How does scheduling work?", "Add services and notes, choose a time slot, and submit. We will confirm details."],
            ["Do I need to provide materials?", "For some woodworking projects you can, but we can also source materials."],
            ["What areas do you serve?", "See our Service Area page. We can also travel further for larger projects."],
          ].map(([q, a], idx) => (
            <div key={idx} className="panel" style={{ padding: 14, borderRadius: 14 }}>
              <div style={{ fontWeight: 950 }}>{q}</div>
              <div className="muted" style={{ marginTop: 8, fontWeight: 850, lineHeight: 1.6 }}>
                {a}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
