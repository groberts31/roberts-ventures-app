import { readBuilds, writeBuilds, type BuildSubmission } from "./buildsStore";
import { writeSyncStatus } from "./buildsSyncStatus";
import { readBuildsRemote, upsertBuildRemote } from "./buildsRemoteStore";

export function isRemoteBuildsEnabled(): boolean {
  const env = (import.meta as any).env ?? {};
  const vals = [
    env.VITE_FIREBASE_API_KEY,
    env.VITE_FIREBASE_AUTH_DOMAIN,
    env.VITE_FIREBASE_PROJECT_ID,
    env.VITE_FIREBASE_STORAGE_BUCKET,
    env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    env.VITE_FIREBASE_APP_ID,
  ].map((v: any) => String(v ?? "").trim());

  if (vals.some((v: string) => v.length === 0)) return false;
  if (vals.some((v: string) => v.toUpperCase().includes("PASTE_ME"))) return false;
  return true;
}

function t(s: any) {
  const x = Date.parse(String(s || ""));
  return Number.isFinite(x) ? x : 0;
}

export async function syncBuildsFromRemote(): Promise<{ enabled: boolean; pushed: number; pulled: number }> {
  if (!isRemoteBuildsEnabled()) {
    writeSyncStatus({ at: new Date().toISOString(), ok: false, message: "Remote not enabled (env still PASTE_ME or missing)." });
    return { enabled: false, pulled: 0, pushed: 0 };
  }

  let remote: BuildSubmission[] = [];
  try {
    remote = await readBuildsRemote();
  } catch {
    // Remote is enabled but fetch failed (network/config). Don’t break admin UI.
    return { enabled: true, pulled: 0, pushed: 0 };
  }

  const local = readBuilds();

  // Maps for quick lookups
  const R = new Map(remote.map((b) => [String(b.id), b]));
  const L = new Map(local.map((b) => [String(b.id), b]));

  const merged = new Map<string, BuildSubmission>();

  // Start by taking all remote (remote-first baseline)
  for (const [id, b] of R) merged.set(id, b);

  // Merge local on top if it is newer (updatedAt wins)
  let pulled = 0;

  for (const b of local) {
    const id = String(b.id);
    const r0 = R.get(id);

    if (!r0) {
      // local-only record (not on remote yet)
      merged.set(id, b);
      continue;
    }

    // If remote is newer, that means we are "pulling" remote over local
    const chooseLocal = t(b.updatedAt) >= t(r0.updatedAt);
    merged.set(id, chooseLocal ? b : r0);

    if (!chooseLocal) pulled += 1;
  }

  // Count remote-only items as "pulled" (they will be added locally)
  for (const [id] of R) {
    if (!L.has(id)) pulled += 1;
  }

  const next = Array.from(merged.values());
  writeBuilds(next);

  // Push any local-newer (or local-only) items up to remote
  let pushed = 0;
  for (const b of next) {
    const r0 = R.get(String(b.id));
    if (!r0 || t(b.updatedAt) > t(r0.updatedAt)) {
      try {
        await upsertBuildRemote(b);
        pushed++;
      } catch {
        // ignore per-item failures
      }
    }
  }

  return { enabled: true, pulled, pushed };
}
