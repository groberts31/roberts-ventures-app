import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getDb } from "../lib/firebase";
import * as HV from "./homeVisibility";

type AnyVis = any;

function mergeWithDefaults(incoming: AnyVis) {
  const DEFAULT: AnyVis =
    (HV as any).DEFAULT_HOME_VIS ??
    (HV as any).DEFAULT_VIS ??
    {
      splash: true,
      ctas: true,
      quickCards: true,
      twoPanelSplash: true,
    };

  return { ...(DEFAULT || {}), ...(incoming || {}) };
}

// Single doc for site-wide Home visibility
// Collection: rv_siteSettings
// Doc: homeVisibility
function settingsRef() {
  const db = getDb();
  if (!db) return null;
  return doc(db, "rv_siteSettings", "homeVisibility");
}

export async function loadHomeVisibilityFromCloud() {
  try {
    const ref = settingsRef();
    if (!ref) return { ok: false as const, reason: "firebase_not_configured" as const, vis: null as AnyVis };

    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: true as const, reason: "not_found" as const, vis: mergeWithDefaults(null) };

    const data: AnyVis = snap.data() || {};
    return { ok: true as const, reason: "loaded" as const, vis: mergeWithDefaults(data?.vis ?? data) };
  } catch (e) {
    console.warn("loadHomeVisibilityFromCloud failed:", e);
    return { ok: false as const, reason: "error" as const, vis: null as AnyVis };
  }
}

export async function saveHomeVisibilityToCloud(vis: AnyVis) {
  try {
    const ref = settingsRef();
    if (!ref) return { ok: false as const, reason: "firebase_not_configured" as const };

    const merged = mergeWithDefaults(vis);
    await setDoc(
      ref,
      {
        vis: merged,
        _updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return { ok: true as const };
  } catch (e) {
    console.warn("saveHomeVisibilityToCloud failed:", e);
    return { ok: false as const, reason: "error" as const };
  }
}

export function subscribeHomeVisibilityFromCloud(cb: (vis: AnyVis) => void) {
  try {
    const ref = settingsRef();
    if (!ref) return () => {};

    return onSnapshot(
      ref,
      (snap) => {
        const data: AnyVis = snap.data() || {};
        const vis = mergeWithDefaults(data?.vis ?? data);
        cb(vis);
      },
      (err) => {
        console.warn("subscribeHomeVisibilityFromCloud snapshot error:", err);
      }
    );
  } catch (e) {
    console.warn("subscribeHomeVisibilityFromCloud failed:", e);
    return () => {};
  }
}
