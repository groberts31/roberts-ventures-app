import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { SERVICES } from "../data/services";
import { ADD_ONS } from "../data/addOns";
import rvLogo from "../assets/roberts-ventures-logo.png";

import { useCart } from "../data/requestCart";
import { getActiveTheme, toggleTheme } from "../lib/theme";

const NAV_WHITE = "rgba(248,250,252,0.92)";

const linkStyleBase: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 850,
  fontSize: 14,
  transition: "all .18s ease",
  display: "inline-flex",
  flexWrap: "nowrap",
  alignItems: "center",
  gap: 8,
  lineHeight: 1,
  height: 34,
  minHeight: 34,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  color: NAV_WHITE, // always white
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

  // Catalog lookup (core services + add-ons) for cart preview naming
  const CATALOG = useMemo(() => [...SERVICES, ...ADD_ONS], []);
  const nameFor = (serviceId: string) =>
    CATALOG.find((x) => String((x as any)?.id) === String(serviceId))?.name ?? String(serviceId);

  const count = cart.count;

  const [cartOpen, setCartOpen] = useState(false);
  const cartBtnRef = useRef<any>(null);
  const cartPopRef = useRef<HTMLDivElement | null>(null);

  const previewItems = useMemo(() => {
    const items = Array.isArray(cart.items) ? cart.items : [];
    return items
      .map((it: any) => ({
        id: String(it?.serviceId || ""),
        qty: Number.isFinite(Number(it?.qty)) && Number(it?.qty) > 0 ? Number(it?.qty) : 1,
      }))
      .filter((x: any) => x.id);
  }, [cart.items]);

  useEffect(() => {
    if (!cartOpen) return;

    function onDocClick(e: any) {
      const pop = cartPopRef.current;
      const btn = cartBtnRef.current;
      const t = e?.target as any;
      if (!t) return;
      if (pop && pop.contains(t)) return;
      if (btn && btn.contains && btn.contains(t)) return;
      setCartOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true } as any);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick as any);
    };
  }, [cartOpen]);


  const [theme, setTheme] = useState(getActiveTheme());

  const onToggleTheme = () => {
    toggleTheme();
    setTheme(getActiveTheme());
  };

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
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/services"
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
            })}
          >
            Services
          </NavLink>

          <NavLink
            to="/schedule"
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
            })}
          >
            Schedule
          </NavLink>
          
          <div style={{ position: "relative" }}>
            <NavLink
              ref={cartBtnRef}
              to="/schedule"
              onMouseEnter={() => setCartOpen(true)}
              onMouseLeave={() => setCartOpen(false)}
              onFocus={() => setCartOpen(true)}
              onBlur={() => setCartOpen(false)}
              style={({ isActive }) => ({
                ...linkStyleBase,
                ...(isActive ? linkStyleActive : linkStyleInactive),
                gap: 6,
                whiteSpace: "nowrap",
              })}
              aria-label={`Cart (${count})`}
              title="View request cart"
            >
              <span
                aria-hidden="true"
                style={{
                  width: 14,
                  height: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  lineHeight: "14px",
                  overflow: "hidden",
                  flex: "0 0 auto",
                  transform: "translateY(-0.5px)",
                }}
              >
                🛒
              </span>
              <Pill>{count}</Pill>
            </NavLink>

            {cartOpen ? (
              <div
                ref={cartPopRef}
                onMouseEnter={() => setCartOpen(true)}
                onMouseLeave={() => setCartOpen(false)}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 10px)",
                  width: 320,
                  maxWidth: "85vw",
                  borderRadius: 14,
                  padding: 12,
                  background: "rgba(15,23,42,0.92)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
                  backdropFilter: "blur(10px)",
                  zIndex: 50,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 950, fontSize: 13, letterSpacing: 0.2 }}>
                    Request Cart
                  </div>
                  <div className="badge" style={{ justifyContent: "center" }}>
                    {count}
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(148,163,184,0.18)", margin: "10px 0" }} />

                {previewItems.length === 0 ? (
                  <div style={{ fontSize: 12, fontWeight: 850, opacity: 0.85, padding: "6px 2px" }}>
                    No items yet — add services to start a request.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8, maxHeight: 240, overflow: "auto", paddingRight: 2 }}>
                    {previewItems.map((it: any) => (
                      <div
                        key={nameFor(it.id)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "flex-start",
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid rgba(148,163,184,0.14)",
                          background: "rgba(2,6,23,0.35)",
                        }}
                      >
                        <div style={{ fontWeight: 900, fontSize: 12, lineHeight: 1.2 }}>
                          {nameFor(it.id)}
                        </div>
                        <div className="badge" style={{ justifyContent: "center", whiteSpace: "nowrap" }}>
                          × {it.qty}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <NavLink
                    to="/schedule"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      fontWeight: 950,
                      border: "1px solid rgba(59,130,246,0.35)",
                      background: "rgba(59,130,246,0.18)",
                      color: "#e5e7eb",
                      textDecoration: "none",
                      lineHeight: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Go to Schedule →
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => cart.clear()}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      fontWeight: 950,
                      border: "1px solid rgba(148,163,184,0.22)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#e5e7eb",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                    disabled={count === 0}
                    title={count === 0 ? "Cart is already empty" : "Remove all items"}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : null}
          </div>



          <NavLink
            to="/staylit"
            style={({ isActive }) => ({
              ...linkStyleBase,
              ...(isActive ? linkStyleActive : linkStyleInactive),
              gap: 6, // slight tighten, but does NOT change height
            })}
          >
            <span
              aria-hidden="true"
              style={{
                // Hard-box the emoji so it CANNOT increase button height.
                width: 12,
                height: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                lineHeight: "12px",
                overflow: "hidden",
                flex: "0 0 auto",
                transform: "translateY(-0.5px)", // keeps baseline aligned
              }}
            >
              🔥
            </span>
            <span>Stay Lit</span>
            
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
              color: NAV_WHITE,
              cursor: "pointer",
              lineHeight: 1,
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              minHeight: 34,
              height: 34,
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
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
