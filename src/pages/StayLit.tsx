import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import StayLitSplash from "./staylit/StayLitSplash";
import StayLitShop from "./staylit/StayLitShop";
import StayLitCreate from "./staylit/StayLitCreate";
import StayLitAbout from "./staylit/StayLitAbout";
import StayLitPolicies from "./staylit/StayLitPolicies";

export default function StayLit() {
  const location = useLocation();

  // Normalize trailing slash
  const path = location.pathname.replace(/\/+$/, "");
  const isSplash = path === "/staylit";

  // When you're on the splash route only, we center the entire splash content
  // both vertically and horizontally. For other Stay Lit routes, we let pages scroll normally.
  const wrapperStyle: React.CSSProperties = isSplash
    ? {
        minHeight: "calc(100vh - 80px)", // adjust if your navbar height differs
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }
    : {
        minHeight: "calc(100vh - 80px)",
        padding: "24px 16px",
      };

  const innerStyle: React.CSSProperties = isSplash
    ? {
        width: "100%",
        maxWidth: 1100,
      }
    : {
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
      };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        <Routes>
          <Route path="/" element={<StayLitSplash />} />
          <Route path="/shop" element={<StayLitShop />} />
          <Route path="/create" element={<StayLitCreate />} />
          <Route path="/about" element={<StayLitAbout />} />
          <Route path="/policies" element={<StayLitPolicies />} />
          <Route path="*" element={<Navigate to="/staylit" replace />} />
        </Routes>
      </div>
    </div>
  );
}
