import { addBackupEvent } from "./backupStore";
import { readBuilds, writeBuilds, type BuildSubmission } from "./buildsStore";
import { readBuildsRemote } from "./buildsRemoteStore";
import { isRemoteBuildsEnabled, syncBuildsFromRemote } from "./buildsSync";

export function backupRemoteEnabled(): boolean {
  return isRemoteBuildsEnabled();
}

/**
 * Backup Now:
 * - Runs the existing sync logic (merge + push newer to Firebase).
 * - Logs a backup event locally.
 */
export async function backupNow(): Promise<{ enabled: boolean; pushed: number; pulled: number; localCount: number }> {
  const localCount = readBuilds().length;

  if (!backupRemoteEnabled()) {
    addBackupEvent("backup_skipped", "Remote builds not enabled (Firebase env not set).");
    return { enabled: false, pushed: 0, pulled: 0, localCount };
  }

  const res = await syncBuildsFromRemote();

  addBackupEvent(
    "backup_now",
    `enabled=${res.enabled} pushed=${res.pushed} pulled=${res.pulled} localCount=${localCount}`
  );

  return { ...res, localCount };
}

/**
 * Restore From Cloud:
 * - Reads builds from Firebase.
 * - Overwrites localStorage builds with the remote snapshot.
 * - Logs a restore event locally.
 *
 * Safety note:
 * - This overwrites LOCAL builds. Cloud is treated as source-of-truth for restore.
 */
export async function restoreFromCloud(): Promise<{ enabled: boolean; pulledCount: number }> {
  if (!backupRemoteEnabled()) {
    addBackupEvent("restore_skipped", "Remote builds not enabled (Firebase env not set).");
    return { enabled: false, pulledCount: 0 };
  }

  let remote: BuildSubmission[] = [];
  try {
    remote = await readBuildsRemote();
  } catch (e: any) {
    addBackupEvent("restore_failed", String(e?.message || e || "Failed to read remote builds"));
    throw e;
  }

  writeBuilds(remote);

  addBackupEvent("restore_from_cloud", `pulledCount=${remote.length}`);

  return { enabled: true, pulledCount: remote.length };
}

/**
 * Local snapshot export helper (optional use in UI).
 */
export function exportLocalBuilds(): BuildSubmission[] {
  return readBuilds();
}
