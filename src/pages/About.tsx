
export default function About() {
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
          <h1 className="h2" style={{ margin: 0 }}>About</h1>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 920 }}>
            Built on craftsmanship, clear communication, and clean results - from installs and repairs to custom woodworking.
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
          <div className="row" style={{ gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div className="panel" style={{ padding: 14, borderRadius: 14, flex: "1 1 320px" }}>
              <div style={{ fontWeight: 950 }}>What we do</div>
              <div className="muted" style={{ marginTop: 8, fontWeight: 850, lineHeight: 1.6 }}>
                Roberts Ventures LLC provides home services, outdoor fixes, and custom woodworking.
                We focus on professional planning, careful installs, and clean finishes.
              </div>
            </div>

            <div className="panel" style={{ padding: 14, borderRadius: 14, flex: "1 1 320px" }}>
              <div style={{ fontWeight: 950 }}>How we work</div>
              <div className="muted" style={{ marginTop: 8, fontWeight: 850, lineHeight: 1.6 }}>
                You pick services, add notes/photos, and request a time.
                We confirm details, arrive prepared, and communicate clearly before/during/after.
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 950 }}>Why customers choose us</div>
            <ul style={{ marginTop: 10, fontWeight: 850, lineHeight: 1.7 }}>
              <li>Upfront pricing on common services (quotes when needed)</li>
              <li>Clean work area + attention to detail</li>
              <li>Respect for your home and schedule</li>
              <li>Photo-friendly quoting to speed things up</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
