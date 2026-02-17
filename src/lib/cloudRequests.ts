import {
  arrayUnion,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";

/**
 * MVP Cloud Sync strategy:
 * - Best-effort write to Firestore as a backup + multi-device store.
 * - No auth in this first pass (MVP). You SHOULD add rules later.
 *
 * Documents:
 *   1) rv_requests/{phoneDigits}_{accessCode}_{requestId}
 *   2) rv_requestIndex/{phoneDigits}_{accessCode}
 *        - requestIds: array of requestId strings
 *        - phoneDigits, accessCode (stored for validation + convenience)
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

async function upsertRequestIndex(params: { phone: string; accessCode: string; id: string }) {
  const db = getDb();
  if (!db) return;

  const phoneDigits = digitsOnly(params.phone);
  const code = String(params.accessCode || "").trim();
  const id = String(params.id || "").trim();
  if (!phoneDigits || !code || !id) return;

  const ikey = indexKey({ phone: phoneDigits, accessCode: code });
  const ref = doc(db, "rv_requestIndex", ikey);

  // Merge so we never wipe existing ids
  await setDoc(
    ref,
    {
      _indexKey: ikey,
      phoneDigits,
      accessCode: code,
      requestIds: arrayUnion(id),
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

    // 1) Write the request doc
    await setDoc(ref, { ...request, _cloudKey: key, _syncedAt: new Date().toISOString() }, { merge: true });

    // 2) Upsert index doc so we can list by Phone+Code later
    await upsertRequestIndex({ phone, accessCode, id });

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

    // 1) Read the index doc (GET allowed; LIST blocked)
    const idxId = `${phoneDigits}_${code}`;
    const idxRef = doc(db, "rv_requestIndex", idxId);
    const idxSnap = await getDoc(idxRef);

    if (!idxSnap.exists()) {
      return { ok: true as const, reason: "listed" as const, requests: [] as any[] };
    }

    const idxData: any = idxSnap.data() || {};

    // Your code writes requestIds via arrayUnion(id)
    const ids: string[] = Array.isArray(idxData.requestIds)
      ? idxData.requestIds.map((x: any) => String(x))
      : Array.isArray(idxData.ids) // backward compatible (if any old docs exist)
      ? idxData.ids.map((x: any) => String(x))
      : [];

    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

    // 2) Fetch each request doc by exact doc id (GET allowed)
    //    rv_requests/{phoneDigits}_{accessCode}_{requestId}
    const out: any[] = [];
    for (const id of uniqueIds) {
      const key = cloudKey({ phone: phoneDigits, accessCode: code, id });
      const rref = doc(db, "rv_requests", key);
      const rsnap = await getDoc(rref);
      if (rsnap.exists()) out.push(rsnap.data());
    }

    // newest first
    out.sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));

    return { ok: true as const, reason: "listed" as const, requests: out };
  } catch (e) {
    console.warn("Cloud list failed:", e);
    return { ok: false as const, reason: "error" as const, requests: [] as any[] };
  }

}
