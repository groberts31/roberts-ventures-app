export type BackupEvent = {
  id: string;
  createdAt: string;
  kind: string;
  detail?: string;
};

const KEY = "rv_backup_events";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function uid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (crypto as any).randomUUID?.() ?? (Math.random().toString(16).slice(2) + Date.now().toString(16));
}

export function readBackupEvents(): BackupEvent[] {
  const arr = safeParse<BackupEvent[]>(localStorage.getItem(KEY), []);
  return Array.isArray(arr) ? arr : [];
}

export function addBackupEvent(kind: string, detail?: string) {
  const all = readBackupEvents();
  all.unshift({ id: uid(), createdAt: new Date().toISOString(), kind, detail });
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 500)));
}

export function clearBackupEvents() {
  localStorage.setItem(KEY, "[]");
}
