import {
  Apple,
  Candy,
  Coffee,
  Leaf,
  Milk,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { getCategorySummaries, getProducts } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

const iconMap = {
  Fruits: Apple,
  Vegetables: Leaf,
  Dairy: Milk,
  Beverages: Coffee,
  Snacks: Candy,
  Groceries: Package,
} as const;

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const products = getProducts({ query, category });
  const categories = getCategorySummaries();

  return (
    <div className="page-shell flex flex-col gap-8">
      <Hero />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel overflow-hidden bg-[linear-gradient(135deg,#10263a_0%,#154d63_58%,#0f766e_100%)] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Fast Delivery</p>
          <h2 className="mt-3 text-2xl font-semibold">Groceries in under 30 minutes.</h2>
          <p className="mt-2 text-sm text-white/78">
            Fresh produce, dairy, snacks, and pantry essentials ready for same-day ordering.
          </p>
        </div>
        <div className="panel panel-strong p-6">
          <div className="flex items-center gap-3 text-[color:var(--brand)]">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-semibold">Free delivery above {formatCurrency(900)}</span>
          </div>
          <div className="mt-4 flex items-center gap-3 text-[color:var(--brand)]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">Trusted checkout with UPI, card, or cash</span>
          </div>
        </div>
        <div className="panel overflow-hidden bg-[linear-gradient(180deg,#fff0ea_0%,#ffe1d7_100%)] p-6">
          <p className="text-sm font-semibold text-[color:var(--muted)]">
            Featured assortment
          </p>
          <p className="mt-3 text-4xl font-bold text-[color:var(--accent-strong)]">{products.length}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            curated products visible in the live catalogue
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <FilterBar query={query} activeCategory={category} />

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((item) => {
            const Icon = iconMap[item.name];

            return (
              <Link
                key={item.name}
                href={`/?category=${encodeURIComponent(item.name)}#products`}
                className={`panel flex min-h-[168px] flex-col justify-between bg-gradient-to-br ${item.accent} p-5 transition-transform duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-[18px] bg-white/72 p-3 text-[color:var(--brand)] shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
                    {item.count} items
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{item.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="products" className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="display-font text-4xl font-semibold leading-none sm:text-5xl">
              Fresh finds for every basket.
            </h2>
          </div>
          {(query || category) && (
            <p className="text-sm text-[color:var(--muted)]">
              Showing results
              {query ? ` for "${query}"` : ""}
              {category ? ` in ${category}` : ""}
            </p>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="panel p-8 text-center">
            <h3 className="text-xl font-semibold">No products matched your search.</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Try a different keyword or clear the category filter to see the full selection.
            </p>
            <Link className="button-secondary mt-5" href="/#products">
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
