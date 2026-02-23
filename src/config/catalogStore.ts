import { useEffect, useMemo, useState } from "react";
import { SERVICES as DEFAULT_SERVICES, CATEGORIES, type Service, type PriceType } from "../data/services";
import { ADD_ONS as DEFAULT_ADD_ONS } from "../data/addOns";

export type AddOn = Service & {
  parentServiceIds: string[];
  isAddOn: true;
};

export type CatalogItem = Service | AddOn;

export type CatalogOverrides = {
  // If an id exists in these maps, it overrides the default item with the same id
  servicesById: Record<string, Service>;
  addOnsById: Record<string, AddOn>;

  // New admin-created items (ids not in defaults)
  customServiceIds: string[];
  customAddOnIds: string[];

  // Visibility
  hiddenIds: Record<string, boolean>;

  // Ordering (lower comes first). If not set, defaults keep original order.
  orderById: Record<string, number>;

  // (Optional) custom categories (if you add categories later)
  // categories?: string[];
};

export const STORAGE_KEY = "rv_catalog_overrides_v1";

export const DEFAULT_OVERRIDES: CatalogOverrides = {
  servicesById: {},
  addOnsById: {},
  customServiceIds: [],
  customAddOnIds: [],
  hiddenIds: {},
  orderById: {},
};

function safeParse(raw: string | null) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readCatalogOverrides(): CatalogOverrides {
  const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const parsed = safeParse(raw);

  // Merge so new keys never break old stored data
  return {
    ...DEFAULT_OVERRIDES,
    ...(parsed || {}),
    servicesById: { ...DEFAULT_OVERRIDES.servicesById, ...(parsed?.servicesById || {}) },
    addOnsById: { ...DEFAULT_OVERRIDES.addOnsById, ...(parsed?.addOnsById || {}) },
    hiddenIds: { ...DEFAULT_OVERRIDES.hiddenIds, ...(parsed?.hiddenIds || {}) },
    orderById: { ...DEFAULT_OVERRIDES.orderById, ...(parsed?.orderById || {}) },
    customServiceIds: Array.isArray(parsed?.customServiceIds) ? parsed.customServiceIds : [],
    customAddOnIds: Array.isArray(parsed?.customAddOnIds) ? parsed.customAddOnIds : [],
  };
}

export function writeCatalogOverrides(next: CatalogOverrides) {
  const merged = {
    ...DEFAULT_OVERRIDES,
    ...next,
    servicesById: { ...DEFAULT_OVERRIDES.servicesById, ...(next.servicesById || {}) },
    addOnsById: { ...DEFAULT_OVERRIDES.addOnsById, ...(next.addOnsById || {}) },
    hiddenIds: { ...DEFAULT_OVERRIDES.hiddenIds, ...(next.hiddenIds || {}) },
    orderById: { ...DEFAULT_OVERRIDES.orderById, ...(next.orderById || {}) },
    customServiceIds: Array.isArray(next.customServiceIds) ? next.customServiceIds : [],
    customAddOnIds: Array.isArray(next.customAddOnIds) ? next.customAddOnIds : [],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function notifyCatalogChanged() {
  try {
    window.dispatchEvent(new Event("rv_catalog_changed"));
  } catch {
    // ignore
  }
}

export type Catalog = {
  categories: readonly string[];
  services: Service[];
  addOns: AddOn[];
  all: CatalogItem[];
  addOnsFor: (serviceId: string) => AddOn[];
  findById: (id: string) => CatalogItem | undefined;
};

function isAddOn(x: any): x is AddOn {
  return Boolean(x && x.isAddOn && Array.isArray(x.parentServiceIds));
}

function sortKeyFor(id: string, fallbackIndex: number, ov: CatalogOverrides) {
  const n = ov.orderById?.[id];
  if (Number.isFinite(Number(n))) return Number(n);
  // Keep defaults in their file order unless admin provides orderById
  return 10_000 + fallbackIndex;
}

export function buildCatalog(ov: CatalogOverrides): Catalog {
  // Start with defaults in their defined order
  const defaultServices = DEFAULT_SERVICES.map((s, idx) => ({
    item: s,
    idx,
  }));

  const defaultAddOns = DEFAULT_ADD_ONS.map((a, idx) => ({
    item: a as AddOn,
    idx,
  }));

  // Apply overrides for existing ids
  const servicesMerged: Service[] = defaultServices.map(({ item, idx }) => {
    const over = ov.servicesById?.[item.id];
    const merged = over ? { ...item, ...over } : item;
    (merged as any).__defaultIndex = idx;
    return merged;
  });

  const addOnsMerged: AddOn[] = defaultAddOns.map(({ item, idx }) => {
    const over = ov.addOnsById?.[item.id];
    const merged = over ? ({ ...item, ...over } as AddOn) : item;
    (merged as any).__defaultIndex = idx;
    return merged;
  });

  // Add admin-created new items (by id lists)
  const customServices: Service[] = (ov.customServiceIds || [])
    .map((id) => ov.servicesById?.[id])
    .filter(Boolean);

  const customAddOns: AddOn[] = (ov.customAddOnIds || [])
    .map((id) => ov.addOnsById?.[id])
    .filter(Boolean);

  const servicesAll = [...servicesMerged, ...customServices];
  const addOnsAll = [...addOnsMerged, ...customAddOns];

  // Filter hidden
  const visibleServices = servicesAll.filter((s) => !ov.hiddenIds?.[s.id]);
  const visibleAddOns = addOnsAll.filter((a) => !ov.hiddenIds?.[a.id]);

  // Sort (stable)
  const servicesSorted = [...visibleServices].sort((a: any, b: any) => {
    const ai = Number.isFinite(a.__defaultIndex) ? a.__defaultIndex : 9_999_999;
    const bi = Number.isFinite(b.__defaultIndex) ? b.__defaultIndex : 9_999_999;
    const ak = sortKeyFor(a.id, ai, ov);
    const bk = sortKeyFor(b.id, bi, ov);
    if (ak !== bk) return ak - bk;
    return String(a.name).localeCompare(String(b.name));
  });

  const addOnsSorted = [...visibleAddOns].sort((a: any, b: any) => {
    const ai = Number.isFinite(a.__defaultIndex) ? a.__defaultIndex : 9_999_999;
    const bi = Number.isFinite(b.__defaultIndex) ? b.__defaultIndex : 9_999_999;
    const ak = sortKeyFor(a.id, ai, ov);
    const bk = sortKeyFor(b.id, bi, ov);
    if (ak !== bk) return ak - bk;
    return String(a.name).localeCompare(String(b.name));
  });

  const all: CatalogItem[] = [...servicesSorted, ...addOnsSorted];

  return {
    categories: CATEGORIES,
    services: servicesSorted,
    addOns: addOnsSorted,
    all,
    addOnsFor: (serviceId: string) =>
      addOnsSorted.filter((a) => isAddOn(a) && a.parentServiceIds.includes(serviceId)),
    findById: (id: string) => all.find((x) => String((x as any).id) === String(id)),
  };
}

export function useCatalogOverrides() {
  const [ov, setOv] = useState<CatalogOverrides>(() => {
    try {
      return readCatalogOverrides();
    } catch {
      return DEFAULT_OVERRIDES;
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setOv(readCatalogOverrides());
    };
    const onCustom = () => setOv(readCatalogOverrides());
    window.addEventListener("storage", onStorage);
    window.addEventListener("rv_catalog_changed", onCustom as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("rv_catalog_changed", onCustom as any);
    };
  }, []);

  const save = (next: CatalogOverrides) => {
    writeCatalogOverrides(next);
    notifyCatalogChanged();
    setOv(readCatalogOverrides());
  };

  return { ov, save };
}

export function useCatalog(): Catalog {
  const { ov } = useCatalogOverrides();
  return useMemo(() => buildCatalog(ov), [ov]);
}

// Small helpers for Admin UI validation
export function normalizeId(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function isValidPriceType(x: any): x is PriceType {
  return x === "fixed" || x === "starting_at" || x === "quote";
}
