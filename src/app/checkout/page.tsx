import { CheckoutPanel } from "@/components/checkout-panel";
import { getCurrentUser } from "@/lib/auth";
import { getUserAccount } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const account = user ? getUserAccount(user.id) : null;

  return (
    <div className="page-shell space-y-6">
      <section className="panel panel-strong p-8">
        <p className="eyebrow">Checkout</p>
        <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
          Finalise your supermarket order.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[color:var(--muted)]">
          Review cart items, confirm delivery details, and choose how you want to pay.
        </p>
      </section>

      <CheckoutPanel user={user} savedAddress={account?.address ?? null} />
    </div>
  );
}
