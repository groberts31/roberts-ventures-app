// src/admin/adminAudit.ts
// Admin activity audit log (localStorage)

export type AdminAuditEvent = {
  id: string;
  ts: number;
  action: string;
  path?: string;
  detail?: string;
  meta?: Record<string, any>;
};

const KEY = "rv_admin_audit_v1";
const MAX = 500;

function safeParse<T>(v: string | null, d: T): T {
  try {
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
}

export function getAdminAudit(): AdminAuditEvent[] {
  return safeParse(localStorage.getItem(KEY), []);
}

export function clearAdminAudit(): void {
  localStorage.removeItem(KEY);
}

export function addAdminAudit(
  action: string,
  opts?: { path?: string; detail?: string; meta?: Record<string, any> }
) {
  const ev: AdminAuditEvent = {
    id: Date.now() + "_" + Math.random().toString(16).slice(2),
    ts: Date.now(),
    action,
    path: opts?.path,
    detail: opts?.detail,
    meta: opts?.meta,
  };

  const list = getAdminAudit();
  list.unshift(ev);

  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}
