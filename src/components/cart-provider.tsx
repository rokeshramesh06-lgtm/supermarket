"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "verdura-market-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);

      if (!existing) {
        return [...current, { ...item, quantity: 1 }];
      }

      return current.map((entry) =>
        entry.productId === item.productId
          ? { ...entry, quantity: Math.min(entry.quantity + 1, 20) }
          : entry,
      );
    });
  };

  const removeItem = (productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(quantity, 20) } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        hydrated,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
