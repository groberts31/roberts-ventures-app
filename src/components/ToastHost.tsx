import { useEffect, useMemo, useState } from "react";
import type { ToastPayload } from "../lib/toast";

type ToastItem = ToastPayload & { id: string };

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const ev = e as CustomEvent<ToastPayload>;
      const p = ev.detail;
      const id = uid();
      const duration = typeof p.durationMs === "number" ? p.durationMs : 2200;

      const item: ToastItem = { id, ...p };
      setItems((prev) => [item, ...prev].slice(0, 4)); // max 4 visible

      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, duration);
    }

    window.addEventListener("rv_toast", onToast);
    return () => window.removeEventListener("rv_toast", onToast);
  }, []);

  const styles = useMemo(() => {
    return {
      wrap: {
        position: "fixed" as const,
        right: 16,
        bottom: 16,
        display: "grid",
        gap: 10,
        zIndex: 9999,
        width: "min(420px, calc(100vw - 32px))",
        pointerEvents: "none" as const,
      },
      toast: (type?: string) => ({
        pointerEvents: "auto" as const,
        borderRadius: 16,
        padding: "12px 14px",
        border: "1px solid rgba(2,6,23,0.18)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
        boxShadow:
          type === "error"
            ? "0 18px 48px rgba(220,38,38,0.18)"
            : type === "warning"
            ? "0 18px 48px rgba(245,158,11,0.18)"
            : "0 18px 48px rgba(29,78,216,0.16)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "rvToastIn 180ms ease-out",
      }),
      topRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      },
      badge: (type?: string) => ({
        fontSize: 11,
        fontWeight: 950,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(2,6,23,0.14)",
        background:
          type === "error"
            ? "rgba(220,38,38,0.12)"
            : type === "warning"
            ? "rgba(245,158,11,0.14)"
            : type === "info"
            ? "rgba(14,165,233,0.14)"
            : "rgba(34,197,94,0.14)",
        color:
          type === "error"
            ? "#7f1d1d"
            : type === "warning"
            ? "#7c2d12"
            : type === "info"
            ? "#0c4a6e"
            : "#14532d",
        boxShadow:
          type === "error"
            ? "0 0 0 4px rgba(220,38,38,0.08)"
            : type === "warning"
            ? "0 0 0 4px rgba(245,158,11,0.08)"
            : type === "info"
            ? "0 0 0 4px rgba(14,165,233,0.08)"
            : "0 0 0 4px rgba(34,197,94,0.08)",
      }),
      title: {
        fontWeight: 950,
        color: "#0f172a",
        fontSize: 13,
        margin: 0,
      },
      msg: {
        marginTop: 6,
        marginBottom: 0,
        fontWeight: 800,
        color: "#0f172a",
        opacity: 0.9,
        fontSize: 12.5,
        lineHeight: 1.3,
      },
      closeBtn: {
        pointerEvents: "auto" as const,
        border: "1px solid rgba(2,6,23,0.14)",
        background: "rgba(255,255,255,0.65)",
        borderRadius: 999,
        fontWeight: 950,
        fontSize: 12,
        padding: "6px 10px",
        cursor: "pointer",
        color: "#0f172a",
      },
    };
  }, []);

  return (
    <>
      <div style={styles.wrap}>
        {items.map((t) => (
          <div key={t.id} style={styles.toast(t.type)}>
            <div style={styles.topRow}>
              <span style={styles.badge(t.type)}>{(t.type ?? "success").toUpperCase()}</span>
              <button
                style={styles.closeBtn}
                onClick={() => setItems((p) => p.filter((x) => x.id !== t.id))}
              >
                Close
              </button>
            </div>

            {t.title ? <p style={styles.title}>{t.title}</p> : null}
            <p style={styles.msg}>{t.message}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rvToastIn {
          from { transform: translateY(10px); opacity: 0; }
          to   { transform: translateY(0);  opacity: 1; }
        }
      `}</style>
    </>
  );
}
