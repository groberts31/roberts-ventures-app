
export default function Portfolio() {
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
          <h1 className="h2" style={{ margin: 0 }}>Portfolio</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 920 }}>
            A place to show before/after photos and project highlights. We will plug your real images in next.
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
        <div style={{ display: "grid", gap: 14 }}>
          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950 }}>Featured projects</div>
            <div className="muted" style={{ marginTop: 8, fontWeight: 850 }}>
              Add project cards here: TV mounts, shelving, deck repairs, cleanouts, and custom builds.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel" style={{ padding: 12, borderRadius: 14 }}>
                <div style={{ height: 140, borderRadius: 12, background: "rgba(2,6,23,0.06)" }} />
                <div style={{ marginTop: 10, fontWeight: 950 }}>Project Title #{i + 1}</div>
                <div className="muted" style={{ marginTop: 6, fontWeight: 850 }}>
                  Short before/after description goes here.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
