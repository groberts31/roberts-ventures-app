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
  estimatePublic?: {
    total: number;
    rangeLow?: number;
    rangeHigh?: number;
    label?: string;
  };
};

/**
 * Canonical structured note items.
 * We keep legacy `notes?: string` as a backwards-compat compiled blob,
 * but `notesLog` is the ONLY structured source of truth.
 */
export type NoteAuthor = "customer" | "admin";
export type NoteKind = "initial" | "change" | "refinement" | "note";

export type NoteItem = {
  noteId: string;
  createdAt: string;
  author: NoteAuthor;
  kind: NoteKind;
  text: string;
};

export type BuildVersion = {
  versionId: string;
  createdAt: string;
  customerChangeRequest?: string;
  inputsSnapshot: {
    type: string;
    dims: BuildDims;
    options: BuildOptions;

    // legacy compiled string (keep for backwards compatibility)
    notes?: string;

    // canonical structured notes (single definition!)
    notesLog?: NoteItem[];
  };
  renders: RenderJob[];

  estimatePublic?: {
    total: number;
    rangeLow?: number;
    rangeHigh?: number;
    materials: number;
    labor: number;
    overhead: number;
    finish: number;
  };

  estimateInternal?: any;
  generatedPackage?: any;
};

export type BuildSubmission = {
  id: string;
  createdAt: string;
  updatedAt: string;

  status: BuildStatus;
  accessCode?: string;

  customer: BuildCustomer;

  project: {
    type: string;
    dims: BuildDims;
    options: BuildOptions;

    // legacy compiled string (still used by UI + renderer as fallback)
    notes?: string;

    // canonical structured notes
    notesLog?: NoteItem[];

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
  return String(p || "").replace(/\\D+/g, "");
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

/**
 * Compile notes for display + renderer.
 * - If legacy `notes` exists, it stays at the top.
 * - Structured notes follow in time order.
 */
export function compileNotes(notesLog?: NoteItem[], legacyNotes?: string) {
  const head = String(legacyNotes || "").trim();
  const items = Array.isArray(notesLog) ? notesLog : [];

  const body = items
    .map((n) => String(n?.text || "").trim())
    .filter(Boolean)
    .join("\\n\\n---\\n\\n");

  return [head, body].filter(Boolean).join("\\n\\n---\\n\\n");
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

  const baseNotes = String(args.notes || "").trim();

  const notesLog: NoteItem[] = baseNotes
    ? [
        {
          noteId: uid(),
          createdAt: now,
          author: "customer",
          kind: "initial",
          text: baseNotes,
        },
      ]
    : [];

  const version: BuildVersion = {
    versionId: uid(),
    createdAt: now,
    inputsSnapshot: {
      type: args.type,
      dims: args.dims,
      options: args.options,
      notes: baseNotes,
      notesLog,
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
      notes: baseNotes,
      notesLog,
      refPhotos: [],
    },
    versions: [version],
  };

  upsertBuild(build);
  return build;
}

/**
 * Creates a new version with renders re-queued.
 * IMPORTANT: carries notesLog forward via project snapshot.
 */
export function addRevision(
  id: string,
  customerChangeRequest: string,
  patch?: Partial<BuildSubmission["project"]>
) {
  const b = getBuild(id);
  if (!b) return null;

  const now = new Date().toISOString();
  const mergedProject: BuildSubmission["project"] = { ...b.project, ...(patch || {}) };

  const version: BuildVersion = {
    versionId: uid(),
    createdAt: now,
    customerChangeRequest,
    inputsSnapshot: {
      type: mergedProject.type,
      dims: mergedProject.dims,
      options: mergedProject.options,
      notes: mergedProject.notes || "",
      notesLog: Array.isArray(mergedProject.notesLog) ? mergedProject.notesLog : [],
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

/**
 * Adds customer-provided notes in structured form and triggers a new version + renders.
 */
export function addCustomerNote(id: string, changeRequest?: string, extraNotes?: string) {
  const b = getBuild(id);
  if (!b) return null;

  const now = new Date().toISOString();
  const prevLog = Array.isArray(b.project.notesLog) ? b.project.notesLog : [];

  const nextLog: NoteItem[] = [...prevLog];

  const req = String(changeRequest || "").trim();
  const add = String(extraNotes || "").trim();

  if (req) {
    nextLog.push({
      noteId: uid(),
      createdAt: now,
      author: "customer",
      kind: "change",
      text: req,
    });
  }

  if (add) {
    nextLog.push({
      noteId: uid(),
      createdAt: now,
      author: "customer",
      kind: "refinement",
      text: add,
    });
  }

  const compiled = compileNotes(nextLog, b.project.notes);

  // keep legacy notes updated for backwards compatibility / visibility
  return addRevision(id, "Customer provided additional details", {
    notesLog: nextLog,
    notes: compiled,
  });
}

/**
 * Removes the last NOTE authored by customer (change/refinement/note/initial) and triggers re-render.
 * This is what your customer button will call.
 */
export function removeLastCustomerNote(id: string) {
  const b = getBuild(id);
  if (!b) return null;

  const prevLog = Array.isArray(b.project.notesLog) ? b.project.notesLog : [];
  if (!prevLog.length) return b;

  // remove last customer-authored entry
  let idx = -1;
  for (let i = prevLog.length - 1; i >= 0; i--) {
    if (prevLog[i]?.author === "customer") {
      idx = i;
      break;
    }
  }
  if (idx < 0) return b;

  const nextLog = prevLog.slice(0, idx).concat(prevLog.slice(idx + 1));
  const compiled = compileNotes(nextLog, b.project.notes);

  return addRevision(id, "Customer removed last note", {
    notesLog: nextLog,
    notes: compiled,
  });
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
  const c = String(code || "").replace(/\\D+/g, "");
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
