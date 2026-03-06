"use client";

import Link from "next/link";
import { LayoutDashboard, Menu, ShoppingBasket, User2, X } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-provider";
import type { UserSummary } from "@/lib/types";

type HeaderProps = {
  user: UserSummary | null;
};

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="page-shell panel panel-strong flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#0f766e_0%,#23b7ab_100%)] text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)]">
              <ShoppingBasket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                Supermarket
              </p>
              <p className="display-font text-2xl font-semibold leading-none">Verdura Market</p>
              <p className="hidden text-xs text-[color:var(--muted)] sm:block">
                Fresh delivery with premium retail styling
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link className="button-ghost px-4 py-2 text-sm" href="/#products">
              Products
            </Link>
            <Link className="button-ghost px-4 py-2 text-sm" href="/checkout">
              Checkout
            </Link>
            {user ? (
              user.role === "admin" ? (
                <Link className="button-secondary px-4 py-2 text-sm" href="/admin">
                  Admin
                </Link>
              ) : (
                <Link className="button-secondary px-4 py-2 text-sm" href="/account">
                  Account
                </Link>
              )
            ) : (
              <Link className="button-secondary px-4 py-2 text-sm" href="/login">
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="button-primary px-4 py-2 text-sm" onClick={() => setCartOpen(true)}>
              <ShoppingBasket className="h-4 w-4" />
              <span>Cart</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{totalItems}</span>
            </button>

            {user ? (
              <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-[0_12px_22px_rgba(15,23,42,0.06)] md:flex">
                {user.role === "admin" ? (
                  <LayoutDashboard className="h-4 w-4 text-[color:var(--brand)]" />
                ) : (
                  <User2 className="h-4 w-4 text-[color:var(--brand)]" />
                )}
                <span className="text-sm font-semibold">{user.name}</span>
                <form action="/auth/logout" method="post">
                  <button type="submit" className="text-xs font-semibold text-[color:var(--muted)]">
                    Log out
                  </button>
                </form>
              </div>
            ) : null}

            <button
              type="button"
              className="rounded-full border border-white/70 bg-white/80 p-2 md:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="page-shell panel panel-strong mt-3 flex flex-col gap-3 px-5 py-4 md:hidden">
            <Link href="/#products" onClick={() => setMobileOpen(false)}>
              Products
            </Link>
            <Link href="/checkout" onClick={() => setMobileOpen(false)}>
              Checkout
            </Link>
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/account"} onClick={() => setMobileOpen(false)}>
                  {user.role === "admin" ? "Admin Panel" : "Account"}
                </Link>
                <form action="/auth/logout" method="post">
                  <button type="submit">Log out</button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login / Register
              </Link>
            )}
          </div>
        ) : null}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} user={user} />
    </>
  );
}
