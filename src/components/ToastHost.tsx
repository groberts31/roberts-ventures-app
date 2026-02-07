import { useEffect, useMemo, useRef, useState } from "react";

type ToastVariant = "info" | "success" | "warning" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
  durationMs: number;
};

function makeId() {
  return (crypto as any).randomUUID?.() ?? (Math.random().toString(16).slice(2) + Date.now().toString(16));
}

export type ToastEventDetail = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

const EVENT_NAME = "rv_toast";

export function emitToast(detail: ToastEventDetail) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

function iconFor(v: ToastVariant) {
  if (v === "success") return "✅";
  if (v === "warning") return "⚠️";
  if (v === "error") return "⛔";
  return "ℹ️";
}

function labelFor(v: ToastVariant) {
  if (v === "success") return "Success";
  if (v === "warning") return "Heads up";
  if (v === "error") return "Error";
  return "Info";
}

// Accent colors (kept subtle + readable)
function accentFor(v: ToastVariant) {
  if (v === "success") return "rgba(16,185,129,0.55)";
  if (v === "warning") return "rgba(245,158,11,0.60)";
  if (v === "error") return "rgba(239,68,68,0.60)";
  return "rgba(59,130,246,0.55)";
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const rafRef = useRef<number | null>(null);

  const styles = useMemo(() => {
    const wrapper: React.CSSProperties = {
      position: "fixed",
      top: 14,
      right: 14,
      zIndex: 9999,
      display: "grid",
      gap: 10,
      pointerEvents: "none",
    };

    const cardBase: React.CSSProperties = {
      width: "min(520px, calc(100vw - 24px))",
      borderRadius: 16,
      padding: "12px 12px",
      pointerEvents: "auto",
      cursor: "default",
      userSelect: "none",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.76) 100%)",
      border: "1px solid rgba(2,6,23,0.14)",
      boxShadow: "0 22px 48px rgba(2,6,23,0.20)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      overflow: "hidden",
      transform: "translateY(-6px)",
      opacity: 0,
      animation: "rvToastIn 200ms ease-out forwards",
    };

    const headerRow: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    };

    const left: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
    };

    const badge: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      width: "fit-content",
      padding: "6px 10px",
      borderRadius: 999,
      fontWeight: 950,
      fontSize: 12,
      border: "1px solid rgba(2,6,23,0.14)",
      background: "rgba(255,255,255,0.60)",
      color: "#0f172a",
      boxShadow: "0 10px 26px rgba(2,6,23,0.10)",
    };

    const closeBtn: React.CSSProperties = {
      padding: "6px 10px",
      borderRadius: 12,
      fontWeight: 950,
      border: "1px solid rgba(2,6,23,0.14)",
      background: "rgba(255,255,255,0.55)",
      color: "#0f172a",
      cursor: "pointer",
    };

    const msg: React.CSSProperties = {
      marginTop: 10,
      padding: "0 2px 10px 2px",
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1.25,
      wordBreak: "break-word",
    };

    const progressWrap: React.CSSProperties = {
      height: 3,
      width: "100%",
      background: "rgba(2,6,23,0.08)",
    };

    const progressBar: React.CSSProperties = {
      height: "100%",
      width: "100%",
      transformOrigin: "left center",
      transform: "scaleX(1)",
      transition: "transform 100ms linear",
    };

    return { wrapper, cardBase, headerRow, left, badge, closeBtn, msg, progressWrap, progressBar };
  }, []);

  useEffect(() => {
    const onToast = (ev: Event) => {
      const e = ev as CustomEvent<ToastEventDetail>;
      const message = String(e.detail?.message ?? "").trim();
      if (!message) return;

      const variant = (e.detail?.variant ?? "info") as ToastVariant;
      const durationMs = Number.isFinite(Number(e.detail?.durationMs)) ? Number(e.detail?.durationMs) : 3200;

      const id = makeId();
      const createdAt = Date.now();

      setToasts((prev) => [{ id, message, variant, createdAt, durationMs }, ...prev].slice(0, 4));
    };

    window.addEventListener(EVENT_NAME, onToast);
    return () => window.removeEventListener(EVENT_NAME, onToast);
  }, []);

  // Timer loop to remove expired toasts + update progress smoothly
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.createdAt < t.durationMs));
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <>
      <style>{`
        @keyframes rvToastIn {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div style={styles.wrapper} aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => {
          const elapsed = Date.now() - t.createdAt;
          const pct = Math.min(1, Math.max(0, elapsed / t.durationMs));
          const scale = 1 - pct;

          return (
            <div
              key={t.id}
              style={{
                ...styles.cardBase,
                borderColor: "rgba(2,6,23,0.14)",
              }}
              onClick={() => dismiss(t.id)}
              title="Click to dismiss"
              role="status"
            >
              {/* Neon accent edge */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  pointerEvents: "none",
                  boxShadow: `inset 0 0 0 1px ${accentFor(t.variant)}`,
                  opacity: 0.55,
                }}
              />

              <div style={styles.headerRow}>
                <div style={styles.left}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: accentFor(t.variant),
                      boxShadow: `0 0 22px ${accentFor(t.variant)}`,
                      flex: "0 0 auto",
                    }}
                  />
                  <div style={{ ...styles.badge }}>
                    <span style={{ fontSize: 13 }}>{iconFor(t.variant)}</span>
                    {labelFor(t.variant)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(t.id);
                  }}
                  style={styles.closeBtn}
                  aria-label="Dismiss toast"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>

              <div style={styles.msg}>{t.message}</div>

              {/* Progress bar */}
              <div style={styles.progressWrap}>
                <div
                  style={{
                    ...styles.progressBar,
                    background: accentFor(t.variant),
                    transform: `scaleX(${scale})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
