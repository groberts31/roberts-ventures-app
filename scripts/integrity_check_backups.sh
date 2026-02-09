#!/bin/bash
set -euo pipefail

BACKUP_DIR="$HOME/Desktop/AppProjects/roberts-ventures-app/backups"
ICLOUD_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/RV-Backups"
LOG_DIR="$HOME/Desktop/AppProjects/roberts-ventures-app/logs"
mkdir -p "$LOG_DIR"

LOG="$LOG_DIR/integrity-check.log"

ts() { date "+%Y-%m-%d %H:%M:%S"; }

# Find newest zips
LOCAL="$(ls -t "$BACKUP_DIR"/*.zip 2>/dev/null | head -n 1 || true)"
ICLOUD="$(ls -t "$ICLOUD_DIR"/*.zip 2>/dev/null | head -n 1 || true)"

{
  echo "============================================================"
  echo "$(ts)  Integrity Check شروع"
  echo "Local : ${LOCAL:-NONE}"
  echo "iCloud: ${ICLOUD:-NONE}"

  OK_LOCAL=0
  OK_ICLOUD=0

  if [[ -n "${LOCAL}" ]] && unzip -tq "$LOCAL" >/dev/null 2>&1; then
    OK_LOCAL=1
    echo "✅ Local ZIP OK"
  else
    echo "❌ Local ZIP BAD"
  fi

  if [[ -n "${ICLOUD}" ]] && unzip -tq "$ICLOUD" >/dev/null 2>&1; then
    OK_ICLOUD=1
    echo "✅ iCloud ZIP OK"
  else
    echo "❌ iCloud ZIP BAD"
  fi

  # Auto-repair only when local is good and iCloud is bad
  if [[ "$OK_LOCAL" -eq 1 && "$OK_ICLOUD" -eq 0 ]]; then
    echo "⚠️ Repairing iCloud from local..."
    cp -f "$LOCAL" "$ICLOUD_DIR/$(basename "$LOCAL")"
    # Verify the repaired copy
    if unzip -tq "$ICLOUD_DIR/$(basename "$LOCAL")" >/dev/null 2>&1; then
      echo "✅ iCloud repaired and verified"
    else
      echo "❌ Repair copy failed verification"
    fi
  elif [[ "$OK_LOCAL" -eq 0 && "$OK_ICLOUD" -eq 1 ]]; then
    echo "⚠️ Local is bad; iCloud is OK (no overwrite done)"
  elif [[ "$OK_LOCAL" -eq 1 && "$OK_ICLOUD" -eq 1 ]]; then
    echo "✅ All healthy; no action"
  else
    echo "❌ Both bad or missing; manual recovery needed"
  fi

  echo "$(ts)  Integrity Check done"
} >> "$LOG" 2>&1
