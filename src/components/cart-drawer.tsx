"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";
import type { UserSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: UserSummary | null;
};

export function CartDrawer({ open, onClose, user }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const deliveryFee = subtotal >= 900 || subtotal === 0 ? 0 : 60;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-sm">
      <button type="button" className="flex-1" aria-label="Close cart" onClick={onClose} />

      <aside className="flex h-full w-full max-w-md flex-col bg-[#fcf8f0] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Shopping Cart</p>
            <h2 className="mt-2 text-2xl font-semibold">Your basket</h2>
          </div>
          <button type="button" className="rounded-full bg-white/80 p-2 text-[color:var(--foreground)]" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length > 0 ? (
          <>
            <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <article key={item.productId} className="rounded-[24px] border border-[color:var(--border)] bg-white/80 p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-2 font-semibold">{item.name}</h3>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            {formatCurrency(item.price)} • {item.unit}
                          </p>
                        </div>
                        <button type="button" className="text-[color:var(--muted)]" onClick={() => removeItem(item.productId)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full bg-[#f6f0e2] px-2 py-1">
                          <button type="button" className="rounded-full p-1 text-[color:var(--brand)]" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button type="button" className="rounded-full p-1 text-[color:var(--brand)]" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-[28px] border border-[color:var(--border)] bg-white/85 p-5">
              <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-[color:var(--muted)]">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal + deliveryFee)}</span>
              </div>

              <div className="mt-5 grid gap-3">
                <Link className="button-primary w-full" href="/checkout" onClick={onClose}>
                  <ShoppingBag className="h-4 w-4" />
                  {user ? "Proceed to checkout" : "Sign in to checkout"}
                </Link>
                <button type="button" className="button-secondary w-full" onClick={onClose}>
                  Continue shopping
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-white/80 p-4 text-[color:var(--brand)]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Your cart is empty.</h3>
            <p className="mt-2 max-w-xs text-sm text-[color:var(--muted)]">
              Add fruits, vegetables, groceries, and snacks to see them here.
            </p>
            <button type="button" className="button-primary mt-5" onClick={onClose}>
              Browse products
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
