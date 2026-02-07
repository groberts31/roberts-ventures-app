import { STAY_LIT_PRODUCTS } from "../../data/staylitCatalog";

export default function StayLitShop() {
  return (
    <div className="stack page" style={{ gap: 18 }}>
      <section className="panel card card-center" style={{ textAlign: "center" }}>
        <div className="badge" style={{ width: "fit-content" }}>Stay Lit Candle Co.</div>
        <h1 className="h2" style={{ margin: 0 }}>Shop Pre-Made Candles</h1>
        <div className="muted" style={{ fontWeight: 850, maxWidth: 820 }}>
          Pick a candle below. You can request it from Contact, or we can wire it into checkout later.
        </div>
        <div className="row" style={{ justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-ghost" href="/staylit">← Back to Stay Lit</a>
          <a className="btn btn-primary" href="/staylit/create">Create Your Own</a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {STAY_LIT_PRODUCTS.map((c) => (
          <article
            key={c.id}
            className="panel card"
            style={{ display: "grid", gap: 10, textAlign: "center" }}
          >
            <div
              style={{
                height: 180,
                borderRadius: 14,
                background: "rgba(15,23,42,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 950,
              }}
            >
              🕯️ {c.name}
            </div>

            <h3 className="h3" style={{ margin: 0 }}>{c.name}</h3>
            <div className="muted" style={{ fontWeight: 850 }}>{c.scent}</div>
            <div style={{ fontWeight: 950 }}>${c.price} · {c.size}</div>
            <div className="muted" style={{ fontWeight: 850 }}>Burn Time: {c.burnTime}</div>
            <div style={{ fontWeight: 850 }}>{c.description}</div>

            <a className="btn btn-primary" href={`/contact?staylit=premade&product=${c.id}`}>
              Request This Candle
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
