import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SERVICES, type Service } from "../data/services";
import { useCart } from "../data/requestCart";

function formatPrice(s: Service) {
  if (s.priceType === "quote") return "Quote required";

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(s.price ?? 0);

  if (s.priceType === "fixed") return `${money} ${s.unitLabel ? `(${s.unitLabel})` : ""}`;
  return `Starting at ${money}`;
}

type DetailPack = {
  included: string[];
  prep: string[];
  disclaimer?: string;
};

const DETAILS: Record<string, DetailPack> = {
  "tv-mount": {
    included: [
      "Mount TV to wall studs (drywall/wood studs) using your bracket",
      "Leveling + secure fastening",
      "Basic setup: TV placement + quick stability check",
      "Cleanup of packaging and work area",
    ],
    prep: [
      "Have the TV + mount bracket on-site before arrival",
      "Confirm the mounting wall is accessible (move furniture if needed)",
      "If you want cable concealment, mention it in notes (may require quote)",
    ],
    disclaimer: "Does not include in-wall electrical work. Additional materials or special surfaces may require a quote.",
  },

  "ceiling-fan": {
    included: [
      "Remove existing fan/light fixture (standard ceiling height)",
      "Install new ceiling fan using existing wiring box (when suitable)",
      "Basic fan function test + balancing check",
      "Cleanup of old packaging and work area",
    ],
    prep: [
      "Have the new fan on-site and unboxed (optional but helps)",
      "Confirm power can be shut off at breaker during install",
      "If there is no existing fan-rated box, it may require additional parts/quote",
    ],
    disclaimer: "High ceilings, new wiring, or non-standard boxes may require a quote.",
  },

  "custom-shelves": {
    included: [
      "Consultation to confirm measurements, style, and materials",
      "Design recommendations (floating, built-in, brackets, finish options)",
      "Estimate for labor + materials",
      "Optional build + install scheduling",
    ],
    prep: [
      "Take photos of the wall/space and share measurements if possible",
      "Decide shelf use (decor, books, heavy items) so we design for load",
      "Choose finish style (paint/stain/natural)",
    ],
    disclaimer: "Final pricing depends on size, materials, wall type, and finish requirements.",
  },

  "deck-repair": {
    included: [
      "Inspection of deck boards, fasteners, and structural safety",
      "Replace damaged boards (when materials are available/approved)",
      "Tighten/secure loose components (rails/steps where applicable)",
      "Basic cleanup of work area",
    ],
    prep: [
      "Clear deck surface (furniture, grills, planters) before arrival",
      "If you have matching boards/stain, note it (otherwise we can quote materials)",
      "Photos help if boards are rotted or structure is suspect",
    ],
    disclaimer: "Structural framing repairs and large material replacement may require a quote after inspection.",
  },

  "junk-removal": {
    included: [
      "Pickup/haul away of approved items",
      "Loading and removal from accessible areas",
      "Basic sweep/cleanup after removal (where practical)",
    ],
    prep: [
      "Group items together if possible (garage/driveway speeds up)",
      "Tell us if there are stairs, tight hallways, or heavy items",
      "Certain items may have disposal restrictions (paint, chemicals, etc.)",
    ],
    disclaimer: "Pricing may change based on volume, weight, and disposal requirements.",
  },

  "project-consult": {
    included: [
      "Walkthrough of your project goals and constraints",
      "Recommendations on materials, approach, timeline, and budget range",
      "Risk flags and what to prioritize first",
      "Written next-step summary (optional add-on later)",
    ],
    prep: [
      "Bring photos, inspiration links, or sketches if you have them",
      "List your must-haves vs nice-to-haves",
      "Have measurements ready if you want a faster estimate",
    ],
    disclaimer: "This consultation is for planning and scoping; final pricing may require an on-site review depending on complexity.",
  },
};

function getDetails(serviceId: string): DetailPack {
  return (
    DETAILS[serviceId] ?? {
      included: [
        "Professional workmanship and clean finish",
        "Basic setup and cleanup included",
        "Clear communication on next steps",
      ],
      prep: [
        "Provide photos if the job is quote-required",
        "Ensure the work area is accessible",
      ],
      disclaimer: "Some jobs may require a quote depending on conditions and materials.",
    }
  );
}

export default function ServiceDetail() {
  const { id } = useParams();
  const cart = useCart();

  const service = useMemo(() => SERVICES.find((s) => s.id === id), [id]);

  if (!service) {
    return (
      <div className="stack page">
        <section className="panel card card-center">
          <h1 className="h2">Service not found</h1>
          <p className="lead">That service doesn’t exist in your catalog.</p>
          <Link to="/services" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Back to Services
          </Link>
        </section>
      </div>
    );
  }

  const svc = service;
  const details = getDetails(svc.id);

  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  function add() {
    cart.add(svc);
    cart.setQty(svc.id, qty);
    cart.setNote(svc.id, note);
    alert("Added to request.");
  }

  return (
    <div className="stack page">
      <section
        className="panel card"
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(2,6,23,0.16)",
            boxShadow: "0 16px 40px rgba(29,78,216,0.16)",
            background: "rgba(255,255,255,0.85)",
          }}
        >
          {svc.image ? (
            <img
              src={svc.image}
              alt={svc.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div className="muted" style={{ fontWeight: 950 }}>
            {svc.category}
          </div>

          <h1 className="h2" style={{ margin: 0 }}>
            {svc.name}
          </h1>

          <div className="badge" style={{ width: "fit-content" }}>
            {formatPrice(svc)}
          </div>

          <p className="lead" style={{ maxWidth: 760 }}>
            {svc.shortDesc}
          </p>

          <div className="row">
            <Link to="/services" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              ← Back
            </Link>
            <Link to="/schedule" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Go to Schedule →
            </Link>
          </div>
        </div>
      </section>

      <section className="panel card">
        <div className="h3">What’s included</div>
        <ul style={{ marginTop: 10, paddingLeft: 18 }}>
          {details.included.map((b) => (
            <li key={b} className="body" style={{ marginBottom: 6 }}>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel card">
        <div className="h3">How to prepare</div>
        <ul style={{ marginTop: 10, paddingLeft: 18 }}>
          {details.prep.map((b) => (
            <li key={b} className="body" style={{ marginBottom: 6 }}>
              {b}
            </li>
          ))}
        </ul>

        {details.disclaimer ? (
          <div className="badge" style={{ marginTop: 12, justifyContent: "center" }}>
            {details.disclaimer}
          </div>
        ) : null}
      </section>

      <section className="panel card">
        <div className="h3">Add to Request</div>

        <div className="row" style={{ marginTop: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="label">Quantity</span>
            <input
              className="field"
              type="number"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ width: 150 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 240 }}>
            <span className="label">Notes (optional)</span>
            <input
              className="field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Example: "2nd floor, bracket already assembled"'
            />
          </label>

          <button className="btn btn-primary" onClick={add}>
            Add
          </button>

          {cart.has(svc.id) && <span className="badge">In cart ✓</span>}
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          section.panel.card:first-of-type {
            grid-template-columns: 1fr !important;
          }
          section.panel.card:first-of-type > div:first-child {
            width: 100% !important;
            height: 240px !important;
          }
        }
      `}</style>
    </div>
  );
}
