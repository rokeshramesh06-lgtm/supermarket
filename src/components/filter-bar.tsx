import Link from "next/link";
import { Search } from "lucide-react";
import { productCategories } from "@/lib/types";

type FilterBarProps = {
  query: string;
  activeCategory: string;
};

function buildHref(category: string, query: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category) {
    params.set("category", category);
  }

  const value = params.toString();
  return value ? `/?${value}#products` : "/#products";
}

export function FilterBar({ query, activeCategory }: FilterBarProps) {
  return (
    <section className="panel panel-strong overflow-hidden p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,89,0.1),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.12),transparent_26%)]" />
      <p className="eyebrow">Search & Categories</p>
      <h2 className="mt-3 text-3xl font-semibold">Find what you need quickly.</h2>
      <p className="mt-2 max-w-xl text-sm text-[color:var(--muted)]">
        Search the live catalogue or jump into curated product groups designed with a cleaner store navigation flow.
      </p>
      <form action="/" method="get" className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="category" value={activeCategory} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <input
            className="input pl-11"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search fruits, dairy, snacks, groceries..."
          />
        </div>
        <button className="button-primary" type="submit">
          Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={buildHref("", query)}
          className={
            activeCategory
              ? "button-ghost px-4 py-2 text-sm"
              : "button-secondary px-4 py-2 text-sm"
          }
        >
          All
        </Link>
        {productCategories.map((category) => (
          <Link
            key={category}
            href={buildHref(category, query)}
            className={
              activeCategory === category
                ? "button-secondary px-4 py-2 text-sm"
                : "button-ghost px-4 py-2 text-sm"
            }
          >
            {category}
          </Link>
        ))}
      </div>
    </section>
  );
}
