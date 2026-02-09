export type SyncStatus = {
  at: string;
  ok: boolean;
  message: string;
};

const KEY = "rv_builds_sync_status_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readSyncStatus(): SyncStatus | null {
  return safeParse<SyncStatus | null>(localStorage.getItem(KEY), null);
}

export function writeSyncStatus(status: SyncStatus) {
  localStorage.setItem(KEY, JSON.stringify(status));
}

export function clearSyncStatus() {
  localStorage.removeItem(KEY);
}
