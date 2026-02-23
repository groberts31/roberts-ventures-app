import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import rvLogo from "../assets/roberts-ventures-logo.png";

import { useCart } from "../data/requestCart";
import { getActiveTheme, toggleTheme } from "../lib/theme";
import { useNavVisibility } from "../config/navVisibility";

const NAV_WHITE = "rgba(248,250,252,0.92)";

const linkStyleBase: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 850,
  fontSize: 14,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 34,
  minHeight: 34,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  color: NAV_WHITE,
};

const linkStyleActive: React.CSSProperties = {
  background: "rgba(99,102,241,0.18)",
  border: "1px solid rgba(99,102,241,0.25)",
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
        padding: "0 10px",
        height: 18,
        minHeight: 18,
        lineHeight: "18px",
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
  const navigate = useNavigate();
  const cart = useCart();
  const navVis = useNavVisibility();

  const count = cart.count;

  const [theme, setTheme] = useState(getActiveTheme());
  const onToggleTheme = () => {
    toggleTheme();
    setTheme(getActiveTheme());
  };

  // (Optional) keep these refs if you later re-enable the cart dropdown
  const [cartOpen, setCartOpen] = useState(false);
  const cartBtnRef = useRef<any>(null);
  const cartPopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const handler = (e: any) => {
      if (cartPopRef.current?.contains(e.target)) return;
      if (cartBtnRef.current?.contains?.(e.target)) return;
      setCartOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cartOpen]);

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
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          aria-label="Go to Home"
        >
          <img src={rvLogo} alt="Roberts Ventures LLC" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <div style={{ fontWeight: 950, color: "#fff" }}>Roberts Ventures LLC</div>
        </button>

        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }} aria-label="Primary">
          {navVis.main.home && (
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
              })}
            >
              Home
            </NavLink>
          )}

          {navVis.main.services && (
            <NavLink
              to="/services"
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
              })}
            >
              Services
            </NavLink>
          )}

          {navVis.main.schedule && (
            <NavLink
              to="/schedule"
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
              })}
            >
              Schedule
            </NavLink>
          )}

          {navVis.main.cart && (
            <NavLink
              to="/schedule"
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
                gap: 6,
              })}
              aria-label={`Cart (${count})`}
              title="View request cart"
            >
              <span aria-hidden="true">🛒</span>
              <Pill>{count}</Pill>
            </NavLink>
          )}

          {navVis.main.staylit && (
            <NavLink
              to="/staylit"
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
              })}
            >
              Stay Lit
            </NavLink>
          )}

          {navVis.main.profile && (
            <NavLink
              to="/customer"
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
              })}
            >
              Profile
            </NavLink>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              ...linkStyleBase,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontWeight: 950,
            }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            Theme: {theme === "dark" ? "Dark" : "Light"}
          </button>
        </nav>
      </div>
    </header>
  );
}
