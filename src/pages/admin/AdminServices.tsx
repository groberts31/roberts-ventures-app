import { useMemo, useState } from "react";
import { toast } from "../../lib/toast";
import { useCatalog } from "../../config/catalogStore";
import {
  DEFAULT_OVERRIDES,
  normalizeId,
  readCatalogOverrides,
  writeCatalogOverrides,
  notifyCatalogChanged,
  type CatalogOverrides,
} from "../../config/catalogStore";

type Mode = "service" | "addon";

function isAddOn(x: any) {
  return Boolean(x && x.isAddOn && Array.isArray(x.parentServiceIds));
}

function cloneOv(): CatalogOverrides {
  try {
    return readCatalogOverrides();
  } catch {
    return DEFAULT_OVERRIDES;
  }
}

export default function AdminServices() {
  const catalog = useCatalog();

  const [tab, setTab] = useState<Mode>("service");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  const [draft, setDraft] = useState<any>({
    id: "",
    name: "",
    category: "Home Services",
    shortDesc: "",
    priceType: "fixed",
    price: 0,
    unitLabel: "",
    durationMins: 60,
    image: "",
    // add-on fields
    parentServiceIds: [] as string[],
    isAddOn: true,
  });

  const allCategories = useMemo(() => {
    const fromDefaults = Array.from(new Set([...(catalog.categories as any), "Add-Ons"]));
    return ["All", ...fromDefaults];
  }, [catalog.categories]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = tab === "service" ? catalog.services : catalog.addOns;

    return list.filter((s: any) => {
      const matchCat = category === "All" ? true : String(s.category) === String(category);
      const matchQ =
        query.length === 0
          ? true
          : String((s.name || "") + " " + (s.shortDesc || "") + " " + (s.id || ""))
              .toLowerCase()
              .includes(query);

      return matchCat && matchQ;
    });
  }, [tab, q, category, catalog.services, catalog.addOns]);

  function saveOv(next: CatalogOverrides) {
    writeCatalogOverrides(next);
    notifyCatalogChanged();
  }

  function toggleHidden(id: string) {
    const ov = cloneOv();
    ov.hiddenIds = { ...(ov.hiddenIds || {}) };
    ov.hiddenIds[id] = !ov.hiddenIds[id];
    saveOv(ov);
    toast(ov.hiddenIds[id] ? "Hidden" : "Visible", "success", id, 1400);
  }

  function startEdit(item: any) {
    const isAO = isAddOn(item);
    setTab(isAO ? "addon" : "service");
    setDraft({
      id: String(item.id || ""),
      name: String(item.name || ""),
      category: String(item.category || ""),
      shortDesc: String(item.shortDesc || ""),
      priceType: String(item.priceType || "fixed"),
      price: typeof item.price === "number" ? item.price : 0,
      unitLabel: String(item.unitLabel || ""),
      durationMins: typeof item.durationMins === "number" ? item.durationMins : 60,
      image: String(item.image || ""),
      parentServiceIds: Array.isArray(item.parentServiceIds) ? item.parentServiceIds : [],
      isAddOn: isAO ? true : false,
    });
    toast("Editing loaded into form", "success", "Edit", 1200);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetDraft() {
    setDraft({
      id: "",
      name: "",
      category: "Home Services",
      shortDesc: "",
      priceType: "fixed",
      price: 0,
      unitLabel: "",
      durationMins: 60,
      image: "",
      parentServiceIds: [],
      isAddOn: true,
    });
  }

  function upsert() {
    const ov = cloneOv();
    const idNorm = normalizeId(draft.id || draft.name);
    if (!idNorm) return toast("Enter an ID or Name first.", "warning", "Missing ID", 1800);
    if (!String(draft.name || "").trim()) return toast("Name is required.", "warning", "Missing Name", 1800);
    if (!String(draft.category || "").trim()) return toast("Category is required.", "warning", "Missing Category", 1800);
    if (!String(draft.shortDesc || "").trim())
      return toast("Short description is required.", "warning", "Missing Description", 1800);

    const base: any = {
      id: idNorm,
      name: String(draft.name || "").trim(),
      category: String(draft.category || "").trim(),
      shortDesc: String(draft.shortDesc || "").trim(),
      priceType: String(draft.priceType || "fixed"),
      unitLabel: String(draft.unitLabel || "").trim(),
      durationMins: Number(draft.durationMins || 0) || 0,
      image: String(draft.image || "").trim() || undefined,
    };

    // price is optional for quote
    if (base.priceType !== "quote") {
      base.price = Number(draft.price || 0) || 0;
    } else {
      delete base.price;
    }

    if (tab === "addon") {
      const parents = Array.isArray(draft.parentServiceIds) ? draft.parentServiceIds : [];
      if (parents.length === 0) {
        return toast("Pick at least one Parent Service for this add-on.", "warning", "Missing Parent", 2200);
      }

      const addOn: any = {
        ...base,
        isAddOn: true,
        parentServiceIds: parents.map(String),
        category: "Add-Ons",
      };

      ov.addOnsById = { ...(ov.addOnsById || {}), [idNorm]: addOn };

      // If this is a NEW id (not in defaults), track it as custom
      if (!ov.customAddOnIds.includes(idNorm)) {
        const existsInDefaults = catalog.addOns.some((x: any) => String(x.id) === idNorm);
        if (!existsInDefaults) ov.customAddOnIds = [...ov.customAddOnIds, idNorm];
      }
    } else {
      const svc: any = {
        ...base,
      };
      ov.servicesById = { ...(ov.servicesById || {}), [idNorm]: svc };

      if (!ov.customServiceIds.includes(idNorm)) {
        const existsInDefaults = catalog.services.some((x: any) => String(x.id) === idNorm);
        if (!existsInDefaults) ov.customServiceIds = [...ov.customServiceIds, idNorm];
      }
    }

    // If it was hidden, unhide when saving (quality of life)
    if (ov.hiddenIds?.[idNorm]) {
      ov.hiddenIds = { ...(ov.hiddenIds || {}) };
      delete ov.hiddenIds[idNorm];
    }

    saveOv(ov);
    toast("Saved.", "success", idNorm, 1600);
    resetDraft();
  }

  const parentOptions = useMemo(() => {
    return catalog.services.map((s: any) => ({ id: String(s.id), name: String(s.name) }));
  }, [catalog.services]);

  const hiddenMap = useMemo(() => {
    const ov = cloneOv();
    return ov.hiddenIds || {};
  }, [catalog.all.length]);

  return (
    <div className="stack page" style={{ gap: 14 }}>
<section className="panel card" style={{ display: "grid", gap: 10 }}>
        <div className="h2" style={{ margin: 0 }}>Service Manager</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          Add / edit / hide services and add-ons. Stored in this browser now (Firestore later).
        </div>
      </section>

      {/* Create / Edit */}
      <section className="panel card" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className={tab === "service" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("service")}
              style={{ fontWeight: 950 }}
            >
              Service
            </button>
            <button
              type="button"
              className={tab === "addon" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("addon")}
              style={{ fontWeight: 950 }}
            >
              Add-On
            </button>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" onClick={resetDraft} style={{ fontWeight: 950 }}>
              Clear Form
            </button>
            <button type="button" className="btn btn-primary" onClick={upsert} style={{ fontWeight: 950 }}>
              Save
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <input
              className="field"
              style={{ minWidth: 240, flex: 1 }}
              value={draft.id}
              onChange={(e) => setDraft((p: any) => ({ ...p, id: e.target.value }))}
              placeholder="ID (leave blank to auto-generate from name)"
            />
            <input
              className="field"
              style={{ minWidth: 280, flex: 2 }}
              value={draft.name}
              onChange={(e) => setDraft((p: any) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
            />
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <select
              className="field"
              style={{ minWidth: 220 }}
              value={draft.category}
              onChange={(e) => setDraft((p: any) => ({ ...p, category: e.target.value }))}
              disabled={tab === "addon"}
              title={tab === "addon" ? "Add-ons are always in the Add-Ons category" : ""}
            >
              {Array.from(new Set([...(catalog.categories as any)])).map((c: any) => (
                <option key={String(c)} value={String(c)}>{String(c)}</option>
              ))}
              <option value="Add-Ons">Add-Ons</option>
            </select>

            <select
              className="field"
              style={{ minWidth: 220 }}
              value={draft.priceType}
              onChange={(e) => setDraft((p: any) => ({ ...p, priceType: e.target.value }))}
            >
              <option value="fixed">fixed</option>
              <option value="starting_at">starting_at</option>
              <option value="quote">quote</option>
            </select>

            <input
              className="field"
              style={{ width: 140 }}
              value={String(draft.price ?? "")}
              onChange={(e) => setDraft((p: any) => ({ ...p, price: Number(e.target.value || 0) }))}
              placeholder="Price"
              disabled={String(draft.priceType) === "quote"}
            />

            <input
              className="field"
              style={{ minWidth: 180, flex: 1 }}
              value={draft.unitLabel}
              onChange={(e) => setDraft((p: any) => ({ ...p, unitLabel: e.target.value }))}
              placeholder="Unit label (flat rate, starting at...)"
            />

            <input
              className="field"
              style={{ width: 160 }}
              value={String(draft.durationMins ?? 0)}
              onChange={(e) => setDraft((p: any) => ({ ...p, durationMins: Number(e.target.value || 0) }))}
              placeholder="Duration mins"
            />
          </div>

          <textarea
            className="field"
            value={draft.shortDesc}
            onChange={(e) => setDraft((p: any) => ({ ...p, shortDesc: e.target.value }))}
            placeholder="Short description"
            style={{ minHeight: 90 }}
          />

          <input
            className="field"
            value={draft.image}
            onChange={(e) => setDraft((p: any) => ({ ...p, image: e.target.value }))}
            placeholder="Image URL (optional) — leave blank to show 'No Image'"
          />

          {tab === "addon" && (
            <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Parent Services</div>
              <div className="muted" style={{ fontWeight: 850, marginTop: 6 }}>
                Pick which service(s) this add-on belongs to.
              </div>

              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {parentOptions.map((p) => {
                  const on = (draft.parentServiceIds || []).includes(p.id);
                  return (
                    <label key={p.id} className="row" style={{ gap: 10, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          setDraft((prev: any) => {
                            const cur = Array.isArray(prev.parentServiceIds) ? prev.parentServiceIds : [];
                            const next = on ? cur.filter((x: string) => x !== p.id) : [...cur, p.id];
                            return { ...prev, parentServiceIds: next };
                          });
                        }}
                      />
                      <span style={{ fontWeight: 900 }}>{p.name}</span>
                      <span className="muted" style={{ fontWeight: 850 }}>({p.id})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* List + search */}
      <section className="panel card" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div className="h3" style={{ margin: 0 }}>{tab === "service" ? "Services" : "Add-Ons"}</div>
            <div className="muted" style={{ fontWeight: 850 }}>
              Click “Edit” to load into the form above.
            </div>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {allCategories.map((c) => (
                <option key={String(c)} value={String(c)}>{String(c)}</option>
              ))}
            </select>
            <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((s: any) => {
            const hidden = Boolean(hiddenMap?.[s.id]);
            return (
              <div
                key={String(s.id)}
                className="panel"
                style={{
                  padding: 12,
                  borderRadius: 14,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "center",
                  opacity: hidden ? 0.55 : 1,
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>
                    {s.name}{" "}
                    <span className="muted" style={{ fontWeight: 850 }}>
                      ({s.id})
                    </span>
                  </div>
                  <div className="muted" style={{ fontWeight: 850 }}>
                    {String(s.category)} • {String(s.priceType)} {typeof s.price === "number" ? `• $${s.price}` : ""}
                  </div>
                  {isAddOn(s) && (
                    <div className="muted" style={{ fontWeight: 850 }}>
                      Parent: {s.parentServiceIds.join(", ")}
                    </div>
                  )}
                  <div className="muted" style={{ fontWeight: 850 }}>
                    {s.shortDesc}
                  </div>
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" style={{ fontWeight: 950 }} onClick={() => startEdit(s)}>
                    Edit
                  </button>
                  <button
                    className={hidden ? "btn btn-primary" : "btn btn-ghost"}
                    style={{ fontWeight: 950, minWidth: 110 }}
                    onClick={() => toggleHidden(String(s.id))}
                    title={hidden ? "Click to show" : "Click to hide"}
                  >
                    {hidden ? "Show" : "Hide"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel card" style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Notes</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          Images: use a hosted image URL for now. Later we can add Firebase Storage uploads.
        </div>
      </section>
    </div>
  );
}
