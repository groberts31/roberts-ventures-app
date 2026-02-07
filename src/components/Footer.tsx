import { NavLink } from "react-router-dom";
import rvLogo from "../assets/roberts-ventures-logo.png";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  fontWeight: 900,
  color: isActive ? "#ffffff" : "#cbd5e1",
  opacity: isActive ? 1 : 0.95,
});

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 28,
        padding: "22px 16px",
        borderTop: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(2,6,23,0.42)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <img
                src={rvLogo}
                alt="Roberts Ventures LLC"
                style={{
                  width: 22,
                  height: 22,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 12px rgba(56,189,248,.18))",
                }}
              />
              <div style={{ fontWeight: 950, letterSpacing: "0.06em", color: "#e2e8f0" }}>
                Roberts Ventures LLC
              </div>
            </div>

            <div className="muted" style={{ fontWeight: 850 }}>
              Home Services • Woodworking • Outdoor • Project Consultation
            </div>
          </div>

          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            <NavLink to="/about" style={linkStyle}>About</NavLink>
            <NavLink to="/portfolio" style={linkStyle}>Portfolio</NavLink>
            <NavLink to="/reviews" style={linkStyle}>Reviews</NavLink>
            <NavLink to="/faq" style={linkStyle}>FAQ</NavLink>
            <NavLink to="/service-area" style={linkStyle}>Service Area</NavLink>
            <NavLink to="/policies" style={linkStyle}>Policies</NavLink>
          </div>
        </div>

        <div
          className="panel"
          style={{
            padding: 14,
            borderRadius: 16,
            display: "grid",
            gap: 10,
            background: "rgba(15,23,42,0.55)",
            border: "1px solid rgba(148,163,184,0.16)",
          }}
        >
          <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontWeight: 950, color: "#e5e7eb" }}>Stay Lit Candle Co.</div>
              <div className="muted" style={{ fontWeight: 850 }}>
                Pre-made candles • Build-your-own scent + jar + wick
              </div>
            </div>
            <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
              <NavLink to="/staylit" style={linkStyle}>Stay Lit Home</NavLink>
              <NavLink to="/staylit/about" style={linkStyle}>Stay Lit About</NavLink>
              <NavLink to="/staylit/policies" style={linkStyle}>Stay Lit Policies</NavLink>
            </div>
          </div>

          <div className="muted" style={{ fontWeight: 850 }}>
            © {new Date().getFullYear()} Roberts Ventures LLC. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
