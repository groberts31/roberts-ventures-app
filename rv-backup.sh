#!/bin/bash

# ===============================
# RV AUTOMATIC SNAPSHOT BACKUP
# ===============================

TS=$(date +"%Y-%m-%d-%H%M")
ROOT=$(pwd)
BACKUP_DIR="$ROOT/backups/rv-backup-$TS"

mkdir -p "$BACKUP_DIR"

echo "▶ Creating backup: $BACKUP_DIR"

# -------------------------------
# 1. Export localStorage builds
# -------------------------------
node -e "
const fs=require('fs');
const data=JSON.stringify(
  JSON.parse(require('node-localstorage').LocalStorage('./.ls').getItem('rv_build_submissions')||'[]'),
  null,2
);
fs.writeFileSync('$BACKUP_DIR/builds.json',data);
"

# -------------------------------
# 2. Combine source files
# -------------------------------
find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) \
  -exec echo "==== {} ====" \; \
  -exec cat {} \; \
  > "$BACKUP_DIR/source.txt"

# -------------------------------
# 3. Convert to PDF
# -------------------------------
cupsfilter "$BACKUP_DIR/source.txt" > "$BACKUP_DIR/source.pdf"

# -------------------------------
# 4. Zip everything
# -------------------------------
cd backups || exit
zip -r "rv-backup-$TS.zip" "rv-backup-$TS" >/dev/null

echo "✅ BACKUP COMPLETE"
echo "📦 File: backups/rv-backup-$TS.zip"
