import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  return (
    <div className="page-shell">
      <section className="panel panel-strong mx-auto max-w-3xl p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="eyebrow mt-6">Order Confirmed</p>
        <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
          Your groceries are on the way.
        </h1>
        <p className="mt-4 text-base text-[color:var(--muted)]">
          {orderId ? `Order #${orderId} has been placed successfully.` : "Your supermarket order has been placed successfully."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="button-primary" href="/account">
            View my orders
          </Link>
          <Link className="button-secondary" href="/#products">
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
