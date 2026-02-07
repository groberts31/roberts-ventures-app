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
    <div className="stack page">
      <section className="panel card">
        <div className="label">Request Builder</div>
        <h1 className="h2" style={{ marginTop: 6 }}>Schedule / Request</h1>
        <p className="lead" style={{ marginTop: 6 }}>
          Review your selected services, adjust quantity, and add notes. Next we’ll choose date & time.
        </p>

        <div className="row" style={{ marginTop: 12 }}>
          <div className="badge">Items: {cart.count}</div>
          {cart.items.length > 0 && (
            <button className="btn btn-ghost" onClick={cart.clear}>
              Clear All
            </button>
          )}
        </div>
      </section>

      {cart.items.length === 0 ? (
        <section className="panel card">
          <div className="h3">Your request cart is empty</div>
          <p className="body">Go to Services and add items to get started.</p>
        </section>
      ) : (
        <>
          <section className="stack">
            {itemsDetailed.map((i) => (
              <article key={i.serviceId} className="panel card">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div className="h3">{i.service?.name ?? "Service"}</div>
                    <div className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                      {i.service?.category ?? "—"}
                    </div>
                  </div>

                  <button className="btn" onClick={() => cart.remove(i.serviceId)}>
                    Remove
                  </button>
                </div>

                <div className="row" style={{ marginTop: 10 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span className="label">Quantity</span>
                    <input
                      className="field"
                      type="number"
                      min={1}
                      max={99}
                      value={i.qty}
                      onChange={(e) => cart.setQty(i.serviceId, Number(e.target.value))}
                      style={{ width: 140 }}
                    />
                  </label>

                  <div className="badge">
                    Tip: add sizes, locations, and special requests in notes.
                  </div>
                </div>

                <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  <span className="label">Notes for this service</span>
                  <textarea
                    className="field"
                    value={i.note}
                    onChange={(e) => cart.setNote(i.serviceId, e.target.value)}
                    placeholder='Example: "2 TVs (55&quot; and 65&quot;). Living room wall. Hide cables if possible."'
                    rows={3}
                  />
                </label>
              </article>
            ))}
          </section>

          <section className="panel card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="label">Next step</div>
                <div className="h3" style={{ marginTop: 6 }}>Pick Date & Time</div>
                <p className="body" style={{ margin: "6px 0 0 0" }}>
                  Next we’ll generate time slots based on your hours and allow customers to submit.
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => alert("Next: Date/time picker + submit request")}
              >
                Continue →
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
