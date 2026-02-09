const KEY = "rv_admin_session_v1";

export function isAdminAuthed(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // session expires after 12 hours
    return Boolean(data?.ok) && typeof data?.exp === "number" && Date.now() < data.exp;
  } catch {
    return false;
  }
}

export function setAdminAuthed(): void {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  localStorage.setItem(KEY, JSON.stringify({ ok: true, exp }));
}

export function clearAdminAuthed(): void {
  localStorage.removeItem(KEY);
}
