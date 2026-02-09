#!/bin/bash
set -e

# ==================================
# RV ONE-COMMAND RESTORE
# Usage:
#   ./rv-restore.sh backups/rv-backup-YYYY-MM-DD-HHMM.zip
# ==================================

ZIP="$1"

if [[ -z "$ZIP" ]]; then
  echo "❌ Missing zip path."
  echo "✅ Example:"
  echo "   ./rv-restore.sh backups/rv-backup-2026-02-08-2314.zip"
  exit 1
fi

if [[ ! -f "$ZIP" ]]; then
  echo "❌ File not found: $ZIP"
  exit 1
fi

ROOT="$(pwd)"
TMPDIR="$(mktemp -d)"
RESTORE_PARENT="$TMPDIR/restore"
mkdir -p "$RESTORE_PARENT"

echo "▶ Restoring from: $ZIP"
unzip -q "$ZIP" -d "$RESTORE_PARENT"

# Find extracted folder
RESTORE_DIR="$(find "$RESTORE_PARENT" -maxdepth 3 -type d -name 'rv-backup-*' | head -n 1)"
if [[ -z "$RESTORE_DIR" ]]; then
  echo "❌ Could not locate extracted rv-backup-* folder inside zip."
  echo "ℹ️ Here are the top folders extracted:"
  find "$RESTORE_PARENT" -maxdepth 2 -type d
  exit 1
fi

echo "▶ Located restore folder: $RESTORE_DIR"

# --- Case A: builds.json exists ---
if [[ -f "$RESTORE_DIR/builds.json" ]]; then
  echo "▶ Found builds.json — restoring into ./ .ls ..."
  node -e "
  const fs=require('fs');
  const { LocalStorage } = require('node-localstorage');
  const ls = new LocalStorage('./.ls');
  const data = fs.readFileSync('$RESTORE_DIR/builds.json','utf8');
  ls.setItem('rv_build_submissions', data);
  console.log('✅ Builds restored (source: builds.json) -> ./.ls key rv_build_submissions');
  "
  echo "✅ RESTORE COMPLETE"
  exit 0
fi

# --- Case B: backup contains a .ls store folder ---
# Look for any folder named ".ls" inside the backup
LS_DIR="$(find "$RESTORE_DIR" -type d -name '.ls' | head -n 1)"
if [[ -n "$LS_DIR" ]]; then
  echo "▶ Found .ls store in backup — copying to project root..."
  rm -rf "$ROOT/.ls"
  cp -R "$LS_DIR" "$ROOT/.ls"
  echo "✅ Builds restored (source: .ls store copied) -> $ROOT/.ls"
  echo "✅ RESTORE COMPLETE"
  exit 0
fi

# --- Case C: find a likely JSON file and use it ---
# pick first json with build/submiss in name
CAND_JSON="$(find "$RESTORE_DIR" -maxdepth 4 -type f \( -iname '*build*.json' -o -iname '*submiss*.json' \) | head -n 1)"
if [[ -n "$CAND_JSON" ]]; then
  echo "▶ Found JSON candidate: $CAND_JSON"
  echo "▶ Restoring JSON into ./ .ls key rv_build_submissions ..."
  node -e "
  const fs=require('fs');
  const { LocalStorage } = require('node-localstorage');
  const ls = new LocalStorage('./.ls');
  const data = fs.readFileSync('$CAND_JSON','utf8');
  ls.setItem('rv_build_submissions', data);
  console.log('✅ Builds restored (source: json candidate) -> ./.ls key rv_build_submissions');
  "
  echo "✅ RESTORE COMPLETE"
  exit 0
fi

echo "❌ No builds.json, no .ls folder, and no builds-like json found in backup."
echo "ℹ️ Run this to inspect contents:"
echo "   unzip -l \"$ZIP\" | egrep -i \"build|submiss|\\.ls|local|json\""
exit 1
