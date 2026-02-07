export default function Contact() {
  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card" style={{ maxWidth: 980, margin: "0 auto", width: "100%" }}>
        <div className="card-center" style={{ gap: 12 }}>
          <h1 className="h2" style={{ margin: 0 }}>Contact</h1>
          <div className="muted" style={{ fontWeight: 850, textAlign: "center", maxWidth: 780 }}>
            Reach out for scheduling, questions, or to request a quote. For fastest service, include photos and a quick description.
          </div>
        </div>

        {/* Contact Info Panel */}
        <div
          className="panel"
          style={{
            marginTop: 16,
            marginBottom: 16,
            padding: 16,
            borderRadius: 16,
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.18)",
            boxShadow: "0 0 20px rgba(59,130,246,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontWeight: 950,
              fontSize: 18,
              marginBottom: 10,
              color: "#e2e8f0",
            }}
          >
            ℹ️ Contact Information
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
              fontWeight: 850,
              color: "rgba(226,232,240,0.9)",
              justifyItems: "center",
            }}
          >
            <div>📍 <b>Service Area:</b> Local &amp; Surrounding Cities</div>
            <div>⏱ <b>Hours:</b> Mon–Sat · 8:00 AM – 6:00 PM</div>
            <div>📞 <b>Phone/Text:</b> (555) 123-4567</div>
            <div>📧 <b>Email:</b> support@robertsventures.com</div>
            <div>⚡ <b>Response Time:</b> Within 24 Hours</div>
            <div>📅 <b>Booking:</b> Appointments Required</div>
          </div>

          <div className="muted" style={{ fontWeight: 850, marginTop: 12 }}>
            Tip: For quotes, include measurements, photos, and your preferred timeframe.
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <a className="btn btn-primary" href="/schedule">Schedule a Service</a>
          <a className="btn btn-ghost" href="/services">View Services</a>
          <a className="btn btn-ghost" href="/customer">Customer Portal</a>
        </div>
      </section>
    </div>
  );
}
