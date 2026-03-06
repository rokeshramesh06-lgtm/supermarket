import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrder, upsertAddress } from "@/lib/data";
import type { Address, OrderRequestItem, PaymentMethod } from "@/lib/types";

function isPaymentMethod(value: string): value is PaymentMethod {
  return value === "UPI" || value === "Card" || value === "Cash on Delivery";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in before placing an order." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      items?: OrderRequestItem[];
      paymentMethod?: string;
      address?: Address;
      saveAddress?: boolean;
    };

    const address = body.address;

    if (!address) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    if (!body.paymentMethod || !isPaymentMethod(body.paymentMethod)) {
      return NextResponse.json({ error: "Choose a valid payment method." }, { status: 400 });
    }

    const orderId = createOrder({
      userId: user.id,
      items: body.items,
      paymentMethod: body.paymentMethod,
      address,
    });

    if (body.saveAddress) {
      upsertAddress(user.id, address);
    }

    revalidatePath("/");
    revalidatePath("/account");
    revalidatePath("/admin");

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
