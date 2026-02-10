import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import rvLogo from "../assets/roberts-ventures-logo.png";

import { useCart } from "../data/requestCart";
import { getActiveTheme, toggleTheme } from "../lib/theme";

const linkStyleBase: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 850,
  fontSize: 14,
  transition: "all .18s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  lineHeight: 1,
};

const linkStyleActive: React.CSSProperties = {
  background: "rgba(99,102,241,0.18)",
  border: "1px solid rgba(99,102,241,0.25)",
  boxShadow: "0 10px 26px rgba(2,6,23,0.18)",
};

const linkStyleInactive: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(148,163,184,0.16)",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 950,
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.10)",
        color: "rgba(248,250,252,0.88)",
      }}
    >
      {children}
    </span>
  );
}

export default function Navbar() {
  // Shared NavLink style (kept inside Navbar() so it is always in-scope)

  const navigate = useNavigate();
  const cart = useCart();
  const count = (cart as any)?.count ?? 0;

  const [theme, setTheme] = React.useState(getActiveTheme());

  const onToggleTheme = () => {
    toggleTheme();
    // getActiveTheme reads from your theme store (html attribute/localStorage/etc.)
    setTheme(getActiveTheme());
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        background:
          "linear-gradient(90deg, rgba(10,10,15,.78), rgba(6,10,22,.82))",
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
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
          aria-label="Go to Home"
        >
          <img
            src={rvLogo}
            alt="Roberts Ventures LLC"
            style={{
              width: 32,
              height: 32,
              objectFit: "contain",
              filter: "drop-shadow(0 0 14px rgba(56,189,248,.22))",
            }}
          />
          <div style={{ display: "grid", lineHeight: 1.15 }}>
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
            <div
              style={{
                fontSize: 11,
                color: "rgba(248,250,252,.62)",
                fontWeight: 800,
              }}
            >
              Services • Stay Lit Candle Co.
            </div>
          </div>
        </button>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
          aria-label="Primary"
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
              color: "rgba(248,250,252,0.92)",
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/services"
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
              color: "rgba(248,250,252,0.92)",
            })}
          >
            Services
          </NavLink>

          <NavLink
            to="/schedule"
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
              color: "rgba(248,250,252,0.92)",
            })}
          >
            Schedule
          </NavLink>



<NavLink
  to="/staylit"
  className="nav-link staylit-navlink"
  style={({ isActive }) => ({
    ...linkStyleBase,
    ...(isActive ? linkStyleActive : linkStyleInactive),
    color: "rgba(248,250,252,0.92)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  })}
>
  <span className="staylit-flame" aria-hidden="true">🔥</span>
  <span>Stay Lit</span>
  {count > 0 ? <Pill>{count}</Pill> : null}
</NavLink>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              fontWeight: 950,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(248,250,252,0.92)",
              cursor: "pointer",
            }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            Theme: {theme === "dark" ? "Dark" : "Light"}
          </button>

<NavLink
            to="/admin/maintenance"
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
              color: "rgba(248,250,252,0.92)",
            })}
          >
            Admin
          </NavLink>

</nav>
      </div>
    </header>
  );
}
