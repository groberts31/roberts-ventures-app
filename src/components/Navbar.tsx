import { NavLink } from "react-router-dom";
import { useCart } from "../data/requestCart";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14,
  color: isActive ? "#0f172a" : "#475569",
  background: isActive ? "rgba(37,99,235,0.15)" : "transparent",
  transition: "all .2s ease",
});

export default function Navbar() {
  const cart = useCart();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        background:
          "linear-gradient(90deg, rgba(255,255,255,.85), rgba(248,251,255,.9))",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Brand */}
        <div style={{ lineHeight: 1.15 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: ".02em",
              background: "linear-gradient(90deg,#2563eb,#60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Roberts Ventures LLC
          </div>

          <div style={{ fontSize: 11, color: "#64748b" }}>
            Services • Stay Lit Candle Co.
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <NavLink to="/" style={linkStyle} end>
            Home
          </NavLink>
          <NavLink to="/services" style={linkStyle}>
            Services
          </NavLink>
          <NavLink to="/schedule" style={linkStyle}>
            Schedule
          </NavLink>
          <NavLink to="/staylit" style={linkStyle}>
            Stay Lit
          </NavLink>
          <NavLink to="/contact" style={linkStyle}>
            Contact
          </NavLink>
        
            <a href="/admin/login" className="btn btn-ghost" style={{ fontWeight: 900, padding: "8px 14px" }}>Admin</a></nav>

        {/* Cart */}
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            background: "rgba(37,99,235,.1)",
            color: "#1e3a8a",
            border: "1px solid rgba(37,99,235,.25)",
          }}
        >
          Cart: {cart.count}
        </div>
      </div>
    </header>
  );
}
