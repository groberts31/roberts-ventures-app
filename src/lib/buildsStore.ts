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

export type NoteAuthor = "customer" | "admin";
export type NoteKind = "initial" | "refinement";

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
    notes?: string; // legacy compiled string (kept for backwards compat)
    notesLog?: NoteItem[]; // canonical structured notes
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
    notes?: string; // legacy
    notesLog?: NoteItem[]; // canonical
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

/**
 * Canonical notes are stored in notesLog.
 * This compiles them into one string for render heuristics + display.
 */
export function compileNotes(notesLog?: NoteItem[], fallback?: string) {
  const log = Array.isArray(notesLog) ? notesLog.filter(Boolean) : [];
  if (log.length) {
    return log
      .map((n) => String(n?.text || "").trim())
      .filter(Boolean)
      .join("\n\n---\n\n");
  }
  return String(fallback || "").trim();
}

/**
 * If older builds only have project.notes (string), migrate them into notesLog on read/update paths.
 * We do this lazily when we create revisions or add/remove notes.
 */
function ensureNotesLog(b: BuildSubmission) {
  const existing = Array.isArray(b.project?.notesLog) ? b.project.notesLog!.filter(Boolean) : [];
  if (existing.length) return existing;

  const legacy = String(b.project?.notes || "").trim();
  if (!legacy) return [];

  const now = new Date().toISOString();
  return [
    {
      noteId: uid(),
      createdAt: now,
      author: "customer" as const,
      kind: "initial" as const,
      text: legacy,
    },
  ];
}

function baseRenders(includeDetail: boolean) {
  const arr: RenderJob[] = [
    { renderId: uid(), view: "iso", status: "queued" },
    { renderId: uid(), view: "front", status: "queued" },
    { renderId: uid(), view: "top", status: "queued" },
  ];
  if (includeDetail) arr.push({ renderId: uid(), view: "detail", status: "queued" });
  return arr;
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

  const initialNotes = String(args.notes || "").trim();
  const notesLog: NoteItem[] = initialNotes
    ? [
        {
          noteId: uid(),
          createdAt: now,
          author: "customer",
          kind: "initial",
          text: initialNotes,
        },
      ]
    : [];

  const versionId = uid();
  const version: BuildVersion = {
    versionId,
    createdAt: now,
    inputsSnapshot: {
      type: args.type,
      dims: args.dims,
      options: args.options,
      notes: initialNotes,
      notesLog,
    },
    renders: baseRenders(false),
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
      notes: initialNotes,
      notesLog,
      refPhotos: [],
    },
    versions: [version],
  };

  upsertBuild(build);
  return build;
}

/**
 * Legacy revision helper (still used elsewhere). Keeps notes and notesLog in sync.
 */
export function addRevision(id: string, customerChangeRequest: string, patch?: Partial<BuildSubmission["project"]>) {
  const b = getBuild(id);
  if (!b) return null;

  const now = new Date().toISOString();
  const mergedProject = { ...b.project, ...(patch || {}) };

  const mergedNotesLog =
    Array.isArray((patch as any)?.notesLog) ? ((patch as any).notesLog as NoteItem[]) : ensureNotesLog({ ...b, project: mergedProject });

  const compiled = compileNotes(mergedNotesLog, mergedProject.notes);

  const version: BuildVersion = {
    versionId: uid(),
    createdAt: now,
    customerChangeRequest,
    inputsSnapshot: {
      type: mergedProject.type,
      dims: mergedProject.dims,
      options: mergedProject.options,
      notes: compiled,
      notesLog: mergedNotesLog,
    },
    renders: baseRenders(true),
  };

  const next: BuildSubmission = {
    ...b,
    updatedAt: now,
    project: { ...mergedProject, notes: compiled, notesLog: mergedNotesLog },
    versions: [version, ...b.versions],
  };

  upsertBuild(next);
  return next;
}

/**
 * Customer adds an additional note chunk (becomes removable later).
 * Creates a new version + re-queues renders automatically.
 */
export function addCustomerNote(id: string, changeRequest: string, noteText: string) {
  const b = getBuild(id);
  if (!b) return null;

  const now = new Date().toISOString();
  const baseLog = ensureNotesLog(b);

  const clean = String(noteText || "").trim();
  const req = String(changeRequest || "").trim();

  if (!clean && !req) return null;

  const nextLog: NoteItem[] = [
    ...baseLog,
    ...(clean
      ? [
          {
            noteId: uid(),
            createdAt: now,
            author: "customer",
            kind: "refinement",
            text: clean,
          } as NoteItem,
        ]
      : []),
  ];

  const compiled = compileNotes(nextLog, b.project.notes);

  const version: BuildVersion = {
    versionId: uid(),
    createdAt: now,
    customerChangeRequest: req || "Customer provided additional details",
    inputsSnapshot: {
      type: b.project.type,
      dims: b.project.dims,
      options: b.project.options,
      notes: compiled,
      notesLog: nextLog,
    },
    renders: baseRenders(true),
  };

  const next: BuildSubmission = {
    ...b,
    updatedAt: now,
    project: { ...b.project, notes: compiled, notesLog: nextLog },
    versions: [version, ...b.versions],
  };

  upsertBuild(next);
  return next;
}

/**
 * Remove a specific customer note item (typically a refinement note).
 * Creates a new version + re-queues renders automatically.
 */
export function removeCustomerNote(id: string, noteId: string, adminReason?: string) {
  const b = getBuild(id);
  if (!b) return null;

  const now = new Date().toISOString();
  const baseLog = ensureNotesLog(b);

  const nid = String(noteId || "").trim();
  if (!nid) return null;

  const removed = baseLog.find((n) => n.noteId === nid) || null;
  const nextLog = baseLog.filter((n) => n.noteId !== nid);

  const compiled = compileNotes(nextLog, "");

  const reason = String(adminReason || "").trim();
  const customerChangeRequest =
    reason ||
    (removed ? `Admin removed customer note: "${String(removed.text || "").slice(0, 60)}${String(removed.text || "").length > 60 ? "…" : ""}"` : "Admin removed a customer note");

  const version: BuildVersion = {
    versionId: uid(),
    createdAt: now,
    customerChangeRequest,
    inputsSnapshot: {
      type: b.project.type,
      dims: b.project.dims,
      options: b.project.options,
      notes: compiled,
      notesLog: nextLog,
    },
    renders: baseRenders(true),
  };

  const next: BuildSubmission = {
    ...b,
    updatedAt: now,
    project: { ...b.project, notes: compiled, notesLog: nextLog },
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
