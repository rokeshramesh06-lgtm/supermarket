import Link from "next/link";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMap: Record<string, string> = {
  exists: "That email address is already registered.",
  missing: "Fill in your name, email, and password.",
  weak: "Use at least 6 characters for the password.",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error =
    typeof params.error === "string" ? errorMap[params.error] ?? "Could not create your account." : "";
  const next = typeof params.next === "string" ? params.next : "";

  return (
    <div className="page-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-8 sm:p-10">
        <p className="eyebrow">Register</p>
        <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
          Set up your fresh delivery profile.
        </h1>
        <p className="mt-4 text-base text-[color:var(--muted)]">
          Create a customer account to save delivery details, manage orders, and move through checkout faster.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-[color:var(--muted)]">
          <li>Save a delivery address for repeat orders</li>
          <li>Track order status from your account dashboard</li>
          <li>Pay using UPI, card, or cash on delivery</li>
        </ul>
      </section>

      <section className="panel panel-strong p-8 sm:p-10">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Your supermarket account is ready in less than a minute.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action="/auth/register" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="field-label" htmlFor="name">
              Full name
            </label>
            <input id="name" className="input" type="text" name="name" placeholder="Riya Sharma" required />
          </div>

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
            <input id="password" className="input" type="password" name="password" placeholder="At least 6 characters" required />
          </div>

          <button className="button-primary w-full" type="submit">
            Create account
          </button>
        </form>

        <p className="mt-5 text-sm text-[color:var(--muted)]">
          Already have an account?{" "}
          <Link className="font-semibold text-[color:var(--brand)]" href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
