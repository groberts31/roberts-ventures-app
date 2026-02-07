export type ToastType = "success" | "info" | "warning" | "error";

export type ToastPayload = {
  message: string;
  type?: ToastType;
  title?: string;
  durationMs?: number;
};

export function toast(message: string, type: ToastType = "success", title?: string, durationMs: number = 2200) {
  const payload: ToastPayload = { message, type, title, durationMs };
  window.dispatchEvent(new CustomEvent("rv_toast", { detail: payload }));
}
