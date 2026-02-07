import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Schedule from "./pages/Schedule";
import StayLit from "./pages/StayLit";
import Contact from "./pages/Contact";
import Requests from "./pages/Requests";

import bg from "./assets/handyman-bg.png";

export default function App() {
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

      <main
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
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/staylit" element={<StayLit />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </main>
    </div>
  );
}
