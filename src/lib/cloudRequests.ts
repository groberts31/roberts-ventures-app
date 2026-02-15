import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";

/**
 * MVP Cloud Sync strategy (No Auth):
 * - Writes full request docs to: rv_requests/{phoneDigits}_{accessCode}_{requestId}
 * - Writes an index doc (for listing without collection queries):
 *     rv_requestIndex/{phoneDigits}_{accessCode}
 *   which stores: { ids: [<rv_requests docId>, ...] }
 *
 * This allows:
 * - CustomerPortal: GET index doc (not list), then GET each request doc (not list)
 * - Firestore rules can keep: "allow list: if false" on rv_requests
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

function indexKey(params: { phone: string; accessCode: string }) {
  const phoneDigits = digitsOnly(params.phone);
  const code = String(params.accessCode || "").trim();
  return `${phoneDigits}_${code}`;
}

async function upsertIndex(params: { phone: string; accessCode: string; docId: string }) {
  const db = getDb();
  if (!db) return;

  const idx = indexKey(params);
  const idxRef = doc(db, "rv_requestIndex", idx);

  // Add docId to ids[] (idempotent)
  await setDoc(
    idxRef,
    {
      phoneDigits: digitsOnly(params.phone),
      accessCode: String(params.accessCode || "").trim(),
      ids: arrayUnion(String(params.docId)),
      _updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
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

    // Update listing index (so CustomerPortal can fetch without LIST)
    await upsertIndex({ phone, accessCode, docId: key });

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
 * List requests from cloud for a given Phone + Access Code WITHOUT LIST queries.
 * Strategy:
 *  1) GET index doc: rv_requestIndex/{phoneDigits}_{accessCode}
 *  2) For each id in ids[], GET rv_requests/{id}
 */
export async function listRequestsFromCloud(params: { phone: string; accessCode: string }) {
  try {
    const db = getDb();
    if (!db) return { ok: false as const, reason: "firebase_not_configured" as const, requests: [] as any[] };

    const phoneDigits = digitsOnly(params.phone);
    const code = String(params.accessCode || "").trim();
    if (!phoneDigits || !code) return { ok: false as const, reason: "missing_fields" as const, requests: [] as any[] };

    const idx = indexKey({ phone: phoneDigits, accessCode: code });
    const idxRef = doc(db, "rv_requestIndex", idx);
    const idxSnap = await getDoc(idxRef);

    if (!idxSnap.exists()) return { ok: true as const, reason: "listed" as const, requests: [] as any[] };

    const data: any = idxSnap.data() || {};
    const ids: string[] = Array.isArray(data.ids) ? data.ids.map((x: any) => String(x)).filter(Boolean) : [];

    if (ids.length === 0) return { ok: true as const, reason: "listed" as const, requests: [] as any[] };

    const docs = await Promise.all(
      ids.slice(0, 250).map(async (docId) => {
        try {
          const rref = doc(db, "rv_requests", docId);
          const rsnap = await getDoc(rref);
          return rsnap.exists() ? rsnap.data() : null;
        } catch {
          return null;
        }
      })
    );

    return { ok: true as const, reason: "listed" as const, requests: docs.filter(Boolean) as any[] };
  } catch (e) {
    console.warn("Cloud list failed:", e);
    return { ok: false as const, reason: "error" as const, requests: [] as any[] };
  }
}
