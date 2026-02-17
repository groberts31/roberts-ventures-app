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
  return "✨"; // info: no "Info" text, just a vibe
}

// Dark neon accents
function accentFor(v: ToastVariant) {
  if (v === "success") return "rgba(34,197,94,0.95)";   // neon green
  if (v === "warning") return "rgba(250,204,21,0.95)";  // neon yellow
  if (v === "error") return "rgba(248,113,113,0.95)";   // neon red
  return "rgba(59,130,246,0.95)";                       // neon blue
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const rafRef = useRef<number | null>(null);

  const styles = useMemo(() => {
    const wrapper: React.CSSProperties = {
      position: "fixed",
      bottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
      right: "calc(14px + env(safe-area-inset-right, 0px))",
      zIndex: 9999,
      display: "grid",
      gap: 10,
      pointerEvents: "none",
    };

    const cardBase: React.CSSProperties = {
      width: "min(520px, calc(100vw - 24px))",
      borderRadius: 18,
      padding: "12px 12px",
      pointerEvents: "auto",
      cursor: "default",
      userSelect: "none",
      // Dark glass background
      background:
        "linear-gradient(180deg, rgba(2,6,23,0.90) 0%, rgba(2,6,23,0.78) 100%)",
      border: "1px solid rgba(148,163,184,0.16)",
      boxShadow: "0 22px 55px rgba(0,0,0,0.55)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      overflow: "hidden",
      transform: "translateY(8px)",
      opacity: 0,
      animation: "rvToastIn 220ms ease-out forwards",
      position: "relative",
    };

    const headerRow: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center", // center header contents
      gap: 10,
      position: "relative",
      paddingTop: 2,
    };

    const iconBadge: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 999,
      border: "1px solid rgba(148,163,184,0.18)",
      background: "rgba(15,23,42,0.55)",
      boxShadow: "0 0 0 1px rgba(148,163,184,0.10) inset",
      fontSize: 16,
      color: "rgba(226,232,240,0.95)",
    };

    const closeBtn: React.CSSProperties = {
      position: "absolute",
      right: 0,
      top: 0,
      padding: "7px 10px",
      borderRadius: 12,
      fontWeight: 950,
      border: "1px solid rgba(148,163,184,0.18)",
      background: "rgba(15,23,42,0.50)",
      color: "rgba(226,232,240,0.92)",
      cursor: "pointer",
    };

    const msg: React.CSSProperties = {
      marginTop: 10,
      padding: "0 6px 12px 6px",
      fontWeight: 900,
      color: "rgba(226,232,240,0.95)",
      lineHeight: 1.25,
      wordBreak: "break-word",
      textAlign: "center", // center message
    };

    const sub: React.CSSProperties = {
      marginTop: 2,
      marginBottom: 2,
      fontWeight: 850,
      fontSize: 12,
      color: "rgba(148,163,184,0.85)",
      textAlign: "center",
    };

    const progressWrap: React.CSSProperties = {
      height: 3,
      width: "100%",
      background: "rgba(148,163,184,0.12)",
    };

    const progressBar: React.CSSProperties = {
      height: "100%",
      width: "100%",
      transformOrigin: "left center",
      transform: "scaleX(1)",
      transition: "transform 100ms linear",
    };

    return { wrapper, cardBase, headerRow, iconBadge, closeBtn, msg, sub, progressWrap, progressBar };
  }, []);

  useEffect(() => {
    const onToast = (ev: Event) => {
      const e = ev as CustomEvent<ToastEventDetail>;
      const message = String(e.detail?.message ?? "").trim();
      if (!message) return;

      const variant = (e.detail?.variant ?? "info") as ToastVariant;
      const durationMs = Number.isFinite(Number(e.detail?.durationMs)) ? Number(e.detail?.durationMs) : 1800;

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
          from { transform: translateY(10px); opacity: 0; }
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
          const accent = accentFor(t.variant);

          return (
            <div
              key={t.id}
              style={styles.cardBase}
              onClick={() => dismiss(t.id)}
              title="Click to dismiss"
              role="status"
            >
              {/* Neon border glow */}
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 18,
                  pointerEvents: "none",
                  boxShadow: `0 0 0 1px rgba(148,163,184,0.12) inset, 0 0 26px ${accent}`,
                  opacity: 0.55,
                }}
              />

              {/* Neon top strip */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: accent,
                  boxShadow: `0 0 18px ${accent}`,
                  opacity: 0.9,
                }}
              />

              <div style={styles.headerRow}>
                <div style={styles.iconBadge}>
                  {iconFor(t.variant)}
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

              {/* No "Info" / "Success" text — just centered content */}
              <div style={styles.msg}>{t.message}</div>

              <div style={styles.progressWrap}>
                <div
                  style={{
                    ...styles.progressBar,
                    background: accent,
                    boxShadow: `0 0 14px ${accent}`,
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
