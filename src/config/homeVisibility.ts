/**
 * Home Page Visibility Controls
 * Used by:
 *  - Home.tsx (show/hide sections)
 *  - AdminHomeVisibility.tsx (admin toggles)
 */

export const STORAGE_KEY = "rv_home_visibility_v1";

/** Toggle rows shown in Admin UI */
export const HOME_TOGGLES = [
  { key: "splash", label: "Hero / Splash Section" },
  { key: "ctas", label: "Hero CTA Buttons" },
  { key: "quickCards", label: "Hero Trust Cards" },
  { key: "twoPanelSplash", label: "Two-Panel Services / Stay Lit Section" },
] as const;

export type HomeToggleKey = (typeof HOME_TOGGLES)[number]["key"];

export type HomeVisibility = Record<HomeToggleKey, boolean>;

export const DEFAULT_HOME_VIS: HomeVisibility = {
  splash: true,
  ctas: true,
  quickCards: true,
  twoPanelSplash: true,
};

export function readHomeVisibility(): HomeVisibility {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOME_VIS;
    return { ...DEFAULT_HOME_VIS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HOME_VIS;
  }
}

export function writeHomeVisibility(vis: HomeVisibility) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vis));
}

export function notifyHomeVisibilityChanged() {
  window.dispatchEvent(new Event("rv_home_visibility_changed"));
}

import { useEffect, useState } from "react";

/** React hook for Home.tsx */
export function useHomeVisibility(): HomeVisibility {
  const [vis, setVis] = useState<HomeVisibility>(() => readHomeVisibility());

  useEffect(() => {
    const sync = () => setVis(readHomeVisibility());
    window.addEventListener("storage", sync);
    window.addEventListener("rv_home_visibility_changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("rv_home_visibility_changed", sync);
    };
  }, []);

  return vis;
}
