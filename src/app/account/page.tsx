import { CheckCircle2, MapPin, Package2, User2 } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser, getUserAccount } from "@/lib/data";
import { formatCurrency, formatDate, formatOrderStatusClass, formatSavedAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams: Promise<{
    saved?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const params = await searchParams;
  const account = getUserAccount(user.id);
  const orders = getOrdersForUser(user.id);

  if (!account) {
    redirect("/login?error=auth");
  }

  const saved = params.saved === "1";

  return (
    <div className="page-shell space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-strong p-8">
          <p className="eyebrow">My Account</p>
          <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
            Welcome, {account.name}.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[color:var(--muted)]">
            Manage your saved delivery address, review recent orders, and keep your checkout details ready for the next basket.
          </p>

          {saved ? (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Delivery address saved.
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/70 p-5">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <User2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Profile</span>
              </div>
              <p className="mt-3 text-lg font-semibold">{account.email}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Member since {formatDate(account.createdAt)}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-5">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-semibold">Saved address</span>
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                {account.address ? formatSavedAddress(account.address) : "No delivery address saved yet."}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-5">
              <div className="flex items-center gap-2 text-[color:var(--brand)]">
                <Package2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Orders</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-[color:var(--brand)]">{orders.length}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">order{orders.length === 1 ? "" : "s"} placed</p>
            </div>
          </div>
        </div>

        <section className="panel p-8">
          <h2 className="text-2xl font-semibold">Saved delivery address</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            This address is pre-filled during checkout.
          </p>

          <form action="/account/address" method="post" className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="recipientName">
                  Recipient name
                </label>
                <input
                  id="recipientName"
                  className="input"
                  type="text"
                  name="recipientName"
                  defaultValue={account.address?.recipientName ?? account.name}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="phone">
                  Phone number
                </label>
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  name="phone"
                  defaultValue={account.address?.phone ?? ""}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="line1">
                Address line 1
              </label>
              <input
                id="line1"
                className="input"
                type="text"
                name="line1"
                defaultValue={account.address?.line1 ?? ""}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="line2">
                Address line 2
              </label>
              <input
                id="line2"
                className="input"
                type="text"
                name="line2"
                defaultValue={account.address?.line2 ?? ""}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="city">
                  City
                </label>
                <input id="city" className="input" type="text" name="city" defaultValue={account.address?.city ?? ""} required />
              </div>
              <div>
                <label className="field-label" htmlFor="state">
                  State
                </label>
                <input id="state" className="input" type="text" name="state" defaultValue={account.address?.state ?? ""} required />
              </div>
              <div>
                <label className="field-label" htmlFor="pincode">
                  Pincode
                </label>
                <input id="pincode" className="input" type="text" name="pincode" defaultValue={account.address?.pincode ?? ""} required />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="deliveryNotes">
                Delivery notes
              </label>
              <textarea
                id="deliveryNotes"
                className="textarea"
                name="deliveryNotes"
                defaultValue={account.address?.deliveryNotes ?? ""}
                placeholder="Apartment, landmark, or drop-off preference"
              />
            </div>

            <button className="button-primary w-full sm:w-auto" type="submit">
              Save address
            </button>
          </form>
        </section>
      </section>

      <section className="panel p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Orders</p>
            <h2 className="text-3xl font-semibold">Recent supermarket orders</h2>
          </div>
          <a className="button-secondary" href="/checkout">
            Start a new order
          </a>
        </div>

        {orders.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold">Order #{order.id}</h3>
                      <span className={`status-pill ${formatOrderStatusClass(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      Placed on {formatDate(order.createdAt)} via {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-sm text-[color:var(--muted)]">Order total</p>
                    <p className="text-2xl font-bold text-[color:var(--brand)]">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm">
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-[color:var(--muted)]">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[24px] bg-[#f8f3e8] p-4 text-sm text-[color:var(--muted)]">
                    <p className="font-semibold text-[color:var(--foreground)]">Delivered to</p>
                    <p className="mt-2 whitespace-pre-line">{formatSavedAddress(order.addressSnapshot)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] bg-white/70 p-8 text-center">
            <h3 className="text-xl font-semibold">No orders yet.</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Add products to your cart and place your first delivery order.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
