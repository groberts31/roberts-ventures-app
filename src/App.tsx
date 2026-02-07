import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Schedule from "./pages/Schedule";
import StayLit from "./pages/StayLit";
import Contact from "./pages/Contact";
import Requests from "./pages/Requests";
import ServiceDetail from "./pages/ServiceDetail";

import bg from "./assets/handyman-bg.png";
import ToastHost from "./components/ToastHost";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGuard from "./components/admin/AdminGuard";
import RequestConfirmed from "./pages/RequestConfirmed";

export default function App() {
  const location = useLocation();
return (
    <div
      style={{
        minHeight: "100vh",

        /* Reduced overlay = more visible background */
        backgroundImage: `
          linear-gradient(
            rgba(255,255,255,0.75),
            rgba(255,255,255,0.82)
          ),
          url(${bg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />

      <main key={location.pathname} className="page-enter"
        style={{
          padding: "24px 16px",
          maxWidth: 1200,
          margin: "0 auto",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/staylit" element={<StayLit />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/requests" element={<Requests />} />
        
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
                  <Route
            path="*"
            element={
              <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
                <h1 style={{ fontWeight: 950, margin: 0 }}>Page not found (404)</h1>
                <p style={{ marginTop: 10, fontWeight: 800, opacity: 0.8 }}>
                  If you expected Admin to load, this usually means the route is missing or the app is not wrapped in BrowserRouter.
                </p>
                <p style={{ marginTop: 10, fontWeight: 900 }}>
                  Try: <code>/admin/login</code> then <code>/admin</code>
                </p>
              </div>
            }
          />
                  <Route path="/request-confirmed/:id" element={<RequestConfirmed />} />
        </Routes>
      </main>
      <ToastHost />

    </div>
  );
}