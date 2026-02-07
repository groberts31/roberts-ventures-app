import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 8,
  fontWeight: 600,
  color: isActive ? "black" : "#444",
  background: isActive ? "#eee" : "transparent",
});

export default function Navbar() {
  return (
    <header style={{ borderBottom: "1px solid #ddd" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        gap: 16
      }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Roberts Ventures LLC</span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Services + Stay Lit Candle Co.</span>
        </div>

        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/services" style={linkStyle}>Services</NavLink>
          <NavLink to="/schedule" style={linkStyle}>Schedule</NavLink>
          <NavLink to="/staylit" style={linkStyle}>Stay Lit</NavLink>
          <NavLink to="/contact" style={linkStyle}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
