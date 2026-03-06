"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
          <div className="page-shell">
            <section className="panel panel-strong mx-auto max-w-3xl p-10 text-center">
              <p className="eyebrow">Application Error</p>
              <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
                The storefront could not finish loading.
              </h1>
              <p className="mt-4 text-sm text-[color:var(--muted)]">
                Refresh the page or try again in a moment.
              </p>
              {error.digest ? (
                <p className="mt-3 text-xs text-[color:var(--muted)]">
                  Error reference: {error.digest}
                </p>
              ) : null}
              <button className="button-primary mt-6" type="button" onClick={reset}>
                Retry
              </button>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
