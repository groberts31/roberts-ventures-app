#!/usr/bin/env bash
set -euo pipefail

# ==== CONFIG: which files to include in the bundle ====
FILES=(
  "src/App.css"
  "src/index.css"
  "src/styles/theme-override.css"
  "src/components/Navbar.tsx"
)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STAMP="$(date +"%Y-%m-%d-%H%M")"
OUT_TXT="prints/combined_source-${STAMP}.txt"
OUT_PDF="prints/combined_source-${STAMP}.pdf"

# Clean, predictable formatting
hr="============================================================================"

# Build the combined text file
: > "$OUT_TXT"
for f in "${FILES[@]}"; do
  echo "$hr" >> "$OUT_TXT"
  echo "FILE: $f" >> "$OUT_TXT"
  echo "$hr" >> "$OUT_TXT"

  if [[ -f "$f" ]]; then
    nl -ba "$f" >> "$OUT_TXT"
  else
    echo "[MISSING] $f" >> "$OUT_TXT"
  fi

  echo "" >> "$OUT_TXT"
done

# Convert text -> PDF using macOS CUPS (built-in)
# (Produces a clean "printable" PDF without needing reportlab)
cupsfilter "$OUT_TXT" > "$OUT_PDF"

echo "DONE"
echo "$OUT_TXT"
echo "$OUT_PDF"
