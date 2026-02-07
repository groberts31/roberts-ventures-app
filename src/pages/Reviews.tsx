
export default function Reviews() {
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
          <h1 className="h2" style={{ margin: 0 }}>Reviews</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 920 }}>
            Showcase customer feedback and trust signals. We will swap these placeholders with real reviews.
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
            { name: "Customer A", text: "Fast, professional, and the install looks perfect." },
            { name: "Customer B", text: "Great communication and clean work area after the job." },
            { name: "Customer C", text: "Very fair pricing and the shelves turned out amazing." },
          ].map((r, idx) => (
            <div key={idx} className="panel" style={{ padding: 14, borderRadius: 14 }}>
              <div style={{ fontWeight: 950 }}>{r.name}</div>
              <div className="muted" style={{ marginTop: 8, fontWeight: 850, lineHeight: 1.6 }}>
                {r.text}
              </div>
            </div>
          ))}

          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950 }}>Want to leave a review?</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850 }}>
              We can add your Google Review / Facebook link here later.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
