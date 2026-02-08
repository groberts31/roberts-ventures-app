#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path
import re

def write(path: Path, s: str):
    path.write_text(s, encoding="utf-8")

def patch_customer_portal():
    p = Path("src/pages/CustomerPortal.tsx")
    s = p.read_text(encoding="utf-8")

    # 1) Add useCart import
    if 'from "../data/requestCart"' not in s:
        s = s.replace(
            'import { findRequestsByNameAndPhone, findRequestsByPhoneAndCode, type RVRequest } from "../lib/requestsStore";',
            'import { findRequestsByNameAndPhone, findRequestsByPhoneAndCode, type RVRequest } from "../lib/requestsStore";\nimport { useCart } from "../data/requestCart";'
        )

    # 2) Add cart const inside component (after function start)
    if "const cart = useCart();" not in s:
        s = s.replace(
            "export default function CustomerPortal() {\n",
            "export default function CustomerPortal() {\n  const cart = useCart();\n"
        )

    # 3) Change Find My Requests button onClick
    # Old: onClick={() => setSearched(true)}
    # New: set customer identity then setSearched(true)
    s = s.replace(
        'onClick={() => setSearched(true)}',
        'onClick={() => {\n              cart.setCustomer({ phone, accessCode: code });\n              setSearched(true);\n            }}'
    )

    write(p, s)

def patch_schedule():
    p = Path("src/pages/Schedule.tsx")
    s = p.read_text(encoding="utf-8")

    # 1) ensure useEffect import
    s = re.sub(r'import\s+\{\s*useMemo,\s*useState\s*\}\s+from\s+"react";',
               'import { useEffect, useMemo, useState } from "react";', s)

    # 2) add normalizePhone helper if missing
    if "function normalizePhone" not in s:
        insert_at = s.find("function money")
        helper = (
            'function normalizePhone(p?: string) {\n'
            '  return String(p || "").replace(/\\D+/g, "");\n'
            '}\n\n'
        )
        s = s[:insert_at] + helper + s[insert_at:]

    # 3) add effect to scope cart by phone while typing
    # place right after: const cart = useCart();
    if "useEffect(() =>" not in s or "cart.setCustomer" not in s:
        s = s.replace(
            "  const cart = useCart();\n",
            "  const cart = useCart();\n\n"
            "  // Step 2: as soon as the user types a real phone number, scope the cart to that phone\n"
            "  // (so the navbar cart count reflects THIS customer, not the last active one).\n"
            "  useEffect(() => {\n"
            "    const digits = normalizePhone(contact.phone);\n"
            "    if (digits.length >= 10) {\n"
            "      cart.setCustomer({ phone: contact.phone });\n"
            "    }\n"
            "  }, [contact.phone]);\n"
        )

    # NOTE: the above references contact.phone; but contact is declared later.
    # So we must move that effect AFTER the contact state is declared.
    # We'll fix by removing if we inserted in wrong place and re-inserting after contact state.
    # If effect currently appears before `const [contact, setContact]`, relocate it.

    # find effect block
    effect_pattern = re.compile(
        r"\n\s*// Step 2: as soon as the user types a real phone number, scope the cart to that phone.*?\n\s*}, \[contact\.phone\]\);\n",
        re.S
    )
    m = effect_pattern.search(s)
    if m:
        effect_block = m.group(0)
        s_wo = s[:m.start()] + "\n" + s[m.end():]

        # insert after contact state initialization block
        # anchor: const [contact, setContact] = useState<ContactInfo>({
        anchor = "  const [contact, setContact] = useState<ContactInfo>({"
        idx = s_wo.find(anchor)
        if idx != -1:
            # insert after the closing `});` of the contact init
            end_idx = s_wo.find("  });", idx)
            if end_idx != -1:
                end_idx = end_idx + len("  });")
                s = s_wo[:end_idx] + effect_block + s_wo[end_idx:]
            else:
                s = s_wo
        else:
            s = s_wo

    # 4) Fix onSubmit so we:
    # - generate accessCode once
    # - setCustomer({phone, accessCode})
    # - use that accessCode in request
    # - clear cart BEFORE redirect
    # - remove the broken `return;alert(...)` line
    #
    # Replace `accessCode: makeAccessCode(),` with `accessCode,` and create const accessCode above request.
    if "const accessCode = makeAccessCode();" not in s:
        s = s.replace(
            "    const request = {",
            "    const accessCode = makeAccessCode();\n\n"
            "    // Step 2: lock the active customer to phone+accessCode at submit time\n"
            "    // so future cart reads are isolated to this customer session.\n"
            "    cart.setCustomer({ phone: contact.phone, accessCode });\n\n"
            "    const request = {"
        )
    s = s.replace("      accessCode: makeAccessCode(),", "      accessCode,")

    # Remove the broken line: `return;alert("Request submitted! (Saved locally for now.)");`
    s = s.replace('    return;alert("Request submitted! (Saved locally for now.)");\n', "")

    # Ensure cart.clear() happens before redirect and we don't early-return before clear
    # Current code does: setItem -> window.location.href -> return; (then cart.clear() never runs)
    # We'll rewrite that section safely with a regex around the redirect lines.
    s = re.sub(
        r'localStorage\.setItem\("rv_requests", JSON\.stringify\(\[request, \.\.\.existing\]\)\);\s*\n\s*// ✅ Redirect to confirmation page\s*\n\s*window\.location\.href = `/request-confirmed/\$\{$begin:math:text$request as any$end:math:text$\.id\}`;\s*\n\s*return;\s*\n\s*\n\s*cart\.clear\(\);\s*\n\s*setSelectedSlotISO\(""\);\s*\n\s*setContact\(\{ name: "", phone: "", address: "", notes: "", photos: \[\] \}\);\s*',
        'localStorage.setItem("rv_requests", JSON.stringify([request, ...existing]));\n\n'
        '    // Clear this customer cart after submit (prevents old items showing later)\n'
        '    cart.clear();\n'
        '    setSelectedSlotISO("");\n'
        '    setContact({ name: "", phone: "", address: "", notes: "", photos: [] });\n\n'
        '    // ✅ Redirect to confirmation page\n'
        '    window.location.href = `/request-confirmed/${(request as any).id}`;\n'
        '    return;\n',
        s,
        flags=re.S
    )

    write(p, s)

patch_customer_portal()
patch_schedule()
print("✅ Step 2 patches applied to CustomerPortal + Schedule")
PY

echo
echo "Done. Now print the updated files to verify:"
bash print-step2-customer-identity.sh
