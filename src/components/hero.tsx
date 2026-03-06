import Link from "next/link";
import { ArrowRight, BadgePercent, ShieldCheck, Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="panel panel-strong relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-[color:var(--accent)]/25 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[color:var(--brand)]/15 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="eyebrow">Beautiful supermarket storefront</p>
          <h1 className="display-font mt-4 max-w-3xl text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">
            Fresh essentials, styled for modern grocery shopping.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            Verdura Market combines a premium supermarket look with practical customer flows: search, categories, cart, login, delivery address, online ordering, and an admin panel for store management.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link className="button-primary" href="/#products">
              Explore products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="button-secondary" href="/checkout">
              Go to checkout
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/70 p-4">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-semibold">Fast dispatch</span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Local delivery flow designed for daily essentials.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Account ready</span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Customer login and stored address for repeat orders.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <BadgePercent className="h-4 w-4" />
                <span className="text-sm font-semibold">Smart checkout</span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                UPI, cards, and cash on delivery built into the flow.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[32px] bg-[linear-gradient(135deg,#1f4b33_0%,#2f7b56_55%,#5fa46f_100%)] p-6 text-white shadow-[0_30px_70px_rgba(31,75,51,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Fresh Basket
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {["Fruits", "Vegetables", "Dairy", "Beverages"].map((label) => (
                <div key={label} className="rounded-[22px] bg-white/12 px-4 py-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-xs text-white/70">Curated daily stock</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-[#f4e1bf] p-5">
              <p className="text-sm font-semibold text-[#7f531c]">Designed for mobile</p>
              <p className="mt-2 text-sm text-[#80551d]">
                Product discovery, cart controls, and checkout all scale cleanly to small screens.
              </p>
            </div>
            <div className="rounded-[28px] bg-[#ddebd8] p-5">
              <p className="text-sm font-semibold text-[color:var(--brand)]">Admin ready</p>
              <p className="mt-2 text-sm text-[color:var(--brand)]">
                Add or edit products, update order status, and review customer records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
