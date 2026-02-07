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
      <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
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
