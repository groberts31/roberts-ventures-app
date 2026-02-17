export type ToastType = "success" | "info" | "warning" | "error";

export type ToastPayload = {
  message: string;
  type?: ToastType;
  title?: string;
  durationMs?: number;

  // Optional action button
  actionLabel?: string;
  actionHref?: string;
};

export function toast(
  message: string,
  type: ToastType = "success",
  title?: string,
  durationMs: number = 1800,
  actionLabel?: string,
  actionHref?: string
) {
  const payload: ToastPayload = { message, type, title, durationMs, actionLabel, actionHref };
  window.dispatchEvent(new CustomEvent("rv_toast", { detail: payload }));
}
