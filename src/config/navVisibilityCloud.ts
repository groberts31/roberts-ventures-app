import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfigured, getDb } from "../data/firestoreClient";
import { DEFAULT_VIS, mergeNavVisibility, type NavVisibility } from "./navVisibility";

/**
 * Cloud sync for Navbar visibility (Firestore)
 *
 * - Stores a single doc that contains the visibility map.
 * - Any admin device can update it.
 * - Any client device can subscribe to it.
 *
 * NOTE: This assumes Firestore rules will restrict writes to admins.
 */

const COLLECTION = "rv_config";
const DOC_ID = "navVisibility";

function navDocRef() {
  const db = getDb();
  return doc(db, COLLECTION, DOC_ID);
}

export async function loadNavVisibilityFromCloud(): Promise<
  | { ok: true; vis: NavVisibility }
  | { ok: false; reason: "firebase_not_configured" | "not_found" | "failed" }
> {
  try {
    if (!firebaseConfigured()) return { ok: false, reason: "firebase_not_configured" };

    const snap = await getDoc(navDocRef());
    if (!snap.exists()) return { ok: false, reason: "not_found" };

    const data: any = snap.data() || {};
    const incoming = data?.visibility ?? data; // allow either shape
    const vis = mergeNavVisibility(DEFAULT_VIS, incoming);

    return { ok: true, vis };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function saveNavVisibilityToCloud(vis: NavVisibility): Promise<
  | { ok: true }
  | { ok: false; reason: "firebase_not_configured" | "failed" }
> {
  try {
    if (!firebaseConfigured()) return { ok: false, reason: "firebase_not_configured" };

    await setDoc(
      navDocRef(),
      {
        visibility: mergeNavVisibility(DEFAULT_VIS, vis),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export function subscribeNavVisibilityFromCloud(onVis: (vis: NavVisibility) => void): (() => void) | null {
  try {
    if (!firebaseConfigured()) return null;

    const unsub = onSnapshot(navDocRef(), (snap) => {
      if (!snap.exists()) return;
      const data: any = snap.data() || {};
      const incoming = data?.visibility ?? data;
      const vis = mergeNavVisibility(DEFAULT_VIS, incoming);
      onVis(vis);
    });

    return unsub;
  } catch {
    return null;
  }
}
