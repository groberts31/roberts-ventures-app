import { useEffect, useMemo, useState } from "react";

type ToastVariant = "info" | "success" | "warning" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
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

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const styles = useMemo(() => {
    const baseCard: React.CSSProperties = {
      width: "min(520px, calc(100vw - 24px))",
      borderRadius: 14,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(2,6,23,0.14)",
      boxShadow: "0 18px 40px rgba(2,6,23,0.16)",
      backdropFilter: "blur(8px)",
      display: "grid",
      gap: 6,
      pointerEvents: "auto",
      animation: "rvToastIn 180ms ease-out",
    };

    const badge: React.CSSProperties = {
      width: "fit-content",
      padding: "4px 10px",
      borderRadius: 999,
      fontWeight: 950,
      fontSize: 12,
      border: "1px solid rgba(2,6,23,0.14)",
      background: "rgba(255,255,255,0.70)",
      color: "#0f172a",
    };

    return { baseCard, badge };
  }, []);

  useEffect(() => {
    const onToast = (ev: Event) => {
      const e = ev as CustomEvent<ToastEventDetail>;
      const message = String(e.detail?.message ?? "").trim();
      if (!message) return;

      const variant = (e.detail?.variant ?? "info") as ToastVariant;
      const durationMs = Number.isFinite(Number(e.detail?.durationMs)) ? Number(e.detail?.durationMs) : 2800;

      const id = makeId();
      setToasts((prev) => [{ id, message, variant }, ...prev].slice(0, 4));

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id != id));
      }, Math.max(1200, durationMs));
    };

    window.addEventListener(EVENT_NAME, onToast);
    return () => window.removeEventListener(EVENT_NAME, onToast);
  }, []);

  if (toasts.length === 0) return null;

  const variantLabel = (v: ToastVariant) => {
    if (v === "success") return "Success";
    if (v === "warning") return "Heads up";
    if (v === "error") return "Error";
    return "Info";
  };

  const variantAccent = (v: ToastVariant) => {
    // no hard-coded colors elsewhere in your app, but toasts need readable cues
    if (v === "success") return "rgba(16,185,129,0.18)"; // emerald-ish
    if (v === "warning") return "rgba(245,158,11,0.18)"; // amber-ish
    if (v === "error") return "rgba(239,68,68,0.18)";    // red-ish
    return "rgba(59,130,246,0.14)";                      // blue-ish
  };

  return (
    <>
      <style>{`
        @keyframes rvToastIn {
          from { transform: translateY(-6px); opacity: 0; }
          to   { transform: translateY(0px); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 9999,
          display: "grid",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...styles.baseCard,
              borderColor: "rgba(2,6,23,0.14)",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ ...styles.badge, background: variantAccent(t.variant) }}>
                {variantLabel(t.variant)}
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  fontWeight: 950,
                  pointerEvents: "auto",
                }}
                aria-label="Dismiss"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            <div style={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.25 }}>
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
