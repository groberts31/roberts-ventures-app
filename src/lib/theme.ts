export type ThemeMode = "light" | "dark";

const KEY = "rv_theme";

export function applyTheme(mode: ThemeMode) {
  // Put theme on <html data-theme="..."> since your CSS uses html[data-theme="dark"]
  document.documentElement.setAttribute("data-theme", mode);
}

export function getActiveTheme(): ThemeMode {
  const v = (localStorage.getItem(KEY) || "").toLowerCase();
  if (v === "dark" || v === "light") return v as ThemeMode;

  // Default: follow system preference
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function setTheme(mode: ThemeMode): ThemeMode {
  localStorage.setItem(KEY, mode);
  applyTheme(mode);
  return mode;
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getActiveTheme() === "dark" ? "light" : "dark";
  return setTheme(next);
}

// Call once on startup (main.tsx) so the page loads in correct mode immediately
export function initTheme() {
  applyTheme(getActiveTheme());
}
