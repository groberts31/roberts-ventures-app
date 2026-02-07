import { useMemo, useState } from "react";
import { CATEGORIES, SERVICES, type Service } from "../data/services";
import { useCart } from "../data/requestCart";

function formatPrice(s: Service) {
  if (s.priceType === "quote") return "Quote required";
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(s.price ?? 0);
  if (s.priceType === "fixed") return `${money} ${s.unitLabel ? `(${s.unitLabel})` : ""}`;
  return `${s.unitLabel ?? "Starting at"} ${money}`;
}

export default function Services() {
  const cart = useCart();
  const [category, setCategory] = useState<string>("All");
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
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h1 style={{ marginBottom: 6 }}>Services</h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          Select services to build a request. Pricing shows fixed / starting at / quote required.
        </p>
      </div>

      <section style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 800 }}>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="All">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 240 }}>
          <span style={{ fontWeight: 800 }}>Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: TV, deck, shelves, cleanup…"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <div style={{ marginLeft: "auto", opacity: 0.7, fontSize: 14 }}>
          In Cart: <strong>{cart.count}</strong>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        {filtered.map((s) => (
          <article
            key={s.id}
            style={{
              border: "1px solid #e3e3e3",
              borderRadius: 12,
              padding: 14,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{s.name}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{s.category}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    border: "1px solid #ddd",
                    background: s.priceType === "quote" ? "#fff3f3" : "#f7f7f7",
                  }}
                >
                  {s.priceType === "fixed" ? "Fixed price" : s.priceType === "starting_at" ? "Starting at" : "Quote required"}
                </span>
                <div style={{ fontWeight: 900 }}>{formatPrice(s)}</div>
              </div>
            </div>

            <p style={{ margin: 0, opacity: 0.85 }}>{s.shortDesc}</p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
                onClick={() => cart.add(s)}
              >
                Add to Request
              </button>

              {cart.has(s.id) && (
                <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.75 }}>
                  Added ✓ (check Schedule to edit quantity/notes)
                </span>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 14, border: "1px dashed #ccc", borderRadius: 12, opacity: 0.75 }}>
            No services match your search. Try a different keyword or select “All”.
          </div>
        )}
      </section>
    </div>
  );
}
