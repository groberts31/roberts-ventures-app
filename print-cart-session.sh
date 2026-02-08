#!/usr/bin/env bash
set -euo pipefail

FILES=(
  "src/data/requestCart.ts"
  "src/pages/CustomerPortal.tsx"
  "src/pages/Schedule.tsx"
  "src/components/Navbar.tsx"
)

echo "==== CUSTOMER CART SESSION FILES ===="
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
