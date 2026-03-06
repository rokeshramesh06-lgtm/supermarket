import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { upsertAddress } from "@/lib/data";
import { sanitizeText } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url), { status: 303 });
  }

  const formData = await request.formData();

  upsertAddress(user.id, {
    recipientName: sanitizeText(formData.get("recipientName")),
    phone: sanitizeText(formData.get("phone")),
    line1: sanitizeText(formData.get("line1")),
    line2: sanitizeText(formData.get("line2")),
    city: sanitizeText(formData.get("city")),
    state: sanitizeText(formData.get("state")),
    pincode: sanitizeText(formData.get("pincode")),
    deliveryNotes: sanitizeText(formData.get("deliveryNotes")),
  });

  revalidatePath("/account");
  revalidatePath("/checkout");

  return NextResponse.redirect(new URL("/account?saved=1", request.url), { status: 303 });
}
