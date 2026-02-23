import React from "react";
import { readBackupEvents, clearBackupEvents } from "../../lib/backupStore";
import { backupNow, restoreFromCloud, backupRemoteEnabled, exportLocalBuilds } from "../../lib/backupManager";
function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}



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

  // Backup log
  const [backupEvents, setBackupEvents] = React.useState(() => readBackupEvents());
  const [busy, setBusy] = React.useState<"" | "backup" | "restore">("");

  function refreshBackupLog() {
    setBackupEvents(readBackupEvents());
  }

  React.useEffect(() => {
    setLsBytes(getLocalStorageBytes());

    let stop = false;

    (async () => {
      try {
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

    refreshBackupLog();

    return () => {
      stop = true;
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.clearInterval(t);
    };
  }, []);

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
    backups: {
      remoteEnabled: backupRemoteEnabled(),
      eventCount: backupEvents.length,
    },
  };

  const lastEvent = backupEvents[0];

  async function onBackupNow() {
    if (busy) return;
    setBusy("backup");
    try {
      const res = await backupNow();
      refreshBackupLog();
      if (!res.enabled) {
        alert("Backup skipped: Firebase env not configured (remote disabled).");
        return;
      }
      alert(`Backup complete. Pushed ${res.pushed} build(s). Local count: ${res.localCount}.`);
    } catch (e: any) {
      alert(`Backup failed: ${String(e?.message || e || "Unknown error")}`);
    } finally {
      setBusy("");
    }
  }

  async function onRestoreFromCloud() {
    if (busy) return;

    const ok = confirm(
      "Restore FROM CLOUD will overwrite the LOCAL builds on this device/browser.\n\nContinue?"
    );
    if (!ok) return;

    setBusy("restore");
    try {
      const res = await restoreFromCloud();
      refreshBackupLog();

      if (!res.enabled) {
        alert("Restore skipped: Firebase env not configured (remote disabled).");
        return;
      }

      alert(`Restore complete. Pulled ${res.pulledCount} build(s) from cloud.`);
    } catch (e: any) {
      alert(`Restore failed: ${String(e?.message || e || "Unknown error")}`);
    } finally {
      setBusy("");
    }
  }

  function onClearBackupLog() {
    const ok = confirm("Clear backup history log for this browser/device?");
    if (!ok) return;
    clearBackupEvents();
    refreshBackupLog();
    alert("Backup log cleared.");
  }

  function downloadBackupLog() {
    downloadJson(
      `backup-events-${now.toISOString().replace(/[:.]/g, "-")}.json`,
      {
        generatedAt: now.toISOString(),
        events: backupEvents,
        remoteEnabled: backupRemoteEnabled(),
      }
    );
  }

  function downloadLocalBuildSnapshot() {
    const builds = exportLocalBuilds();
    downloadJson(
      `local-builds-snapshot-${now.toISOString().replace(/[:.]/g, "-")}.json`,
      {
        generatedAt: now.toISOString(),
        count: builds.length,
        builds,
      }
    );
  }

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

        {/* BACKUPS */}
        <div className="panel card">
          <div className="h3">Backups (Local + Cloud)</div>

          <div className="muted" style={{ marginTop: 8 }}>
            Cloud backup is enabled only when Firebase env values are set (not PASTE_ME).
            Restore will overwrite local builds on this browser/device.
          </div>

          <div className="row" style={{ marginTop: 10, gap: 10, flexWrap: "wrap" }}>
            <span className="badge">Remote: {backupRemoteEnabled() ? "Enabled" : "Disabled"}</span>
            <span className="badge">Events: {backupEvents.length}</span>
            {lastEvent ? (
              <span className="badge">
                Last: {lastEvent.kind} • {new Date(lastEvent.createdAt).toLocaleString()}
              </span>
            ) : (
              <span className="badge">Last: —</span>
            )}
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onBackupNow} disabled={busy !== ""}>
              {busy === "backup" ? "Backing up…" : "Backup Now (Sync → Cloud)"}
            </button>

            <button className="btn" onClick={onRestoreFromCloud} disabled={busy !== ""}>
              {busy === "restore" ? "Restoring…" : "Restore From Cloud (Overwrite Local)"}
            </button>

            <button className="btn btn-ghost" onClick={downloadBackupLog}>
              Download Backup Log (JSON)
            </button>

            <button className="btn btn-ghost" onClick={downloadLocalBuildSnapshot}>
              Download Local Builds Snapshot (JSON)
            </button>

            <button className="btn btn-ghost" onClick={onClearBackupLog}>
              Clear Backup Log
            </button>
          </div>

          <div className="stack" style={{ marginTop: 14 }}>
            <div className="muted" style={{ fontWeight: 900 }}>Recent events</div>

            {backupEvents.length === 0 ? (
              <div className="muted">No backup events yet.</div>
            ) : (
              <div className="stack" style={{ gap: 8 }}>
                {backupEvents.slice(0, 10).map((e) => (
                  <div key={e.id} className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div className="body" style={{ fontWeight: 900 }}>
                      {e.kind}
                    </div>
                    <div className="muted" style={{ fontWeight: 850 }}>
                      {new Date(e.createdAt).toLocaleString()}
                    </div>
                    {e.detail ? (
                      <div className="muted" style={{ width: "100%", fontWeight: 800, opacity: 0.9 }}>
                        {e.detail}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
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
          <div className="h3">Backup Events</div>

          <div className="muted" style={{ marginTop: 8 }}>
            Local browser backup logs.
          </div>

          {(() => {
            const events = readBackupEvents().slice(0, 50);

            return (
              <div className="stack" style={{ marginTop: 12 }}>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      downloadJson(
                        `backup-events-${now.toISOString().replace(/[:.]/g, "-")}.json`,
                        events
                      )
                    }
                  >
                    Download Backup Events
                  </button>

                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      if (!confirm("Clear backup events?")) return;
                      clearBackupEvents();
                      setNow(new Date());
                    }}
                  >
                    Clear Backup Events
                  </button>

                  <span className="badge">
                    Showing: {Math.min(events.length, 50)}
                  </span>

                </div>

                {events.length === 0 ? (

                  <div className="muted" style={{ fontWeight: 850 }}>
                    No backup events yet.
                  </div>

                ) : (

                  <div style={{ overflowX: "auto" }}>
                    <table
                      className="table"
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >

                      <thead>
                        <tr>
                          <th style={{ padding: "10px 8px" }}>Time</th>
                          <th style={{ padding: "10px 8px" }}>Kind</th>
                          <th style={{ padding: "10px 8px" }}>Detail</th>
                        </tr>
                      </thead>

                      <tbody>
                        {events.map((e) => (
                          <tr key={e.id}>
                            <td style={{ padding: "10px 8px" }}>
                              {fmt(e.createdAt)}
                            </td>
                            <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                              {String(e.kind || "—")}
                            </td>
                            <td style={{ padding: "10px 8px" }}>
                              {String(e.detail || "—")}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>

                )}

              </div>
            );
          })()}

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
