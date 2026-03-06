"use client";

import Link from "next/link";
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { Address, PaymentMethod, UserSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type CheckoutPanelProps = {
  user: UserSummary | null;
  savedAddress: Address | null;
};

const paymentOptions: PaymentMethod[] = ["UPI", "Card", "Cash on Delivery"];

function getInitialAddress(user: UserSummary | null, savedAddress: Address | null): Address {
  return (
    savedAddress ?? {
      recipientName: user?.name ?? "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      deliveryNotes: "",
    }
  );
}

export function CheckoutPanel({ user, savedAddress }: CheckoutPanelProps) {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart, hydrated } = useCart();
  const [address, setAddress] = useState<Address>(() => getInitialAddress(user, savedAddress));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [saveAddress, setSaveAddress] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = subtotal >= 900 || subtotal === 0 ? 0 : 60;
  const total = subtotal + deliveryFee;

  const canSubmit =
    Boolean(user) &&
    items.length > 0 &&
    Boolean(address.recipientName) &&
    Boolean(address.phone) &&
    Boolean(address.line1) &&
    Boolean(address.city) &&
    Boolean(address.state) &&
    Boolean(address.pincode);

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }

    if (!canSubmit) {
      setError("Complete your delivery address before placing the order.");
      return;
    }

    setSubmitting(true);
    setError("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        address,
        saveAddress,
      }),
    });

    const data = (await response.json()) as { orderId?: number; error?: string };

    if (!response.ok || !data.orderId) {
      setError(data.error ?? "Could not place the order.");
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push(`/order-success?orderId=${data.orderId}`);
  };

  if (!hydrated) {
    return <div className="panel p-8 text-center text-sm text-[color:var(--muted)]">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-[color:var(--brand)]">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold">Your cart is empty.</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Add some products from the catalogue before heading to checkout.
        </p>
        <Link className="button-primary mt-6" href="/#products">
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <section className="panel p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">Delivery details</h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Fill in where the order should be delivered.
              </p>
            </div>
            {user ? (
              <div className="rounded-full bg-[#eff7ef] px-4 py-2 text-sm font-semibold text-[color:var(--brand)]">
                Signed in as {user.name}
              </div>
            ) : null}
          </div>

          {!user ? (
            <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Sign in first to place your order.
              <div className="mt-3 flex flex-wrap gap-3">
                <Link className="button-primary" href="/login?next=/checkout">
                  Log in
                </Link>
                <Link className="button-secondary" href="/register?next=/checkout">
                  Register
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="recipientName">
                Recipient name
              </label>
              <input
                id="recipientName"
                className="input"
                value={address.recipientName}
                onChange={(event) => setAddress((current) => ({ ...current, recipientName: event.target.value }))}
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
                value={address.phone}
                onChange={(event) => setAddress((current) => ({ ...current, phone: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="line1">
              Address line 1
            </label>
            <input
              id="line1"
              className="input"
              value={address.line1}
              onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))}
              required
            />
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="line2">
              Address line 2
            </label>
            <input
              id="line2"
              className="input"
              value={address.line2}
              onChange={(event) => setAddress((current) => ({ ...current, line2: event.target.value }))}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="city">
                City
              </label>
              <input
                id="city"
                className="input"
                value={address.city}
                onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="state">
                State
              </label>
              <input
                id="state"
                className="input"
                value={address.state}
                onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="pincode">
                Pincode
              </label>
              <input
                id="pincode"
                className="input"
                value={address.pincode}
                onChange={(event) => setAddress((current) => ({ ...current, pincode: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="deliveryNotes">
              Delivery notes
            </label>
            <textarea
              id="deliveryNotes"
              className="textarea"
              value={address.deliveryNotes}
              onChange={(event) => setAddress((current) => ({ ...current, deliveryNotes: event.target.value }))}
              placeholder="Landmark, flat number, or delivery preference"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-white/70 px-4 py-3">
            <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
            <span className="text-sm font-semibold">Save this address to my account</span>
          </label>
        </section>

        <section className="panel p-8">
          <div className="flex items-center gap-2 text-[color:var(--brand)]">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-sm font-semibold">Secure payment options</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {paymentOptions.map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-[24px] border px-4 py-4 transition ${
                  paymentMethod === option
                    ? "border-[color:var(--brand)] bg-[#eff7ef]"
                    : "border-[color:var(--border)] bg-white/72"
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === option}
                  onChange={() => setPaymentMethod(option)}
                />
                <p className="font-semibold">{option}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {option === "UPI" && "Fastest checkout for mobile payments."}
                  {option === "Card" && "Pay now with debit or credit card."}
                  {option === "Cash on Delivery" && "Pay at your doorstep on arrival."}
                </p>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="panel p-8">
          <h2 className="text-3xl font-semibold">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <article key={item.productId} className="rounded-[24px] border border-[color:var(--border)] bg-white/72 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {formatCurrency(item.price)} • {item.unit}
                    </p>
                  </div>
                  <button type="button" className="text-[color:var(--muted)]" onClick={() => removeItem(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-[#f6f0e2] px-2 py-1">
                    <button type="button" className="rounded-full p-1 text-[color:var(--brand)]" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button type="button" className="rounded-full p-1 text-[color:var(--brand)]" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel-strong p-8">
          <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--muted)]">
            <span>Delivery fee</span>
            <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[color:var(--border)] pt-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-[color:var(--brand)]">{formatCurrency(total)}</span>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting || !canSubmit}>
            {submitting ? "Placing order..." : `Place order • ${formatCurrency(total)}`}
          </button>
          <p className="mt-3 text-xs text-[color:var(--muted)]">
            Free delivery applies automatically for baskets above {formatCurrency(900)}.
          </p>
        </section>
      </div>
    </form>
  );
}
