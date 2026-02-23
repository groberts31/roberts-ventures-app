import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_VIS,
  MAIN_LINKS,
  SUB_LINKS,
  type MainNavKey,
  type NavVisibility,
  type SubNavKey,
  readNavVisibility,
  writeNavVisibility,
  notifyNavVisibilityChanged,
} from "../../config/navVisibility";
import {
  loadNavVisibilityFromCloud,
  saveNavVisibilityToCloud,
  subscribeNavVisibilityFromCloud,
} from "../../config/navVisibilityCloud";

/**
 * Admin Navbar Visibility Controls
 * - Controls BOTH navbars:
 *   1) Main Navbar (top)
 *   2) SubNavbar (second navbar)
 *
 * Persists locally (localStorage) AND syncs to Firestore when configured.
 * When re-enabled, links automatically appear back in original order.
 */

function sameVis(a: NavVisibility, b: NavVisibility) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export default function AdminNavbar() {
  const [vis, setVis] = useState<NavVisibility>(() => {
    try {
      return readNavVisibility();
    } catch {
      return DEFAULT_VIS;
    }
  });

  // Prevent "echo" loops when snapshot updates immediately after we save
  const lastCloudApplied = useRef<string>("");

  // Load from cloud on mount (best effort) + subscribe for live changes
  useEffect(() => {
    let unsub: null | (() => void) = null;

    (async () => {
      const res = await loadNavVisibilityFromCloud();
      if (res.ok) {
        const json = JSON.stringify(res.vis);
        lastCloudApplied.current = json;

        setVis(res.vis);
        writeNavVisibility(res.vis);
        notifyNavVisibilityChanged();
      }
    })();

    unsub = subscribeNavVisibilityFromCloud((incoming) => {
      const json = JSON.stringify(incoming);

      // If this is exactly what we just applied, ignore
      if (json && json === lastCloudApplied.current) return;

      lastCloudApplied.current = json;

      // Only update state if it actually changed
      setVis((prev) => (sameVis(prev, incoming) ? prev : incoming));
      writeNavVisibility(incoming);
      notifyNavVisibilityChanged();
    });

    return () => {
      try {
        unsub?.();
      } catch {
        // ignore
      }
    };
  }, []);

  // Whenever vis changes, persist local + notify navbar, then push to cloud (best effort)
  useEffect(() => {
    writeNavVisibility(vis);
    notifyNavVisibilityChanged();

    (async () => {
      const res = await saveNavVisibilityToCloud(vis);
      if (res.ok) {
        lastCloudApplied.current = JSON.stringify(vis);
      }
    })();
  }, [vis]);

  const mainRows = useMemo(() => MAIN_LINKS, []);
  const subRows = useMemo(() => SUB_LINKS, []);

  const toggleMain = (key: MainNavKey) => {
    setVis((prev) => ({ ...prev, main: { ...prev.main, [key]: !prev.main[key] } }));
  };

  const toggleSub = (key: SubNavKey) => {
    setVis((prev) => ({ ...prev, sub: { ...prev.sub, [key]: !prev.sub[key] } }));
  };

  const showAllMain = () => setVis((prev) => ({ ...prev, main: { ...DEFAULT_VIS.main } }));
  const hideAllMain = () =>
    setVis((prev) => ({
      ...prev,
      main: Object.fromEntries(Object.keys(prev.main).map((k) => [k, false])) as NavVisibility["main"],
    }));

  const showAllSub = () => setVis((prev) => ({ ...prev, sub: { ...DEFAULT_VIS.sub } }));
  const hideAllSub = () =>
    setVis((prev) => ({
      ...prev,
      sub: Object.fromEntries(Object.keys(prev.sub).map((k) => [k, false])) as NavVisibility["sub"],
    }));

  return (
    <div className="stack page" style={{ gap: 14, maxWidth: 980, margin: "0 auto" }}>
      <section className="panel card" style={{ display: "grid", gap: 10 }}>
        <div className="h2" style={{ margin: 0 }}>Navbar Visibility</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          Toggle links on/off. Saved locally and synced to Firebase (when configured).
        </div>
      </section>

      {/* MAIN NAVBAR */}
      <section className="panel card" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div className="h3" style={{ margin: 0 }}>Main Navbar</div>
            <div className="muted" style={{ fontWeight: 850 }}>
              Top bar (Home / Services / Schedule / Cart / Stay Lit / Profile).
            </div>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" onClick={hideAllMain} style={{ fontWeight: 950 }}>Hide All</button>
            <button type="button" className="btn btn-primary" onClick={showAllMain} style={{ fontWeight: 950 }}>Show All</button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {mainRows.map((it) => {
            const enabled = vis.main[it.key];
            return (
              <div
                key={it.key}
                className="panel"
                style={{
                  padding: 12,
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{it.label}</div>
                  <div className="muted" style={{ fontWeight: 850 }}>
                    Key: <code>{it.key}</code>
                  </div>
                </div>

                <button
                  type="button"
                  className={enabled ? "btn btn-primary" : "btn btn-ghost"}
                  onClick={() => toggleMain(it.key)}
                  style={{ fontWeight: 950, minWidth: 120 }}
                  title={enabled ? "Click to hide" : "Click to show"}
                >
                  {enabled ? "Visible" : "Hidden"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SUB NAVBAR */}
      <section className="panel card" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div className="h3" style={{ margin: 0 }}>Second Navbar (SubNavbar)</div>
            <div className="muted" style={{ fontWeight: 850 }}>
              Smaller bar under main navbar (About / Portfolio / Reviews / FAQ / Service Area / Policies).
            </div>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" onClick={hideAllSub} style={{ fontWeight: 950 }}>Hide All</button>
            <button type="button" className="btn btn-primary" onClick={showAllSub} style={{ fontWeight: 950 }}>Show All</button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {subRows.map((it) => {
            const enabled = vis.sub[it.key];
            return (
              <div
                key={it.key}
                className="panel"
                style={{
                  padding: 12,
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{it.label}</div>
                  <div className="muted" style={{ fontWeight: 850 }}>
                    Key: <code>{it.key}</code>
                  </div>
                </div>

                <button
                  type="button"
                  className={enabled ? "btn btn-primary" : "btn btn-ghost"}
                  onClick={() => toggleSub(it.key)}
                  style={{ fontWeight: 950, minWidth: 120 }}
                  title={enabled ? "Click to hide" : "Click to show"}
                >
                  {enabled ? "Visible" : "Hidden"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
