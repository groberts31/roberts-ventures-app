import React, { createContext, useContext, useMemo, useState } from "react";
import type { Service } from "./services";

export type CartItem = {
  serviceId: string;
  qty: number;
  note: string;
};

type CartState = {
  items: CartItem[];
  add: (service: Service) => void;
  remove: (serviceId: string) => void;
  setQty: (serviceId: string, qty: number) => void;
  setNote: (serviceId: string, note: string) => void;
  clear: () => void;
  count: number; // total quantity
  has: (serviceId: string) => boolean;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (service: Service) => {
    setItems((prev) => {
      const found = prev.find((i) => i.serviceId === service.id);
      if (found) {
        return prev.map((i) =>
          i.serviceId === service.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { serviceId: service.id, qty: 1, note: "" }];
    });
  };

  const remove = (serviceId: string) => {
    setItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  };

  const setQty = (serviceId: string, qty: number) => {
    const safeQty = Number.isFinite(qty) ? Math.max(1, Math.min(99, qty)) : 1;
    setItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? { ...i, qty: safeQty } : i))
    );
  };

  const setNote = (serviceId: string, note: string) => {
    setItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? { ...i, note } : i))
    );
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const has = (serviceId: string) => items.some((i) => i.serviceId === serviceId);

  const value: CartState = {
    items,
    add,
    remove,
    setQty,
    setNote,
    clear,
    count,
    has,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
