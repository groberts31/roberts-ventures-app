import { collection, doc, documentId, endAt, getDoc, getDocs, orderBy, query, setDoc, startAt } from "firebase/firestore";
import { getDb } from "./firebase";

/**
 * MVP Cloud Sync strategy:
 * - Best-effort write to Firestore as a backup + multi-device store.
 * - No auth in this first pass (MVP). You SHOULD add rules later.
 *
 * Document key:
 *   rv_requests/{phoneDigits}_{accessCode}_{requestId}
 *
 * This allows looking up by phone+accessCode+id later.
 * (We can also add a phone+accessCode index doc later if you want list browsing.)
 */

function digitsOnly(s: string) {
  return String(s || "").replace(/\D+/g, "");
}

export function cloudKey(params: { phone: string; accessCode: string; id: string }) {
  const phoneDigits = digitsOnly(params.phone);
  const code = String(params.accessCode || "").trim();
  const id = String(params.id || "").trim();
  return `${phoneDigits}_${code}_${id}`;
}

export async function saveRequestToCloud(request: any) {
  try {
    const db = getDb();
    if (!db) return { ok: false, reason: "firebase_not_configured" as const };

    const phone = String(request?.customer?.phone || "");
    const accessCode = String(request?.accessCode || "");
    const id = String(request?.id || "");

    if (!phone || !accessCode || !id) return { ok: false, reason: "missing_fields" as const };

    const key = cloudKey({ phone, accessCode, id });
    const ref = doc(db, "rv_requests", key);

    // Write full request as stored record
    await setDoc(ref, { ...request, _cloudKey: key, _syncedAt: new Date().toISOString() }, { merge: true });

    return { ok: true as const, key };
  } catch (e) {
    console.warn("Cloud save failed:", e);
    return { ok: false, reason: "error" as const };
  }
}

export async function loadRequestFromCloud(params: { phone: string; accessCode: string; id: string }) {
  try {
    const db = getDb();
    if (!db) return { ok: false, reason: "firebase_not_configured" as const, request: null };

    const key = cloudKey(params);
    const ref = doc(db, "rv_requests", key);
    const snap = await getDoc(ref);

    if (!snap.exists()) return { ok: false, reason: "not_found" as const, request: null };

    return { ok: true as const, reason: "loaded" as const, request: snap.data() };
  } catch (e) {
    console.warn("Cloud load failed:", e);
    return { ok: false, reason: "error" as const, request: null };
  }
}

/**
 * List requests from cloud for a given Phone + Access Code.
 * Uses docId prefix search on:  rv_requests/{phoneDigits}_{accessCode}_{requestId}
 */
export async function listRequestsFromCloud(params: { phone: string; accessCode: string }) {
  try {
    const db = getDb();
    if (!db) return { ok: false as const, reason: "firebase_not_configured" as const, requests: [] as any[] };

    const phoneDigits = digitsOnly(params.phone);
    const code = String(params.accessCode || "").trim();
    if (!phoneDigits || !code) return { ok: false as const, reason: "missing_fields" as const, requests: [] as any[] };

    const prefix = `${phoneDigits}_${code}_`;

    // Prefix range: [prefix, prefix + "\uf8ff"]
    const q = query(
      collection(db, "rv_requests"),
      orderBy(documentId()),
      startAt(prefix),
      endAt(prefix + "\uf8ff")
    );

    const snap = await getDocs(q);
    const out: any[] = [];
    snap.forEach((d) => out.push(d.data()));
    return { ok: true as const, reason: "listed" as const, requests: out };
  } catch (e) {
    console.warn("Cloud list failed:", e);
    return { ok: false as const, reason: "error" as const, requests: [] as any[] };
  }
}

