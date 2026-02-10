import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SERVICES, type Service } from "../data/services";
import { useCart } from "../data/requestCart";
import { addOnsFor } from "../data/addOns";
import { toast } from "../lib/toast";

function formatPrice(s: Service) {
  if (s.priceType === "quote") return "Quote required";

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(s.price ?? 0);

  if (s.priceType === "fixed") return `${money} ${s.unitLabel ? `(${s.unitLabel})` : ""}`;
  return `Starting at ${money}`;
}


function buildAddedMessage(serviceName: string, addOnCount: number) {
  if (addOnCount > 0) return `${serviceName} added (+${addOnCount} add-on${addOnCount === 1 ? "" : "s"})`;
  return `${serviceName} added`;
}

type DetailPack = {
  included: string[];
  prep: string[];
  disclaimer?: string;
};

const DETAILS: Record<string, DetailPack> = {
  "tv-mount": {
    included: [
      "Mount TV to wall studs using your bracket",
      "Leveling + secure fastening",
      "Basic setup and testing",
      "Cleanup of work area",
    ],
    prep: [
      "Have TV + bracket ready",
      "Move furniture if needed",
      "Mention cable concealment in notes",
    ],
  },

  "ceiling-fan": {
    included: [
      "Remove old fixture",
      "Install new fan",
      "Balance + test",
      "Cleanup",
    ],
    prep: [
      "Have fan on-site",
      "Breaker access",
      "Confirm ceiling height",
    ],
  },

  "custom-shelves": {
    included: [
      "Measurements + planning",
      "Design consultation",
      "Material estimate",
      "Install scheduling",
    ],
    prep: [
      "Provide photos",
      "Decide shelf use",
      "Choose finish",
    ],
  },

  "deck-repair": {
    included: [
      "Deck inspection",
      "Board replacement",
      "Fastener tightening",
      "Cleanup",
    ],
    prep: [
      "Clear deck",
      "Provide stain info",
      "Send photos",
    ],
  },

  "junk-removal": {
    included: [
      "Pickup + hauling",
      "Loading",
      "Disposal",
      "Sweep-up",
    ],
    prep: [
      "Group items",
      "Note stairs",
      "Mention heavy items",
    ],
  },

  "project-consult": {
    included: [
      "Project walkthrough",
      "Material guidance",
      "Timeline advice",
      "Priority planning",
    ],
    prep: [
      "Bring inspiration",
      "Have measurements",
      "List goals",
    ],
  },
};

function getDetails(id: string): DetailPack {
  return (
    DETAILS[id] ?? {
      included: ["Professional workmanship", "Cleanup", "Clear communication"],
      prep: ["Provide photos", "Ensure access"],
    }
  );
}

export default function ServiceDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const cart = useCart();

  const service = useMemo(() => SERVICES.find((s) => s.id === id), [id]);

  if (!service) {
    return (
      <div className="stack page">
        <section className="panel card card-center">
          <h1>Service not found</h1>
          <Link to="/services" className="btn btn-primary">
            Back
          </Link>
        </section>
      </div>
    );
  }

  const svc = service;
  const details = getDetails(svc.id);
  const addOns = addOnsFor(svc.id);

  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  }

  function add() {
    cart.add(svc);
    cart.setQty(svc.id, qty);
    cart.setNote(svc.id, note);

    addOns
      .filter((a) => selected.includes(a.id))
      .forEach((a) => {
        cart.add(a);
        cart.setQty(a.id, 1);
        cart.setNote(a.id, `Add-on for ${svc.name}`);
      });

    toast(buildAddedMessage(svc.name, selected.length), "success", "Added", 2600, "View Schedule", "/schedule");
  
    nav("/services", { state: { fromAddToRequest: true } });
}

  return (
    <div className="stack page">
      {/* Header */}
      <section
        className="panel card"
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 20,
        }}
      >
        <img
          src={svc.image}
          alt={svc.name}
          style={{
            width: 220,
            height: 220,
            objectFit: "cover",
            borderRadius: 16,
          }}
        />

        <div>
          <h1>{svc.name}</h1>
          <div className="badge">{formatPrice(svc)}</div>
          <p>{svc.shortDesc}</p>

          <div className="row">
            <Link to="/services" className="btn btn-ghost">
              ← Back
            </Link>

            <Link to="/schedule" className="btn btn-primary">
              Schedule →
            </Link>
          </div>
        </div>
      </section>

      {/* Included */}
      <section className="panel card">
        <h3>What's Included</h3>

        <ul>
          {details.included.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <section className="panel card">
          <h3>Recommended Add-Ons</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 12,
              marginTop: 10,
            }}
          >
            {addOns.map((ao) => {
              const on = selected.includes(ao.id);

              return (
                <div
                  key={ao.id}
                  onClick={() => toggle(ao.id)}
                  className="panel"
                  style={{
                    cursor: "pointer",
                    padding: 12,
                    border: on
                      ? "2px solid #2563eb"
                      : "1px solid rgba(0,0,0,0.15)",
                    borderRadius: 12,
                  }}
                >
                  {ao.image && (
                    <img
                      src={ao.image}
                      alt={ao.name}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 10,
                        objectFit: "cover",
                        marginBottom: 6,
                      }}
                    />
                  )}

                  <strong>{ao.name}</strong>

                  <div className="muted">{formatPrice(ao)}</div>

                  <p style={{ fontSize: 13 }}>{ao.shortDesc}</p>

                  <span className="badge">
                    {on ? "Selected ✓" : "Tap to select"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add */}
      <section className="panel card">
        <h3>Add to Request</h3>

        <div className="row">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="field"
            style={{ width: 100 }}
          />

          <input
            className="field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes (optional)"
          />

          <button className="btn btn-primary" onClick={add}>
            Add
          </button>
        </div>
      </section>
    </div>
  );
}