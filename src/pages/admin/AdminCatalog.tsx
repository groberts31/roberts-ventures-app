import { useEffect, useMemo, useState } from "react";
import { toast } from "../../lib/toast";

// Base catalog (ships with the app)
import { SERVICES, CATEGORIES, type Service, type PriceType } from "../../data/services";
import { ADD_ONS, type AddOn } from "../../data/addOns";

// Admin overrides (localStorage + later cloud)
// IMPORTANT: we will adapt the import to match your real exports after Step 1 output.
import * as CS from "../../config/catalogStore";

type AnyCat = any;

// ---------- helpers ----------
function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function slugify(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function priceLabel(s: any) {
  if (s?.priceType === "quote") return "Quote";
  if (s?.priceType === "fixed") return s?.price ? `${money(s.price)}${s.unitLabel ? " (" + s.unitLabel + ")" : ""}` : "Fixed";
  if (s?.priceType === "starting_at") return s?.price ? `From ${money(s.price)}` : "Starting";
  return "—";
}

function isAddOn(x: any): x is AddOn {
  return Boolean(x && x.isAddOn);
}

// ---------- page ----------
export default function AdminCatalog() {
  // We intentionally treat catalogStore as a flexible module because your file is evolving.
  // We'll use whatever functions exist:
  const read = (CS as AnyCat).readCatalogOverrides || (CS as AnyCat).readCatalog || (CS as AnyCat).read || null;
  const write = (CS as AnyCat).writeCatalogOverrides || (CS as AnyCat).writeCatalog || (CS as AnyCat).write || null;
  const notify = (CS as AnyCat).notifyCatalogChanged || (CS as AnyCat).notify || (() => {});
  const DEFAULT_OV = (CS as AnyCat).DEFAULT_OVERRIDES || (CS as AnyCat).DEFAULT_OV || (CS as AnyCat).DEFAULT || { hiddenIds: {}, customServices: [], customAddOns: [] };

  const [ov, setOv] = useState<any>(() => {
    try {
      if (typeof read === "function") return read();
    } catch {}
    return DEFAULT_OV;
  });

  useEffect(() => {
    try {
      if (typeof write === "function") write(ov);
      notify?.();
    } catch {}
  }, [ov]);

  // Build full catalog for display
  const baseAll = useMemo(() => [...SERVICES, ...ADD_ONS], []);
  const customServices: Service[] = Array.isArray(ov?.customServices) ? ov.customServices : [];
  const customAddOns: AddOn[] = Array.isArray(ov?.customAddOns) ? ov.customAddOns : [];

  const all = useMemo(() => {
    const merged = [...baseAll, ...customServices, ...customAddOns];
    // de-dupe by id (custom should win if same id exists)
    const map = new Map<string, any>();
    for (const item of merged) map.set(String(item.id), item);
    return Array.from(map.values());
  }, [baseAll, customServices, customAddOns]);

  const hidden = ov?.hiddenIds || {};

  const servicesOnly = all.filter((x) => !isAddOn(x) && x.category !== "Add-Ons");
  const addOnsOnly = all.filter((x) => isAddOn(x) || x.category === "Add-Ons");

  // ------- Add forms state -------
  const [mode, setMode] = useState<"service" | "addon">("service");

  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0] || "Home Services");
  const [shortDesc, setShortDesc] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [price, setPrice] = useState<string>("");
  const [unitLabel, setUnitLabel] = useState("");
  const [durationMins, setDurationMins] = useState<string>("60");

  // add-on only
  const [parentIds, setParentIds] = useState<string>("");

  function resetForm() {
    setName("");
    setId("");
    setCategory(CATEGORIES[0] || "Home Services");
    setShortDesc("");
    setPriceType("fixed");
    setPrice("");
    setUnitLabel("");
    setDurationMins("60");
    setParentIds("");
  }

  function ensureId() {
    const clean = slugify(id || name);
    setId(clean);
    return clean;
  }

  function toggleHidden(itemId: string) {
    setOv((prev: any) => {
      const hid = { ...(prev?.hiddenIds || {}) };
      const k = String(itemId);
      hid[k] = !hid[k];
      return { ...prev, hiddenIds: hid };
    });
  }

  function removeCustom(itemId: string) {
    const k = String(itemId);
    setOv((prev: any) => {
      const cs = Array.isArray(prev?.customServices) ? prev.customServices : [];
      const ca = Array.isArray(prev?.customAddOns) ? prev.customAddOns : [];
      return {
        ...prev,
        customServices: cs.filter((x: any) => String(x.id) !== k),
        customAddOns: ca.filter((x: any) => String(x.id) !== k),
      };
    });
    toast("Removed custom item.", "success", "Saved", 1600);
  }

  function addItem() {
    const cleanId = ensureId();
    if (!cleanId) return toast("Please provide a Name (or ID).", "warning", "Missing", 2200);
    if (!name.trim()) return toast("Please provide a Name.", "warning", "Missing", 2200);
    if (!shortDesc.trim()) return toast("Please provide a Short Description.", "warning", "Missing", 2200);

    const dur = Number(durationMins);
    const durOk = Number.isFinite(dur) && dur > 0 ? dur : undefined;

    const pt = priceType;
    const priceNum = pt === "quote" ? 0 : Number(price);

    if (pt !== "quote" && !(Number.isFinite(priceNum) && priceNum >= 0)) {
      return toast("Price must be a number (or switch to Quote).", "warning", "Invalid price", 2400);
    }

    const p = pt === "quote" ? undefined : priceNum;

    if (mode === "addon") {
      const parents = parentIds
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      if (parents.length === 0) {
        return toast("Add-ons must include at least one Parent Service ID.", "warning", "Missing parent", 2600);
      }

      const addOn: AddOn = {
        id: cleanId,
        isAddOn: true,
        parentServiceIds: parents,
        category: "Add-Ons",
        name: name.trim(),
        shortDesc: shortDesc.trim(),
        priceType: pt,
        price: pt === "quote" ? undefined : p,
        unitLabel: unitLabel.trim() || undefined,
        durationMins: durOk,
        image: undefined,
      };

      setOv((prev: any) => {
        const ca = Array.isArray(prev?.customAddOns) ? prev.customAddOns : [];
        const next = ca.filter((x: any) => String(x.id) !== cleanId).concat([addOn]);
        return { ...prev, customAddOns: next };
      });

      toast("Add-on saved.", "success", "Saved", 1800);
      resetForm();
      return;
    }

    const svc: Service = {
      id: cleanId,
      category: category,
      name: name.trim(),
      shortDesc: shortDesc.trim(),
      priceType: pt,
      price: pt === "quote" ? undefined : p,
      unitLabel: unitLabel.trim() || undefined,
      durationMins: durOk,
      image: undefined,
    };

    setOv((prev: any) => {
      const cs = Array.isArray(prev?.customServices) ? prev.customServices : [];
      const next = cs.filter((x: any) => String(x.id) !== cleanId).concat([svc]);
      return { ...prev, customServices: next };
    });

    toast("Service saved.", "success", "Saved", 1800);
    resetForm();
  }

  const existingIds = useMemo(() => new Set(all.map((x) => String(x.id))), [all]);
  const isCustom = (itemId: string) =>
    customServices.some((x) => String(x.id) === String(itemId)) ||
    customAddOns.some((x) => String(x.id) === String(itemId));

  const sections = useMemo(() => {
    return [
      { title: "Services", items: servicesOnly },
      { title: "Add-Ons", items: addOnsOnly },
    ];
  }, [servicesOnly, addOnsOnly]);

  return (
    <div className="stack page" style={{ gap: 14 }}>
<section className="panel card" style={{ display: "grid", gap: 10 }}>
        <div className="h2" style={{ margin: 0 }}>Catalog Manager</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          Add, hide, and manage Services + Add-Ons from Admin. Stored in this browser for now (cloud sync later).
        </div>
      </section>

      {/* Add form */}
      <section className="panel card" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div className="h3" style={{ margin: 0 }}>Add New Item</div>
            <div className="muted" style={{ fontWeight: 850 }}>Creates a custom item (does not modify source files).</div>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className={mode === "service" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setMode("service")}
              style={{ fontWeight: 950 }}
            >
              Service
            </button>
            <button
              type="button"
              className={mode === "addon" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setMode("addon")}
              style={{ fontWeight: 950 }}
            >
              Add-On
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div className="label">Name</div>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Faucet Replacement" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="label">ID (auto if blank)</div>
            <input className="field" value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g., faucet-replace" />
            <div className="muted" style={{ fontWeight: 800, fontSize: 12 }}>Will be slugified from Name if empty.</div>
          </div>

          {mode === "service" ? (
            <div style={{ display: "grid", gap: 6 }}>
              <div className="label">Category</div>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              <div className="label">Parent Service IDs (comma separated)</div>
              <input className="field" value={parentIds} onChange={(e) => setParentIds(e.target.value)} placeholder="tv-mount, ceiling-fan" />
              <div className="muted" style={{ fontWeight: 800, fontSize: 12 }}>Use the service IDs shown below.</div>
            </div>
          )}

          <div style={{ display: "grid", gap: 6 }}>
            <div className="label">Price Type</div>
            <select className="field" value={priceType} onChange={(e) => setPriceType(e.target.value as any)}>
              <option value="fixed">Fixed</option>
              <option value="starting_at">Starting at</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="label">Price (USD)</div>
            <input className="field" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 150" disabled={priceType === "quote"} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="label">Unit Label</div>
            <input className="field" value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="e.g., flat rate / per hour / starting at" />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div className="label">Default Duration (mins)</div>
            <input className="field" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} placeholder="e.g., 90" />
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <div className="label">Short Description</div>
          <textarea className="field" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="One sentence summary shown to customers." rows={3} />
        </div>

        {id && existingIds.has(String(id)) ? (
          <div className="panel" style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.08)", color: "#7c2d12" }}>
            <div style={{ fontWeight: 950 }}>Warning: ID already exists</div>
            <div style={{ fontWeight: 850, marginTop: 4 }}>
              Saving will override the item with this ID in the merged catalog.
            </div>
          </div>
        ) : null}

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={addItem} style={{ fontWeight: 950 }}>
            Save {mode === "addon" ? "Add-On" : "Service"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetForm} style={{ fontWeight: 950 }}>
            Clear
          </button>
        </div>
      </section>

      {/* Catalog list */}
      {sections.map((sec) => (
        <section key={sec.title} className="panel card" style={{ display: "grid", gap: 10 }}>
          <div className="h3" style={{ margin: 0 }}>{sec.title}</div>

          <div style={{ display: "grid", gap: 10 }}>
            {sec.items.map((s: any) => {
              const hid = Boolean(hidden?.[String(s.id)]);
              const custom = isCustom(String(s.id));

              return (
                <div
                  key={String(s.id)}
                  className="panel"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(2,6,23,0.12)",
                    background: "rgba(255,255,255,0.88)",
                  }}
                >
                  <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 950, color: "#0f172a" }}>
                        {s.name} {custom ? <span className="badge" style={{ marginLeft: 8 }}>Custom</span> : null} {hid ? <span className="badge" style={{ marginLeft: 8 }}>Hidden</span> : null}
                      </div>
                      <div className="muted" style={{ fontWeight: 850 }}>
                        <strong>ID:</strong> <code>{String(s.id)}</code> • <strong>Type:</strong> {isAddOn(s) ? "Add-On" : "Service"} • <strong>Price:</strong> {priceLabel(s)}
                      </div>

                      {isAddOn(s) ? (
                        <div className="muted" style={{ fontWeight: 850 }}>
                          <strong>Parents:</strong> {(s.parentServiceIds || []).join(", ")}
                        </div>
                      ) : (
                        <div className="muted" style={{ fontWeight: 850 }}>
                          <strong>Category:</strong> {s.category || "—"}
                        </div>
                      )}

                      <div className="muted" style={{ fontWeight: 850 }}>{s.shortDesc}</div>
                    </div>

                    <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className={hid ? "btn btn-ghost" : "btn btn-primary"}
                        onClick={() => toggleHidden(String(s.id))}
                        style={{ fontWeight: 950, minWidth: 120 }}
                        title={hid ? "Show on customer pages" : "Hide from customer pages"}
                      >
                        {hid ? "Show" : "Hide"}
                      </button>

                      {custom ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => removeCustom(String(s.id))}
                          style={{ fontWeight: 950 }}
                          title="Remove this custom item (base items cannot be removed)"
                        >
                          Remove Custom
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {sec.items.length === 0 ? (
              <div className="muted" style={{ fontWeight: 850 }}>No items found.</div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
