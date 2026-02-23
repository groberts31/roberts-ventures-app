/**
 * Navbar Visibility (local storage)
 * - Used by Navbar.tsx + SubNavbar.tsx
 * - Admin page can toggle these keys
 */

export const STORAGE_KEY = "rv_nav_visibility_v1";

/** Keys (must match what AdminNavbar uses) */
export const MAIN_LINKS = [
  { key: "home", label: "Home" },
  { key: "services", label: "Services" },
  { key: "schedule", label: "Schedule" },
  { key: "cart", label: "Cart" },
  { key: "staylit", label: "Stay Lit" },
  { key: "profile", label: "Profile" },
] as const;

export const SUB_LINKS = [
  { key: "about", label: "About" },
  { key: "portfolio", label: "Portfolio" },
  { key: "reviews", label: "Reviews" },
  { key: "faq", label: "FAQ" },
  { key: "serviceArea", label: "Service Area" },
  { key: "policies", label: "Policies" },
  { key: "profile", label: "Profile" },
] as const;

export type MainNavKey = (typeof MAIN_LINKS)[number]["key"];
export type SubNavKey = (typeof SUB_LINKS)[number]["key"];

export type NavVisibility = {
  main: Record<MainNavKey, boolean>;
  sub: Record<SubNavKey, boolean>;
};

export const DEFAULT_VIS: NavVisibility = {
  main: {
    home: true,
    services: true,
    schedule: true,
    cart: true,
    staylit: true,
    profile: true,
  },
  sub: {
    about: true,
    portfolio: true,
    reviews: true,
    faq: true,
    serviceArea: true,
    policies: true,
    profile: true,
  },
};

export function mergeNavVisibility(base: NavVisibility, incoming: any): NavVisibility {
  return {
    main: { ...base.main, ...(incoming?.main || {}) },
    sub: { ...base.sub, ...(incoming?.sub || {}) },
  };
}

export function readNavVisibility(): NavVisibility {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VIS;
    const parsed = JSON.parse(raw);
    return mergeNavVisibility(DEFAULT_VIS, parsed);
  } catch {
    return DEFAULT_VIS;
  }
}

export function writeNavVisibility(vis: NavVisibility) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergeNavVisibility(DEFAULT_VIS, vis)));
  } catch {
    // ignore
  }
}

/**
 * Convenience helper (what Navbar/SubNavbar should import)
 */
export function getNavVisibility(): NavVisibility {
  return readNavVisibility();
}

import { useEffect, useState } from "react";

/**
 * React hook: always returns the latest visibility.
 * - Listens to "storage" (cross-tab) + a custom event for same-tab updates.
 */
export function useNavVisibility(): NavVisibility {
  const [vis, setVis] = useState<NavVisibility>(() => {
    try {
      return readNavVisibility();
    } catch {
      return DEFAULT_VIS;
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setVis(readNavVisibility());
    };

    const onCustom = () => setVis(readNavVisibility());

    window.addEventListener("storage", onStorage);
    window.addEventListener("rv_nav_visibility_changed", onCustom as any);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("rv_nav_visibility_changed", onCustom as any);
    };
  }, []);

  return vis;
}

/**
 * Call this after writeNavVisibility() to update the current tab immediately.
 */
export function notifyNavVisibilityChanged() {
  try {
    window.dispatchEvent(new Event("rv_nav_visibility_changed"));
  } catch {
    // ignore
  }
}
