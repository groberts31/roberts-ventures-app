import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import type { BuildSubmission } from "./buildsStore";
import { firebaseConfigured, getDb } from "../data/firestoreClient";

const COL = "buildSubmissions";

export function buildsRemoteEnabled() {
  return firebaseConfigured();
}

function colRef() {
  return collection(getDb(), COL);
}

function docRef(id: string) {
  return doc(getDb(), COL, String(id));
}

export async function readBuildsRemote(): Promise<BuildSubmission[]> {
  const q = query(colRef(), orderBy("createdAt", "desc"), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as BuildSubmission);
}

export function subscribeBuildsRemote(onItems: (items: BuildSubmission[]) => void) {
  const q = query(colRef(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => d.data() as BuildSubmission);
    onItems(items);
  });
}

export async function upsertBuildRemote(build: BuildSubmission) {
  await setDoc(
    docRef(build.id),
    {
      ...build,
      _updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteBuildRemote(id: string) {
  await deleteDoc(docRef(id));
}

export async function clearAllRemote(ids: string[]) {
  const batch = writeBatch(getDb());
  for (const id of ids) batch.delete(docRef(id));
  await batch.commit();
}

export async function bulkDeleteRemote(ids: string[]) {
  const batch = writeBatch(getDb());
  for (const id of ids) batch.delete(docRef(id));
  await batch.commit();
}

export async function bulkStatusRemote(ids: string[], status: BuildSubmission["status"]) {
  const batch = writeBatch(getDb());
  const nowIso = new Date().toISOString();
  for (const id of ids) {
    batch.set(
      docRef(id),
      {
        status,
        updatedAt: nowIso,
        _updatedAtServer: serverTimestamp(),
      },
      { merge: true }
    );
  }
  await batch.commit();
}
