import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ChartNoAxesCombined,
  Clock3,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

export function Hero() {
  return (
    <section className="panel panel-strong relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(15,118,110,0.16),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(255,122,89,0.18),transparent_22%),radial-gradient(circle_at_72%_88%,rgba(79,125,243,0.14),transparent_20%)]" />
      <div className="absolute -right-12 top-6 h-40 w-40 rounded-full bg-[color:var(--accent)]/18 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[color:var(--brand)]/15 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="chip w-fit bg-white/80 text-[color:var(--brand)]">
            <Sparkles className="h-4 w-4" />
            Better design theme
          </div>
          <h1 className="display-font mt-4 max-w-3xl text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">
            A brighter, more professional supermarket experience.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            Verdura Market now uses a sharper premium retail theme with richer color, cleaner structure, and a more confident storefront while keeping search, cart, checkout, and admin workflows intact.
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
            <div className="metric-card p-4">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-semibold">Fast dispatch</span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Local delivery flow designed for daily essentials.
              </p>
            </div>
            <div className="metric-card p-4">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Account ready</span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Customer login and stored address for repeat orders.
              </p>
            </div>
            <div className="metric-card p-4">
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
          <div className="rounded-[34px] border border-white/40 bg-[linear-gradient(135deg,#10263a_0%,#124b61_46%,#0f766e_100%)] p-6 text-white shadow-[0_30px_70px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  Premium grocery storefront
                </p>
                <h2 className="mt-4 text-3xl font-semibold">Fresh basket dashboard</h2>
              </div>
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                Same-day delivery
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Fruits", meta: "Seasonal picks" },
                { label: "Vegetables", meta: "Daily greens" },
                { label: "Dairy", meta: "Chilled stock" },
                { label: "Beverages", meta: "Ready to serve" },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] bg-white/12 px-4 py-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-white/70">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,#fff1dc_0%,#ffe6c2_100%)] p-5 shadow-[0_18px_35px_rgba(247,196,83,0.16)]">
              <div className="flex items-center gap-2 text-[#8a5b10]">
                <Clock3 className="h-4 w-4" />
                <p className="text-sm font-semibold">Designed for mobile</p>
              </div>
              <p className="mt-2 text-sm text-[#87591a]">
                Product discovery, cart controls, and checkout scale cleanly from phone to desktop.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,#e9f9f6_0%,#d8f3ee_100%)] p-5 shadow-[0_18px_35px_rgba(15,118,110,0.12)]">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <ChartNoAxesCombined className="h-4 w-4" />
                <p className="text-sm font-semibold">Admin ready</p>
              </div>
              <p className="mt-2 text-sm text-[color:var(--brand-deep)]">
                Add products, manage orders, and review customers from a cleaner control panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
