import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Customer-scoped cart:
 * - Each "customer session" gets its own cart key in localStorage.
 * - That prevents the navbar cart count from showing items from other customers.
 *
 * How we scope:
 * - If customer phone exists, we use it (digits only).
 * - Optionally also include access code if you want stronger separation.
 */

export type CartLine = {
  serviceId: string;
  qty: number;
  note?: string;
};

export type CartState = {
  customerKey: string;          // computed key (phone / access)
  items: CartLine[];
  count: number;                  has: (serviceId: string) => boolean;
// total quantity
  add: (svc: { id: string }, qty?: number, note?: string) => void;
  remove: (serviceId: string) => void;
  setQty: (serviceId: string, qty: number) => void;
  setNote: (serviceId: string, note: string) => void;
  clear: () => void;

  // Customer session controls
  setCustomer: (args: { phone?: string; accessCode?: string }) => void;
};

const CartCtx = createContext<CartState | null>(null);

/** Where we store the "current customer" identity */
const ACTIVE_CUSTOMER_KEY = "rv_active_customer";

/** Prefix for cart storage */
const CART_PREFIX = "rv_cart:";

function normalizePhone(p?: string) {
  return String(p || "").replace(/\D+/g, "");
}

function normalizeCode(c?: string) {
  return String(c || "").replace(/\D+/g, "").slice(0, 12);
}

/**
 * Build a stable customerKey.
 * Choose ONE of these styles:
 *  A) phone only  -> rv_cart:<phone>
 *  B) phone+code  -> rv_cart:<phone>:<code>
 *
 * I’m using phone+code when code exists, otherwise phone only.
 */
function buildCustomerKey(phone?: string, accessCode?: string) {
  const p = normalizePhone(phone);
  const c = normalizeCode(accessCode);
  if (p && c) return `${p}:${c}`;
  if (p) return `${p}`;
  return "guest"; // fallback if no phone set yet
}

function cartStorageKey(customerKey: string) {
  return `${CART_PREFIX}${customerKey}`;
}

function readActiveCustomer(): { phone?: string; accessCode?: string } {
  try {
    const raw = localStorage.getItem(ACTIVE_CUSTOMER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      phone: typeof parsed?.phone === "string" ? parsed.phone : "",
      accessCode: typeof parsed?.accessCode === "string" ? parsed.accessCode : "",
    };
  } catch {
    return {};
  }
}

function writeActiveCustomer(v: { phone?: string; accessCode?: string }) {
  localStorage.setItem(
    ACTIVE_CUSTOMER_KEY,
    JSON.stringify({
      phone: v.phone || "",
      accessCode: v.accessCode || "",
      updatedAt: new Date().toISOString(),
    })
  );
}

function readCartItems(customerKey: string): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(cartStorageKey(customerKey)) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((x: any) => ({
        serviceId: String(x?.serviceId || ""),
        qty: Number(x?.qty || 0),
        note: typeof x?.note === "string" ? x.note : "",
      }))
      .filter((x) => x.serviceId && x.qty > 0);
  } catch {
    return [];
  }
}

function writeCartItems(customerKey: string, items: CartLine[]) {
  localStorage.setItem(cartStorageKey(customerKey), JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // load last active customer
  const active = readActiveCustomer();
  const [customerKey, setCustomerKey] = useState(() => buildCustomerKey(active.phone, active.accessCode));
  const [items, setItems] = useState<CartLine[]>(() => readCartItems(customerKey));

  // whenever customerKey changes, load that cart
  useEffect(() => {
    setItems(readCartItems(customerKey));
  }, [customerKey]);

  // persist cart changes
  useEffect(() => {
    writeCartItems(customerKey, items);
  }, [customerKey, items]);

  const count = useMemo(() => items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0), [items]);

  const api: CartState = useMemo(
    () => ({
      customerKey,
      items,
      count,
      has: (serviceId: string) => {
        const id = String(serviceId || "");
        if (!id) return false;
        return items.some((x) => x.serviceId === id);
      },

      add: (svc, qty = 1, note) => {
        const id = String((svc as any)?.id || "");
        if (!id) return;

        setItems((prev) => {
          const existing = prev.find((x) => x.serviceId === id);
          if (existing) {
            const next = prev.map((x) =>
              x.serviceId === id
                ? { ...x, qty: Math.max(1, (Number(x.qty) || 0) + Math.max(1, Number(qty) || 1)), note: note ?? x.note }
                : x
            );
            return next;
          }
          return [...prev, { serviceId: id, qty: Math.max(1, Number(qty) || 1), note: note || "" }];
        });
      },

      remove: (serviceId) => {
        const id = String(serviceId || "");
        if (!id) return;
        setItems((prev) => prev.filter((x) => x.serviceId !== id));
      },

      setQty: (serviceId, qty) => {
        const id = String(serviceId || "");
        const q = Math.max(0, Number(qty) || 0);
        setItems((prev) => {
          if (q <= 0) return prev.filter((x) => x.serviceId !== id);
          return prev.map((x) => (x.serviceId === id ? { ...x, qty: q } : x));
        });
      },

      setNote: (serviceId, note) => {
        const id = String(serviceId || "");
        setItems((prev) => prev.map((x) => (x.serviceId === id ? { ...x, note: String(note || "") } : x)));
      },

      clear: () => setItems([]),

      /**
       * Set the current customer identity.
       * Call this when a customer enters phone/accessCode (Schedule or CustomerPortal).
       * This automatically switches the cart to that customer’s cart.
       */
      setCustomer: ({ phone, accessCode }) => {
        writeActiveCustomer({ phone, accessCode });
        setCustomerKey(buildCustomerKey(phone, accessCode));
      },
    }),
    [customerKey, items, count]
  );

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const v = useContext(CartCtx);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
}
