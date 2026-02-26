// src/lib/cloudSiteConfig.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";

export type SiteConfigDocId = "navVisibility" | "homeVisibility" | "catalogOverrides" | "adminDashboardUI";

function nowIso() {
  return new Date().toISOString();
}

export async function loadSiteConfig<T>(
  id: SiteConfigDocId
): Promise<{ ok: true; data: T } | { ok: false; reason: string }> {
  try {
    const db = getDb();
    if (!db) return { ok: false, reason: "firebase_not_configured" };

    const ref = doc(db, "siteConfig", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: false, reason: "not_found" };

    return { ok: true, data: snap.data() as T };
  } catch (e: any) {
    console.warn("loadSiteConfig failed:", e);
    return { ok: false, reason: "error" };
  }
}

export async function saveSiteConfig<T extends Record<string, any>>(
  id: SiteConfigDocId,
  payload: T
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const db = getDb();
    if (!db) return { ok: false, reason: "firebase_not_configured" };

    const ref = doc(db, "siteConfig", id);
    await setDoc(ref, { ...payload, _updatedAt: nowIso() }, { merge: true });

    return { ok: true };
  } catch (e: any) {
    console.warn("saveSiteConfig failed:", e);
    return { ok: false, reason: "error" };
  }
}
