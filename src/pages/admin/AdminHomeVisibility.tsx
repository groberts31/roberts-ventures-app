import { useEffect, useMemo, useState } from "react";
/**
 * Admin Home Visibility Controls
 * - Uses the shared homeVisibility config (whatever it exports)
 * - We import it as a namespace so we DON'T break when exports evolve.
 */
import * as HV from "../../config/homeVisibility";

type AnyVis = any;

export default function AdminHomeVisibility() {
  // Pull defaults + read/write helpers from the config if present.
  const DEFAULT: AnyVis =
    (HV as any).DEFAULT_HOME_VIS ??
    (HV as any).DEFAULT_VIS ??
    {
      // fallback (only used if config is missing exports)
      splash: true,
      ctas: true,
      quickCards: true,
      twoPanelSplash: true,
    };

  const read: (() => AnyVis) =
    (HV as any).readHomeVisibility ??
    (HV as any).readVisibility ??
    (() => DEFAULT);

  const write: ((v: AnyVis) => void) =
    (HV as any).writeHomeVisibility ??
    (HV as any).writeVisibility ??
    (() => {});

  const notify: (() => void) =
    (HV as any).notifyHomeVisibilityChanged ??
    (HV as any).notifyVisibilityChanged ??
    (() => {});

  // List of toggles to render (try to use config-provided list; otherwise infer from DEFAULT)
  const ROWS = useMemo(() => {
    const provided = (HV as any).HOME_TOGGLES || (HV as any).HOME_ROWS || null;
    if (Array.isArray(provided) && provided.length) return provided;
    // fallback: build from keys in DEFAULT
    return Object.keys(DEFAULT).map((k) => ({ key: k, label: k }));
  }, [DEFAULT]);

  const [vis, setVis] = useState<AnyVis>(() => {
    try {
      return read();
    } catch {
      return DEFAULT;
    }
  });

  // persist on change
  useEffect(() => {
    try {
      write(vis);
      notify();
    } catch {
      // ignore
    }
  }, [vis]);

  const toggleKey = (key: string) => {
    setVis((prev: AnyVis) => ({ ...(prev || {}), [key]: !(prev && prev[key]) }));
  };

  const hideAll = () => {
    const nextObj: AnyVis = {};
    for (const r of ROWS) nextObj[String(r.key)] = false;
    setVis(nextObj);
  };

  const showAll = () => {
    // Prefer DEFAULT for “proper spot when re-enabled” behavior
    setVis({ ...(DEFAULT || {}) });
  };

  return (
    <div className="stack page" style={{ gap: 14, maxWidth: 980, margin: "0 auto" }}>
      {/* Back button (requested on all admin pages) */}
<section className="panel card" style={{ display: "grid", gap: 10 }}>
        <div className="h2" style={{ margin: 0 }}>Home Page Visibility</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          Toggle what shows on the Home page (splash/hero, CTA buttons, and sections/cards below).
          When re-enabled, items render back in their original order because the Home page keeps its layout —
          we only hide/show blocks.
        </div>
      </section>

      <section className="panel card" style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div className="h3" style={{ margin: 0 }}>Controls</div>
            <div className="muted" style={{ fontWeight: 850 }}>
              These settings are stored locally (and can later be wired to Firestore for cross-device).
            </div>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" onClick={hideAll} style={{ fontWeight: 950 }}>
              Hide All
            </button>
            <button type="button" className="btn btn-primary" onClick={showAll} style={{ fontWeight: 950 }}>
              Show All
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {ROWS.map((it: any) => {
            const key = String(it.key);
            const label = String(it.label || it.key);
            const enabled = Boolean(vis && vis[key]);

            return (
              <div
                key={key}
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
                  <div style={{ fontWeight: 950, color: "#0f172a" }}>{label}</div>
                  <div className="muted" style={{ fontWeight: 850 }}>
                    Key: <code>{key}</code>
                  </div>
                </div>

                <button
                  type="button"
                  className={enabled ? "btn btn-primary" : "btn btn-ghost"}
                  onClick={() => toggleKey(key)}
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

      <section className="panel card" style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 950, color: "#0f172a" }}>Notes</div>
        <div className="muted" style={{ fontWeight: 850 }}>
          If you don’t see changes immediately, it usually means the Home page isn’t reading the visibility hook yet.
          Once Home uses <code>useHomeVisibility()</code>, these switches will control it.
        </div>
      </section>
    </div>
  );
}
