import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, SERVICES, type Service } from "../data/services";
import { useCart } from "../data/requestCart";
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

export default function ServicesPage() {
  const cart = useCart();
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SERVICES.filter((s) => {
      const matchCategory = category === "All" ? true : s.category === category;
      const matchQuery =
        query.length === 0
          ? true
          : (s.name + " " + s.shortDesc).toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });
  }, [category, q]);

  return (
    <div className="stack page">
      <section className="panel card card-center">
        <h1 className="h2">Services Catalog</h1>
        <p className="lead" style={{ maxWidth: 760 }}>
          Pick a service and add it to your request. For quote-required jobs, add notes and photos in Schedule.
        </p>

        <div className="row">
          <span className="badge">Cart: {cart.count}</span>
          <span className="badge">Showing: {filtered.length}</span>
        </div>

        <div
          className="row"
          style={{
            width: "100%",
            maxWidth: 820,
            marginTop: 10,
          }}
        >
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            className="field"
            placeholder="Search services…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      <section className="stack">
        {filtered.map((s) => (
          <article
            key={s.id}
            className="panel card"
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 16,
              alignItems: "center",
            }}
          >
            {/* LEFT: Image */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(2,6,23,0.16)",
                boxShadow: "0 10px 26px rgba(29,78,216,0.10)",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              {s.image ? (
                <img
                  src={s.image}
                  alt={s.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  className="card-center"
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: 10,
                  }}
                >
                  <div className="label">No Image</div>
                  <div className="muted" style={{ fontWeight: 900, fontSize: 12 }}>
                    {s.id}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Content */}
            <div style={{ display: "grid", gap: 8 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <div className="h3">{s.name}</div>
                  <div className="muted" style={{ fontWeight: 900, fontSize: 13 }}>
                    {s.category}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="badge" style={{ justifyContent: "center" }}>
                    {s.priceType === "fixed" ? "Fixed" : s.priceType === "starting_at" ? "Starting" : "Quote"}
                  </div>
                  <div className="price-accent" style={{ fontWeight: 950, marginTop: 8 }}>{formatPrice(s)}</div>
                </div>
              </div>

              <div className="body">{s.shortDesc}</div>

              <div className="row">
                <button className="btn btn-primary" onClick={() => { cart.add(s); toast(`${s.name} added`, "success", "Added", 2600, "View Schedule", "/schedule"); }}>
                  Add to Request
                </button>

                <Link
                  to={`/services/${s.id}`}
                  className="btn btn-ghost"
                  style={{ textDecoration: "none" }}
                >
                  View Details
                </Link>

                {cart.has(s.id) && <span className="badge">Added ✓</span>}
              </div>
            </div>
          </article>
        ))}
      </section>

      <style>{`
        /* Mobile: stack image on top */
        @media (max-width: 620px) {
          article.panel.card {
            grid-template-columns: 1fr !important;
          }
          article.panel.card > div:first-child {
            width: 100% !important;
            height: 190px !important;
          }
        }
      `}</style>
    </div>
  );
}