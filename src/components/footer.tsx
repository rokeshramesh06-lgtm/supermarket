export function Footer() {
  return (
    <footer className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="page-shell panel flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Verdura Market</p>
          <p className="text-sm text-[color:var(--muted)]">
            Fresh groceries, elegant ordering, and quick doorstep delivery.
          </p>
        </div>
        <div className="text-sm text-[color:var(--muted)]">
          Built with Next.js and SQLite for a compact supermarket stack.
        </div>
      </div>
    </footer>
  );
}
