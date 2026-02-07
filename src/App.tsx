import useThemeMode from "./hooks/useThemeMode";
import SubNavbar from "./components/SubNavbar";


import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Schedule from "./pages/Schedule";
import StayLit from "./pages/StayLit";
import Contact from "./pages/Contact";
import Requests from "./pages/Requests";
import ServiceDetail from "./pages/ServiceDetail";

import Policies from "./pages/Policies";
import ServiceArea from "./pages/ServiceArea";
import FAQ from "./pages/FAQ";
import Reviews from "./pages/Reviews";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";

import CustomerPortal from "./pages/CustomerPortal";
import CustomerRequestDetail from "./pages/CustomerRequestDetail";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGuard from "./components/admin/AdminGuard";

import RequestConfirmed from "./pages/RequestConfirmed";

import bg from "./assets/handyman-bg.png";
import staylitBg from "./assets/staylit-bg.png";
import ToastHost from "./components/ToastHost";

export default function App() {
  const location = useLocation();
  const isStayLit = location.pathname.startsWith("/staylit");
  useThemeMode(isStayLit);


  return (
    <div
      style={{
        minHeight: "100vh",

        // Dark neon-friendly overlay so text stays readable over ANY background image
        backgroundImage: `
          linear-gradient(
            rgba(2,6,23,0.86),
            rgba(2,6,23,0.82)
          ),
          radial-gradient(
            circle at 20% 10%,
            rgba(59,130,246,0.18),
            rgba(0,0,0,0) 55%
          ),
          radial-gradient(
            circle at 80% 15%,
            rgba(168,85,247,0.14),
            rgba(0,0,0,0) 60%
          ),
          url(${isStayLit ? staylitBg : bg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",

        // Global readable text tone (prevents “washed out” text on image backgrounds)
        color: "#e5e7eb",
      }}
    >
      <Navbar />
      <SubNavbar />

      <ScrollToTop />

      <main
        key={location.pathname}
        className="page-enter"
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
          <Route path="/staylit/*" element={<StayLit />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/service-area" element={<ServiceArea />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/requests" element={<Requests />} />

          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/customer/requests/:id" element={<CustomerRequestDetail />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />

          {/* IMPORTANT: keep this ABOVE the catch-all 404 route */}
          <Route path="/request-confirmed/:id" element={<RequestConfirmed />} />

          <Route
            path="*"
            element={
              <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
                <h1 style={{ fontWeight: 950, margin: 0 }}>Page not found (404)</h1>
                <p style={{ marginTop: 10, fontWeight: 800, opacity: 0.9 }}>
                  If you expected Admin to load, this can mean the route is missing or the app is not wrapped in
                  BrowserRouter.
                </p>
                <p style={{ marginTop: 10, fontWeight: 900 }}>
                  Try: <code>/admin/login</code> then <code>/admin</code>
                </p>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
      <ToastHost />
    </div>
  );
}
