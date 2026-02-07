export function goToRequestConfirmed() {
  // Ensure the last saved request has a stable id, then redirect.
  try {
    const raw = JSON.parse(localStorage.getItem("rv_requests") ?? "[]");
    const arr = Array.isArray(raw) ? raw : [];
    const lastIndex = arr.length - 1;

    if (lastIndex >= 0) {
      const last: any = arr[lastIndex];

      if (!last.id) {
        last.id =
          (crypto as any).randomUUID?.() ??
          (Math.random().toString(16).slice(2) + Date.now().toString(16));
        arr[lastIndex] = last;
        localStorage.setItem("rv_requests", JSON.stringify(arr));
      }

      window.location.href = `/request-confirmed/${last.id}`;
      return;
    }
  } catch (e) {
    // ignore
  }

  // fallback (rare)
  window.location.href =
    `/request-confirmed/${Math.random().toString(16).slice(2) + Date.now().toString(16)}`;
}
