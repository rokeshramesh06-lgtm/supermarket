export function Footer() {
  return (
    <footer className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="page-shell panel panel-strong grid gap-5 px-6 py-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="display-font text-3xl font-semibold leading-none">Verdura Market</p>
          <p className="mt-3 max-w-md text-sm text-[color:var(--muted)]">
            Fresh groceries, stronger brand color, and a more professional online supermarket experience.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--brand)]">Store experience</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Search products, manage cart, checkout quickly, and review orders from one polished flow.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--brand)]">Platform</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Built with Next.js and SQLite with responsive layouts for mobile and desktop.
          </p>
        </div>
      </div>
    </footer>
  );
}
