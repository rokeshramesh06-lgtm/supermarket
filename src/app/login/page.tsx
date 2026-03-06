import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMap: Record<string, string> = {
  invalid: "The email or password did not match our records.",
  missing: "Enter both your email address and password.",
  auth: "Please sign in to continue.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error =
    typeof params.error === "string" ? errorMap[params.error] ?? "Could not sign you in." : "";
  const next = typeof params.next === "string" ? params.next : "";

  return (
    <div className="page-shell grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="panel panel-strong overflow-hidden p-8 sm:p-10">
        <p className="eyebrow">Customer Login</p>
        <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
          Welcome back to your basket.
        </h1>
        <p className="mt-4 max-w-xl text-base text-[color:var(--muted)]">
          Sign in to access saved delivery details, view your recent orders, and move quickly from cart to checkout.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)]">
              Demo customer
            </p>
            <p className="mt-3 text-lg font-semibold">customer@verdura.market</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Password: `shop1234`</p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)]">
              Demo admin
            </p>
            <p className="mt-3 text-lg font-semibold">admin@verdura.market</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Password: `admin1234`</p>
          </div>
        </div>
      </section>

      <section className="panel p-8 sm:p-10">
        <h2 className="text-2xl font-semibold">Sign in</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Use your account to continue shopping and place orders.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action="/auth/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input id="email" className="input" type="email" name="email" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input id="password" className="input" type="password" name="password" placeholder="Enter password" required />
          </div>

          <button className="button-primary w-full" type="submit">
            Sign in
          </button>
        </form>

        <p className="mt-5 text-sm text-[color:var(--muted)]">
          New here?{" "}
          <Link className="font-semibold text-[color:var(--brand)]" href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
