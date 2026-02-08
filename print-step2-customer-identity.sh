#!/usr/bin/env bash
set -euo pipefail

FILES=(
  "src/data/requestCart.ts"
  "src/pages/CustomerPortal.tsx"
  "src/pages/Schedule.tsx"
)

echo "==== STEP 2: CUSTOMER IDENTITY (FILES TO UPDATE) ===="
echo

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    echo "===== $f ====="
    nl -ba "$f"
    echo
  else
    echo "----- MISSING: $f -----"
    echo
  fi
done
