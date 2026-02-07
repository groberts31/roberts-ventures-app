import { useMemo, useState } from "react";
import {
  STAY_LIT_CUSTOM_BASE_PRICE,
  STAY_LIT_JARS,
  STAY_LIT_SCENTS,
  STAY_LIT_WICKS,
} from "../../data/staylitCatalog";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function StayLitCreate() {
  const [scentId, setScentId] = useState(STAY_LIT_SCENTS[0]?.id ?? "");
  const [jarId, setJarId] = useState(STAY_LIT_JARS[0]?.id ?? "");
  const [wickId, setWickId] = useState(STAY_LIT_WICKS[0]?.id ?? "");

  const selected = useMemo(() => {
    const scent = STAY_LIT_SCENTS.find((x) => x.id === scentId);
    const jar = STAY_LIT_JARS.find((x) => x.id === jarId);
    const wick = STAY_LIT_WICKS.find((x) => x.id === wickId);

    const price =
      STAY_LIT_CUSTOM_BASE_PRICE +
      (scent?.priceDelta ?? 0) +
      (jar?.priceDelta ?? 0) +
      (wick?.priceDelta ?? 0);

    return { scent, jar, wick, price };
  }, [scentId, jarId, wickId]);

  const summary = useMemo(() => {
    const s = selected.scent?.name ?? "—";
    const j = selected.jar?.name ?? "—";
    const w = selected.wick?.name ?? "—";
    return `Custom Candle: ${s} • ${j} • ${w}`;
  }, [selected.scent?.name, selected.jar?.name, selected.wick?.name]);

  return (
    <div className="stack page" style={{ gap: 18 }}>
      <section className="panel card card-center" style={{ textAlign: "center" }}>
        <div className="badge" style={{ width: "fit-content" }}>Stay Lit Candle Co.</div>
        <h1 className="h2" style={{ margin: 0 }}>Create Your Own Candle</h1>
        <div className="muted" style={{ fontWeight: 850, maxWidth: 860 }}>
          Select a Scent, Jar Type, and Wick Type. Pricing updates automatically.
        </div>
        <div className="row" style={{ justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-ghost" href="/staylit">← Back to Stay Lit</a>
          <a className="btn btn-ghost" href="/staylit/shop">Shop Pre-Made</a>
        </div>
      </section>

      <section
        className="panel card"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gap: 14,
}}
      >
        <div className="card-center" style={{ textAlign: "center", gap: 8 }}>
          <div className="badge" style={{ width: "fit-content" }}>Custom Builder</div>
          <div style={{ fontWeight: 950, fontSize: 18 }}>{summary}</div>
          <div className="badge" style={{ width: "fit-content", fontWeight: 950 }}>
            Estimated Price: {money(selected.price)}
          </div>
          <div className="muted" style={{ fontWeight: 850 }}>
            Final price may vary for special requests, bulk orders, or custom labeling.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {/* Scent */}
          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Scent</div>
            <select
              value={scentId}
              onChange={(e) => setScentId(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 12 }}
            >
              {STAY_LIT_SCENTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}{o.priceDelta ? ` (+${money(o.priceDelta)})` : ""}
                </option>
              ))}
            </select>
            <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
              Choose your primary scent profile.
            </div>
          </div>

          {/* Jar */}
          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Jar Type</div>
            <select
              value={jarId}
              onChange={(e) => setJarId(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 12 }}
            >
              {STAY_LIT_JARS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}{typeof o.priceDelta === "number" && o.priceDelta !== 0 ? ` (${o.priceDelta > 0 ? "+" : ""}${money(o.priceDelta)})` : ""}
                </option>
              ))}
            </select>
            <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
              {selected.jar?.note ?? "Pick the style you want."}
            </div>
          </div>

          {/* Wick */}
          <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
            <div className="label">Wick Type</div>
            <select
              value={wickId}
              onChange={(e) => setWickId(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 12 }}
            >
              {STAY_LIT_WICKS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}{o.priceDelta ? ` (+${money(o.priceDelta)})` : ""}
                </option>
              ))}
            </select>
            <div className="muted" style={{ fontWeight: 850, marginTop: 8 }}>
              {selected.wick?.note ?? "Select your burn style."}
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <a
            className="btn btn-primary"
            href={`/contact?staylit=custom&scent=${encodeURIComponent(scentId)}&jar=${encodeURIComponent(jarId)}&wick=${encodeURIComponent(wickId)}`}
          >
            Request This Custom Candle
          </a>
        </div>
      </section>
    </div>
  );
}
