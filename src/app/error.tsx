"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="page-shell">
      <section className="panel panel-strong mx-auto max-w-3xl p-10 text-center">
        <p className="eyebrow">Something Went Wrong</p>
        <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
          We could not load this page.
        </h1>
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          Please try again. If the problem continues, refresh the site or redeploy the latest build.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-[color:var(--muted)]">
            Error reference: {error.digest}
          </p>
        ) : null}
        <button className="button-primary mt-6" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
