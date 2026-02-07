export type RVRequestStatus = "new" | "in_progress" | "complete";

export type RVPhoto = { name: string; type: string; dataUrl: string };

export type RVRequest = {
  id: string;
  createdAt: string;
  appointmentStart: string;
  accessCode?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  items: Array<{ serviceId: string; qty: number; note: string }>;
  photos: RVPhoto[];
  status: RVRequestStatus;
};

const KEY = "rv_requests";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return (v ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function readAllRequests(): RVRequest[] {
  const arr = safeParse<any[]>(localStorage.getItem(KEY), []);
  return Array.isArray(arr) ? (arr as RVRequest[]).filter(Boolean) : [];
}

export function findRequestById(id: string): RVRequest | undefined {
  const all = readAllRequests();
  return all.find((r) => String((r as any)?.id ?? "") === String(id));
}

function normalizePhone(p: string) {
  return String(p || "").replace(/\D+/g, "");
}

function normalizeName(name: string) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function findRequestsByNameAndPhone(name: string, phone: string): RVRequest[] {
  const n = normalizeName(name);
  const p = normalizePhone(phone);
  if (!n || !p) return [];
  return readAllRequests().filter((r) => {
    const rn = normalizeName(r?.customer?.name || "");
    const rp = normalizePhone(r?.customer?.phone || "");
    return rn === n && rp === p;
  });
}

export function findRequestsByPhone(phone: string): RVRequest[] {
  const target = normalizePhone(phone);
  if (!target) return [];
  return readAllRequests().filter((r) => normalizePhone(r?.customer?.phone || "") === target);
}

function normalizeCode(c: string) {
  return String(c || "").trim().toLowerCase();
}

export function findRequestsByPhoneAndCode(phone: string, code: string): RVRequest[] {
  const targetPhone = normalizePhone(phone);
  const targetCode = normalizeCode(code);
  if (!targetPhone || !targetCode) return [];
  return readAllRequests().filter((r) => {
    const rp = normalizePhone(r?.customer?.phone || "");
    const rc = normalizeCode((r as any)?.accessCode || "");
    return rp === targetPhone && rc === targetCode;
  });
}
