export type ToastType = "success" | "info" | "warning" | "error";

export type ToastPayload = {
  message: string;
  type?: ToastType;        // legacy field name (ToastHost supports it)
  title?: string;
  durationMs?: number;

  // Optional action button
  actionLabel?: string;
  actionHref?: string;
};

const DEFAULT_DURATION_MS = 1400;

export function toast(
  message: string,
  type: ToastType = "success",
  title?: string,
  durationMs: number = DEFAULT_DURATION_MS,
  actionLabel?: string,
  actionHref?: string
) {
  const payload: ToastPayload = { message, type, title, durationMs, actionLabel, actionHref };
  window.dispatchEvent(new CustomEvent("rv_toast", { detail: payload }));
}
