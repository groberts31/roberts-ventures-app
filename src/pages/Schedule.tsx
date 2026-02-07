import { useMemo } from "react";
import { useCart } from "../data/requestCart";
import { SERVICES } from "../data/services";

export default function Schedule() {
  const cart = useCart();

  const itemsDetailed = useMemo(() => {
    return cart.items.map((i) => {
      const service = SERVICES.find((s) => s.id === i.serviceId);
      return { ...i, service };
    });
  }, [cart.items]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h1 style={{ marginBottom: 6 }}>Schedule / Request</h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          Review your selected services, adjust quantity, add notes, then we’ll choose a date/time next.
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div style={{ padding: 14, border: "1px dashed #ccc", borderRadius: 12, opacity: 0.8 }}>
          Your request cart is empty. Go to <strong>Services</strong> and add items.
        </div>
      ) : (
        <>
          <section style={{ display: "grid", gap: 12 }}>
            {itemsDetailed.map((i) => (
              <article
                key={i.serviceId}
                style={{
                  border: "1px solid #e3e3e3",
                  borderRadius: 12,
                  padding: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {i.service?.name ?? "Service"}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
                      {i.service?.category ?? "—"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => cart.remove(i.serviceId)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      background: "#fff",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 900 }}>Qty</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={i.qty}
                      onChange={(e) => cart.setQty(i.serviceId, Number(e.target.value))}
                      style={{ width: 90, padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}
                    />
                  </label>

                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    Tip: add specifics below (sizes, locations, how many, deadline).
                  </div>
                </div>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900 }}>Notes for this service</span>
                  <textarea
                    value={i.note}
                    onChange={(e) => cart.setNote(i.serviceId, e.target.value)}
                    placeholder='Example: "2 TVs (55&quot; and 65&quot;). Mount on living room wall. Hide cables if possible."'
                    rows={3}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
                  />
                </label>
              </article>
            ))}
          </section>

          <section style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={cart.clear}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Clear All
            </button>

            <button
              type="button"
              onClick={() => alert("Next: Date/time picker + submit request (we’ll build this next).")}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#f0f0f0",
                fontWeight: 900,
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              Continue to Date & Time →
            </button>
          </section>
        </>
      )}
    </div>
  );
}
