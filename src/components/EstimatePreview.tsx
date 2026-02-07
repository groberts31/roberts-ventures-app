import { useMemo } from "react";
import { useCart } from "../data/requestCart";
import { SERVICES } from "../data/services";
import { ADD_ONS } from "../data/addOns";

type PriceType = "fixed" | "starting_at" | "quote";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function getCartItems(cart: any): Array<any> {
  // Try common shapes without assuming your internal structure
  if (Array.isArray(cart?.items)) return cart.items;
  if (Array.isArray(cart?.lines)) return cart.lines;
  if (Array.isArray(cart?.cart)) return cart.cart;
  if (Array.isArray(cart?.state?.items)) return cart.state.items;
  if (typeof cart?.getItems === "function") {
    const v = cart.getItems();
    if (Array.isArray(v)) return v;
  }
  // If cart stores by id map: { [id]: {qty,note,addOns} }
  if (cart && typeof cart === "object" && cart.byId && typeof cart.byId === "object") {
    return Object.entries(cart.byId).map(([id, v]: any) => ({ serviceId: id, ...(v || {}) }));
  }
  return [];
}

function getQty(it: any): number {
  const q = it?.qty ?? it?.quantity ?? 1;
  const n = Number(q);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function getServiceId(it: any): string {
  return String(it?.serviceId ?? it?.id ?? it?.service?.id ?? "");
}

function getAddOnIds(cart: any, it: any): string[] {
  // Try common patterns
  if (Array.isArray(it?.addOns)) return it.addOns.map((x: any) => String(x?.id ?? x));
  if (Array.isArray(it?.addOnIds)) return it.addOnIds.map((x: any) => String(x));
  const sid = getServiceId(it);
  if (sid && Array.isArray(cart?.addOnsByService?.[sid])) return cart.addOnsByService[sid].map((x: any) => String(x?.id ?? x));
  if (sid && typeof cart?.getAddOns === "function") {
    const v = cart.getAddOns(sid);
    if (Array.isArray(v)) return v.map((x: any) => String(x?.id ?? x));
  }
  return [];
}

export default function EstimatePreview() {
  const cart = useCart();

  const items = useMemo(() => getCartItems(cart), [cart]);

  const calc = useMemo(() => {
    let minTotal = 0;
    const quotes: string[] = [];
    const lines: Array<{ label: string; note: string; amount?: number }> = [];

    const svcById = new Map(SERVICES.map((s: any) => [String(s.id), s]));
    const addById = new Map(ADD_ONS.map((a: any) => [String(a.id), a]));

    for (const it of items) {
      const sid = getServiceId(it);
      if (!sid) continue;

      const svc: any = svcById.get(sid);
      const qty = getQty(it);

      if (svc) {
        const pt: PriceType = svc.priceType;
        if (pt === "quote") {
          quotes.push(`${svc.name} (service)`);
          lines.push({ label: svc.name, note: "Quote required" });
        } else {
          const price = Number(svc.price ?? 0);
          const amt = (Number.isFinite(price) ? price : 0) * qty;
          minTotal += amt;
          lines.push({
            label: svc.name,
            note: pt === "starting_at" ? `Starting at ${money(price)} × ${qty}` : `${money(price)} × ${qty}`,
            amount: amt,
          });
        }
      } else {
        // Unknown service id (still show it)
        lines.push({ label: sid, note: "Service", amount: undefined });
      }

      // Add-ons for this service (if present)
      const addOnIds = getAddOnIds(cart, it);
      for (const aid of addOnIds) {
        const add: any = addById.get(String(aid));
        if (!add) {
          lines.push({ label: `Add-on: ${aid}`, note: "Add-on", amount: undefined });
          continue;
        }
        const pt: PriceType = add.priceType;
        if (pt === "quote") {
          quotes.push(`${add.name} (add-on)`);
          lines.push({ label: `Add-on: ${add.name}`, note: "Quote required" });
        } else {
          const price = Number(add.price ?? 0);
          const amt = (Number.isFinite(price) ? price : 0);
          minTotal += amt;
          lines.push({
            label: `Add-on: ${add.name}`,
            note: pt === "starting_at" ? `Starting at ${money(price)}` : `${money(price)}`,
            amount: amt,
          });
        }
      }
    }

    return { minTotal, quotes, lines };
  }, [items, cart]);

  if (!items || items.length === 0) return null;

  return (
    <section className="panel card" style={{ width: "100%", margin: 0, padding: 16, borderRadius: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
        <div style={{ display: "grid", gap: 6, justifyItems: "center" }}>
          <div className="badge" style={{ width: "fit-content" }}>Estimate Preview</div>
          <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 18 }}>
            Estimated minimum: {money(calc.minTotal)}
          </div>
          <div className="muted" style={{ fontWeight: 850, maxWidth: 820 }}>
            This is an estimate based on fixed/starting prices. Final cost may change after inspection,
            measurements, materials, access, or any quote-required items.
          </div>
        </div>

        {calc.quotes.length > 0 ? (
          <div
            className="panel"
            style={{
              padding: 12,
              borderRadius: 14,
              margin: "0 auto",
              maxWidth: 420,
              textAlign: "center",
              width: "100%",
            }}
          >
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Quote required</div>
            <div className="muted" style={{ marginTop: 6, fontWeight: 850 }}>
              {calc.quotes.slice(0, 6).join(", ")}
              {calc.quotes.length > 6 ? "…" : ""}
            </div>
          </div>
        ) : (
          <div
            className="panel"
            style={{
              padding: 12,
              borderRadius: 14,
              margin: "0 auto",
              maxWidth: 420,
              textAlign: "center",
              width: "100%",
              alignSelf: "center",
            }}
          >
            <div style={{ fontWeight: 950, color: "#0f172a" }}>No quotes needed</div>
            <div className="muted" style={{ marginTop: 6, fontWeight: 850 }}>
              All selected items have listed pricing.
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {calc.lines.map((ln, i) => (
          <div key={i} className="panel" style={{ padding: 10, borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", textAlign: "center" }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>{ln.label}</div>
              <div className="badge" style={{ width: "fit-content" }}>
                {ln.amount === undefined ? ln.note : money(ln.amount)}
              </div>
            </div>
            {ln.amount !== undefined ? (
              <div className="muted" style={{ marginTop: 6, fontWeight: 850 }}>{ln.note}</div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
