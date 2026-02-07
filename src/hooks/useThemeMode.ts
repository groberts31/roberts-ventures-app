import { useEffect } from "react";

/**
 * Auto theme mode:
 * - Stay Lit routes => dark theme
 * - Everything else => light theme
 *
 * Applies:
 *   <html data-theme="dark|light">
 * so we can style text/background consistently across the entire site.
 */
export default function useThemeMode(isDark: boolean) {
  useEffect(() => {
    const el = document.documentElement; // <html>
    el.setAttribute("data-theme", isDark ? "dark" : "light");
    return () => {
      // keep whatever last mode was; no cleanup needed
    };
  }, [isDark]);
}
