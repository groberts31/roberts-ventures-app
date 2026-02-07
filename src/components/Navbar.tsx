import { NavLink } from "react-router-dom";
import { useCart } from "../data/requestCart";
import React from "react";
import rvLogo from "../assets/roberts-ventures-logo.png";
import { getActiveTheme, toggleTheme } from "../lib/theme";

const baseLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 850,
  fontSize: 14,
  transition: "all .2s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export default function Navbar() {
  const cart = useCart();
  const [theme, setTheme] = React.useState(getActiveTheme());

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        background: "linear-gradient(90deg, rgba(10,10,15,.78), rgba(6,10,22,.82))",
        borderBottom: "1px solid rgba(148,163,184,.15)",
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
        <div style={{ lineHeight: 1.15, display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={rvLogo}
            alt="Roberts Ventures LLC"
            style={{
              width: 30,
              height: 30,
              objectFit: "contain",
              filter: "drop-shadow(0 0 14px rgba(56,189,248,.22))",
            }}
          />

          <div style={{ display: "grid" }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 950,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                background: "linear-gradient(90deg,#38bdf8,#a78bfa,#f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 16px rgba(56,189,248,.25))",
              }}
            >
              Roberts Ventures LLC
            </div>

            <div style={{ fontSize: 11, color: "rgba(248,250,252,.62)", fontWeight: 800 }}>
              Services • Stay Lit Candle Co.
            </div>
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
          <NavLink to="/" end style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Home
          </NavLink>

          <NavLink to="/services" style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Services
          </NavLink>

          <NavLink to="/schedule" style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Schedule
          </NavLink>

          <NavLink to="/staylit" style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            <span className="slFlameNav">🔥</span>
            <span>Stay Lit</span>
          </NavLink>

          <NavLink to="/contact" style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Contact
          </NavLink>

          <NavLink to="/customer" style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Customer Portal
          </NavLink>

          <NavLink to="/admin" style={baseLinkStyle} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Admin
          </NavLink>
        </nav>

        
        {/* Theme toggle */}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setTheme(toggleTheme())}
          aria-label="Toggle dark/light theme"
          title="Toggle theme"
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(148,163,184,0.18)",
            color: "rgba(248,250,252,.92)",
            boxShadow: "0 0 18px rgba(56,189,248,.10)",
          }}
        >
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>

{/* Cart */}
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            background: "linear-gradient(90deg, rgba(56,189,248,.12), rgba(167,139,250,.12))",
            color: "rgba(248,250,252,.92)",
            border: "1px solid rgba(56,189,248,.28)",
            boxShadow: "0 0 18px rgba(56,189,248,.15)",
          }}
        >
          Cart: {cart.count}
        </div>
      </div>
    </header>
  );
}
