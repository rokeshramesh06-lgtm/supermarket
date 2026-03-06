import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/data";
import { sanitizeText } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const id = Number(sanitizeText(formData.get("id")));
  const status = sanitizeText(formData.get("status"));

  updateOrderStatus(id, status);

  revalidatePath("/account");
  revalidatePath("/admin");

  return NextResponse.redirect(new URL("/admin#orders", request.url), { status: 303 });
}
