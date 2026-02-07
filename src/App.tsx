import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Schedule from "./pages/Schedule";
import StayLit from "./pages/StayLit";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <>
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
        </Routes>
      </main>
    </>
  );
}
