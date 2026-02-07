import { NavLink } from "react-router-dom";

const subLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
  color: "var(--card-subtext)",
  background: isActive ? "rgba(14,165,233,0.12)" : "transparent",
  transition: "all .2s ease",
});

export default function SubNavbar() {
  return (
    <div
      className="staylit-subnav"
      style={{
        width: "100%",
        borderBottom: "1px solid rgba(148,163,184,0.15)",
        backdropFilter: "blur(12px)",
        background: "rgba(2,6,23,0.55)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "6px 16px",
          display: "flex",
          gap: 6,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <NavLink to="/about" style={subLinkStyle}>About</NavLink>
        <NavLink to="/portfolio" style={subLinkStyle}>Portfolio</NavLink>
        <NavLink to="/reviews" style={subLinkStyle}>Reviews</NavLink>
        <NavLink to="/faq" style={subLinkStyle}>FAQ</NavLink>
        <NavLink to="/service-area" style={subLinkStyle}>Service Area</NavLink>
        <NavLink to="/policies" style={subLinkStyle}>Policies</NavLink>
      </div>
    </div>
  );
}
