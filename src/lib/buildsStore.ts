export type BuildStatus = "draft" | "submitted" | "reviewing" | "quote_sent" | "approved" | "in_build" | "complete";

export type BuildCustomer = {
  name: string;
  phone: string;
  email: string;
  address?: string;
};

export type BuildDims = {
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  topThicknessIn?: number;
};

export type BuildOptions = {
  woodSpecies: "Pine" | "Oak" | "Walnut" | "Maple" | "Poplar" | "Plywood";
  finish: "Natural" | "Stain" | "Paint" | "Poly";
  joinery: "Screws" | "Pocket Holes" | "Mortise & Tenon" | "Dowels";
};

export type RenderStatus = "queued" | "rendering" | "complete" | "failed";

export type RenderJob = {
  renderId: string;
  view: "iso" | "front" | "top" | "detail";
  status: RenderStatus;
  imageDataUrl?: string;
  startedAt?: string;
  finishedAt?: string;
  // Public estimate snapshot per render (what customer sees in that render’s box)
  estimatePublic?: {
    total: number;
    rangeLow?: number;
    rangeHigh?: number;
    label?: string;
  };
};

export type BuildVersion = {
  versionId: string;
  createdAt: string;
  customerChangeRequest?: string;
  inputsSnapshot: {
    type: string;
    dims: BuildDims;
    options: BuildOptions;
    notes?: string;
  };
  renders: RenderJob[];

  // Public estimate for this version (customer safe)
  estimatePublic?: {
    total: number;
    rangeLow?: number;
    rangeHigh?: number;
    materials: number;
    labor: number;
    overhead: number;
    finish: number;
  };

  // Admin-only future fields (kept here but NOT shown in customer pages)
  estimateInternal?: any;
  generatedPackage?: any; // cutlist/materials/steps/tools (admin only later)
};

export type BuildSubmission = {
  id: string;
  createdAt: string;
  updatedAt: string;

  status: BuildStatus;

  accessCode?: string; // 6 digits once submitted

  customer: BuildCustomer;

  project: {
    type: string; // table/bench/shelf/etc.
    dims: BuildDims;
    options: BuildOptions;
    notes?: string;
    refPhotos?: { name: string; type: string; dataUrl: string }[];
  };

  versions: BuildVersion[];
};

const KEY = "rv_build_submissions";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function uid() {
  return (crypto as any).randomUUID?.() ?? (Math.random().toString(16).slice(2) + Date.now().toString(16));
}

export function normalizePhone(p: string) {
  return String(p || "").replace(/\D+/g, "");
}

export function makeAccessCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function readBuilds(): BuildSubmission[] {
  const arr = safeParse<any[]>(localStorage.getItem(KEY), []);
  return (Array.isArray(arr) ? arr : []).filter(Boolean);
}

export function writeBuilds(items: BuildSubmission[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getBuild(id: string): BuildSubmission | null {
  const all = readBuilds();
  const found = all.find((b) => String(b.id) === String(id));
  return found || null;
}

export function upsertBuild(next: BuildSubmission) {
  const all = readBuilds();
  const idx = all.findIndex((b) => String(b.id) === String(next.id));
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  writeBuilds(all);
}

export function deleteBuild(id: string) {
  const all = readBuilds().filter((b) => String(b.id) !== String(id));
  writeBuilds(all);
}

export function createDraftBuild(args: {
  customer: BuildCustomer;
  type: string;
  dims: BuildDims;
  options: BuildOptions;
  notes?: string;
}): BuildSubmission {
  const now = new Date().toISOString();
  const id = uid();

  const versionId = uid();
  const version: BuildVersion = {
    versionId,
    createdAt: now,
    inputsSnapshot: {
      type: args.type,
      dims: args.dims,
      options: args.options,
      notes: args.notes || "",
    },
    renders: [
      { renderId: uid(), view: "iso", status: "queued" },
      { renderId: uid(), view: "front", status: "queued" },
      { renderId: uid(), view: "top", status: "queued" },
    ],
  };

  const build: BuildSubmission = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "draft",
    customer: args.customer,
    project: {
      type: args.type,
      dims: args.dims,
      options: args.options,
      notes: args.notes || "",
      refPhotos: [],
    },
    versions: [version],
  };

  upsertBuild(build);
  return build;
}

export function addRevision(id: string, customerChangeRequest: string, patch?: Partial<BuildSubmission["project"]>) {
  const b = getBuild(id);
  if (!b) return null;

  const now = new Date().toISOString();
  const mergedProject = { ...b.project, ...(patch || {}) };

  const version: BuildVersion = {
    versionId: uid(),
    createdAt: now,
    customerChangeRequest,
    inputsSnapshot: {
      type: mergedProject.type,
      dims: mergedProject.dims,
      options: mergedProject.options,
      notes: mergedProject.notes || "",
    },
    renders: [
      { renderId: uid(), view: "iso", status: "queued" },
      { renderId: uid(), view: "front", status: "queued" },
      { renderId: uid(), view: "top", status: "queued" },
      { renderId: uid(), view: "detail", status: "queued" },
    ],
  };

  const next: BuildSubmission = {
    ...b,
    updatedAt: now,
    project: mergedProject,
    versions: [version, ...b.versions],
  };

  upsertBuild(next);
  return next;
}

export function markSubmitted(id: string) {
  const b = getBuild(id);
  if (!b) return null;
  const now = new Date().toISOString();
  const accessCode = b.accessCode && String(b.accessCode).trim().length >= 6 ? b.accessCode : makeAccessCode();

  const next: BuildSubmission = {
    ...b,
    updatedAt: now,
    status: b.status === "draft" ? "submitted" : b.status,
    accessCode,
  };

  upsertBuild(next);
  return next;
}

export function findBuildsByPhoneAndCode(phone: string, code: string) {
  const p = normalizePhone(phone);
  const c = String(code || "").replace(/\D+/g, "");
  if (!p || c.length < 6) return [];
  return readBuilds().filter((b) => normalizePhone(b.customer?.phone || "") === p && String(b.accessCode || "") === c);
}

export function findBuildsByNameAndPhone(name: string, phone: string) {
  const n = String(name || "").trim().toLowerCase();
  const p = normalizePhone(phone);
  if (!n || p.length < 7) return [];
  return readBuilds().filter((b) => {
    const bn = String(b.customer?.name || "").trim().toLowerCase();
    const bp = normalizePhone(b.customer?.phone || "");
    return bn.includes(n) && bp.endsWith(p.slice(-7));
  });
}
