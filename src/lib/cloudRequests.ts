import { doc, getDoc, setDoc } from "firebase/firestore";
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
