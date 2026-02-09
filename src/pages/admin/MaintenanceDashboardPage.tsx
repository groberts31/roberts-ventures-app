import React from "react";

import { isRemoteBuildsEnabled, syncBuildsFromRemote } from "../../lib/buildsSync";
import { toast } from "../../lib/toast";

type StorageEstimate = {
  quota?: number;
  usage?: number;
};

function bytes(n: number) {
  if (!Number.isFinite(n)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function getLocalStorageBytes(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k) ?? "";
      total += k.length + v.length;
    }
    // Rough UTF-16 byte estimate: 2 bytes per char
    return total * 2;
  } catch {
    return NaN;
  }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function MaintenanceDashboardPage() {
  const [est, setEst] = React.useState<StorageEstimate>({});
  const [lsBytes, setLsBytes] = React.useState<number>(NaN);
  const [online, setOnline] = React.useState<boolean>(navigator.onLine);
  const [now, setNow] = React.useState<Date>(new Date());

  const [syncing, setSyncing] = React.useState<boolean>(false);
  const [syncResult, setSyncResult] = React.useState<null | { enabled: boolean; pushed: number; pulled: number }>(null);


  React.useEffect(() => {
    setLsBytes(getLocalStorageBytes());

    let stop = false;

    (async () => {
      try {
        // Supported in most modern browsers; safe to try/catch
        // @ts-ignore
        const r = (await navigator.storage?.estimate?.()) as StorageEstimate | undefined;
        if (!stop && r) setEst(r);
      } catch {
        // ignore
      }
    })();

    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    const t = window.setInterval(() => setNow(new Date()), 1000);

    return () => {
      stop = true;
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.clearInterval(t);
    };
  }, []);

  async function runRemoteSync() {
    const enabled = isRemoteBuildsEnabled();
    if (!enabled) {
      toast("Remote sync is disabled until Firebase env vars are set (not PASTE_ME).", "warning", "Remote Sync", 3200);
      return;
    }
    if (syncing) return;
    setSyncing(true);
    try {
      const r = await syncBuildsFromRemote();
      setSyncResult(r);
      if (!r.enabled) {
        toast("Remote sync is disabled.", "warning", "Remote Sync", 2400);
      } else {
        toast(`Remote sync complete. Pushed: ${r.pushed}.`, "success", "Remote Sync", 2600);
      }
    } catch (e: any) {
      toast(String(e?.message || e || "Remote sync failed."), "error", "Remote Sync", 3600);
    } finally {
      setSyncing(false);
    }
  }

  const theme =
    document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark (system)" : "light (system)");

  const report = {
    generatedAt: now.toISOString(),
    online,
    theme,
    location: window.location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    storage: {
      localStorageApproxBytes: lsBytes,
      estimate: {
        quota: est.quota,
        usage: est.usage,
      },
    },
  };

  return (
    <div className="page" style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
      <div className="stack">
        <div className="panel card">
          <div className="stack">
            <div className="h2">Admin • Maintenance Dashboard</div>
            <div className="muted">
              Live system snapshot for troubleshooting and health checks.{" "}
              <span style={{ fontWeight: 900 }}>URL:</span> <code>{window.location.pathname}</code>
            </div>

            <div className="row">
              <span className="badge">{online ? "Online" : "Offline"}</span>
              <span className="badge">Theme: {theme}</span>
              <span className="badge">Time: {now.toLocaleString()}</span>
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={() => downloadJson(`maintenance-report-${now.toISOString().replace(/[:.]/g, "-")}.json`, report)}
              >
                Download Diagnostic Report (JSON)
              </button>

              <button className="btn btn-ghost" onClick={() => window.location.reload()}>
                Refresh Snapshot
              </button>
            </div>
          </div>
        </div>

        <div className="panel card">
          <div className="h3">Storage Health</div>
          <div className="stack" style={{ marginTop: 10 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="body">localStorage (approx)</div>
              <div className="body" style={{ fontWeight: 900 }}>
                {Number.isFinite(lsBytes) ? bytes(lsBytes) : "Not available"}
              </div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="body">Browser storage usage</div>
              <div className="body" style={{ fontWeight: 900 }}>
                {Number.isFinite(est.usage ?? NaN) ? bytes(est.usage as number) : "Not available"}
              </div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="body">Browser storage quota</div>
              <div className="body" style={{ fontWeight: 900 }}>
                {Number.isFinite(est.quota ?? NaN) ? bytes(est.quota as number) : "Not available"}
              </div>
            </div>

            <div className="muted" style={{ marginTop: 6 }}>
              Note: This dashboard shows browser/runtime health. File-based backup health (ZIP/PDF) is checked via your backup scripts (CLI).
            </div>
          </div>
        </div>

        <div className="panel card">
          <div className="h3">Environment</div>
          <div className="stack" style={{ marginTop: 10 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="body">Time zone</div>
              <div className="body" style={{ fontWeight: 900 }}>
                {report.timeZone}
              </div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="body">Language</div>
              <div className="body" style={{ fontWeight: 900 }}>
                {report.language}
              </div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="body">User agent</div>
              <div className="body" style={{ fontWeight: 900, maxWidth: 680, textAlign: "right" }}>
                {report.userAgent}
              </div>
            </div>
          </div>
        </div>

                <div className="panel card">
          <div className="h3">Remote Builds Sync</div>
          <div className="muted" style={{ marginTop: 10 }}>
            This safely merges Local (browser) and Cloud (Firestore) builds by newest <code>updatedAt</code>, then pushes newer items to the cloud.
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
            <span className="badge">{isRemoteBuildsEnabled() ? "Remote Enabled" : "Remote Disabled"}</span>
            {syncing ? <span className="badge">Syncing…</span> : null}
            {syncResult ? (
              <span className="badge">Last: pushed {syncResult.pushed}</span>
            ) : null}
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={runRemoteSync} disabled={syncing || !isRemoteBuildsEnabled()}>
              Sync Builds from Cloud
            </button>
            <div className="muted" style={{ fontWeight: 850 }}>
              Tip: Set real Firebase values in <code>.env</code> (no <code>PASTE_ME</code>) to enable.
            </div>
          </div>
        </div>

<div className="panel card">
          <div className="h3">Quick Links</div>
          <div className="muted" style={{ marginTop: 10 }}>
            If you don’t want to add a Navbar link yet, you can still open the page directly:
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <span className="badge">/admin/maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
