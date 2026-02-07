import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="stack page page-enter" style={{ gap: 18 }}>
      {/* HERO / SPLASH */}
      <section
        className="panel card"
        style={{
          padding: 22,
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle futuristic accent */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -80,
            background:
              "radial-gradient(circle at 20% 10%, rgba(29,78,216,0.18), transparent 40%), radial-gradient(circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), radial-gradient(circle at 50% 110%, rgba(245,158,11,0.12), transparent 55%)",
            filter: "blur(2px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", display: "grid", gap: 14, justifyItems: "center", textAlign: "center" }}>
          <div className="badge" style={{ width: "fit-content" }}>
            Roberts Ventures LLC
          </div>

          <h1
            className="h1"
            style={{
              margin: 0,
              fontWeight: 950,
              letterSpacing: -0.6,
              lineHeight: 1.05,
              color: "#0f172a",
            }}
          >
            Modern home services,
            <br />
            woodworking & projects — done right.
          </h1>

          <p
            className="lead"
            style={{
              margin: 0,
              maxWidth: 860,
              fontWeight: 800,
              color: "#0f172a",
              opacity: 0.82,
              lineHeight: 1.35,
            }}
          >
            Pick a service, customize with add-ons, and send a request in minutes.
            From TV mounting and ceiling fans to custom shelving, deck repair, and haul-away.
          </p>

          {/* CTA buttons */}
          <div
            className="row"
            style={{
              gap: 10,
              flexWrap: "wrap",
              marginTop: 4,
              alignItems: "center",
            }}
          >
            <Link
              to="/services"
              className="btn btn-primary"
              style={{
                padding: "10px 16px",
                fontWeight: 950,
                boxShadow: "0 10px 26px rgba(29,78,216,0.22)",
              }}
            >
              Browse Services →
            </Link>

            <Link
              to="/schedule"
              className="btn btn-ghost"
              style={{
                padding: "10px 16px",
                fontWeight: 950,
              }}
            >
              Schedule / Request
            </Link>

            <Link
              to="/staylit"
              className="btn btn-ghost"
              style={{
                padding: "10px 16px",
                fontWeight: 950,
              }}
            >
              Stay Lit Candle Co. ✨
            </Link>
          </div>

          {/* Quick trust/feature cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 10,
              marginTop: 10,
            }}
          >
            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Clear pricing</div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Prices shown when fixed/starting — quotes when needed.
              </div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Fast scheduling</div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Select services + add-ons and send your request quickly.
              </div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Quality work</div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Clean finish, professional approach, and communication.
              </div>
            </div>

            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Stay Lit inside</div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Candle business lives inside the Roberts Ventures site.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO-PANEL SPLASH: Services vs Stay Lit */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
        }}
      >
        {/* Left: Roberts Ventures */}
        <div className="panel card" style={{ padding: 18, borderRadius: 18 }}>
          <div className="badge" style={{ width: "fit-content" }}>
            Home Services • Outdoor • Woodworking
          </div>

          <h2 className="h2" style={{ marginTop: 10, marginBottom: 8, fontWeight: 950 }}>
            Book your next project
          </h2>

          <p className="body" style={{ margin: 0, fontWeight: 800, opacity: 0.82, maxWidth: 700 }}>
            <span className="sub-accent">Browse the catalog, pick add-ons (like cable concealment or haul-away),</span>
            and send details so we can confirm and schedule.
          </p>

          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/services" className="btn btn-primary" style={{ fontWeight: 950 }}>
              View Catalog
            </Link>
            <Link to="/schedule" className="btn btn-ghost" style={{ fontWeight: 950 }}>
              Go to Schedule
            </Link>
            <Link to="/contact" className="btn btn-ghost" style={{ fontWeight: 950 }}>
              Contact
            </Link>
          </div>
        </div>

        {/* Right: Stay Lit */}
        <div className="panel card" style={{ padding: 18, borderRadius: 18 }}>
          <div className="badge" style={{ width: "fit-content" }}>
            Stay Lit Candle Co.
          </div>

          <h2 className="h2" style={{ marginTop: 10, marginBottom: 8, fontWeight: 950 }}>
            Candles with a vibe
          </h2>

          <p className="body" style={{ margin: 0, fontWeight: 800, opacity: 0.82, maxWidth: 700 }}>
            A dedicated area inside the Roberts Ventures app — perfect for future product
            listings, bundles, and ordering.
          </p>

          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/staylit" className="btn btn-primary" style={{ fontWeight: 950 }}>
              Enter Stay Lit
            </Link>
            <Link to="/services" className="btn btn-ghost" style={{ fontWeight: 950 }}>
              Back to Services
            </Link>
          </div>

          <div className="panel" style={{ marginTop: 14, padding: 12, borderRadius: 14 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Coming soon</div>
            <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
              Product grid, scent filters, bundles, gift notes, and checkout.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
