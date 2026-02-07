import { useMemo, useState } from "react";
import { CATEGORIES, SERVICES, type Service } from "../data/services";
import { useCart } from "../data/requestCart";

function formatPrice(s: Service) {
  if (s.priceType === "quote") return "Quote required";

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(s.price ?? 0);

  if (s.priceType === "fixed") return money;

  return `Starting at ${money}`;
}

export default function Services() {
  const cart = useCart();

  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.toLowerCase();

    return SERVICES.filter((s) => {
      return (
        (category === "All" || s.category === category) &&
        (s.name + s.shortDesc).toLowerCase().includes(query)
      );
    });
  }, [category, q]);

  return (
    <div className="stack">

      <section className="panel card card-center">
        <h1 className="h2">Services Catalog</h1>

        <p className="lead">
          Select services to build your request.
        </p>

        <div className="row">
          <span className="badge">Cart: {cart.count}</span>
          <span className="badge">Showing: {filtered.length}</span>
        </div>

        <div className="row" style={{ marginTop: 10, width: "100%" }}>
          <select
            className="field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
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
          <article key={s.id} className="panel card card-center">

            <h3 className="h3">{s.name}</h3>

            <div className="muted">{s.category}</div>

            <span className="badge">
              {s.priceType === "fixed"
                ? "Fixed"
                : s.priceType === "starting_at"
                ? "Starting"
                : "Quote"}
            </span>

            <div style={{ fontWeight: 900, fontSize: 16 }}>
              {formatPrice(s)}
            </div>

            <p className="body" style={{ maxWidth: 520 }}>
              {s.shortDesc}
            </p>

            <button
              className="btn btn-primary"
              onClick={() => cart.add(s)}
            >
              Add to Request
            </button>

            {cart.has(s.id) && (
              <span className="badge">Added ✓</span>
            )}

          </article>
        ))}
      </section>

    </div>
  );
}
