import { readBuilds, writeBuilds, type BuildSubmission } from "./buildsStore";
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
  if (!isRemoteBuildsEnabled()) return { enabled: false, pulled: 0, pushed: 0 };

  let remote: BuildSubmission[] = [];
  try {
    remote = await readBuildsRemote();
  } catch {
    return { enabled: true, pulled: 0, pushed: 0 };
  }

  const local = readBuilds();
  const R = new Map(remote.map((b) => [String(b.id), b]));
  const merged = new Map<string, BuildSubmission>();

  for (const [id, b] of R) merged.set(id, b);

  for (const b of local) {
    const id = String(b.id);
    const r0 = R.get(id);
    if (!r0) {
      merged.set(id, b);
      continue;
    }
    merged.set(id, t(b.updatedAt) >= t(r0.updatedAt) ? b : r0);
  }

  const next = Array.from(merged.values());
  writeBuilds(next);

  let pushed = 0;
  for (const b of next) {
    const r0 = R.get(String(b.id));
    if (!r0 || t(b.updatedAt) > t(r0.updatedAt)) {
      try {
        await upsertBuildRemote(b);
        pushed++;
      } catch {}
    }
  }

  return { enabled: true, pulled: 0, pushed };
}
