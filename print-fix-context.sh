#!/usr/bin/env bash
set -euo pipefail

FILES=(
  src/pages/Services.tsx
  src/data/requestCart.ts
)

echo "==== FIX CONTEXT DUMP ===="
echo

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    echo "===== $f ====="
    nl -ba "$f"
    echo
  fi
done
