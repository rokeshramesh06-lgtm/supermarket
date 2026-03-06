import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrUpdateProduct } from "@/lib/data";
import { sanitizeText } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const formData = await request.formData();

  createOrUpdateProduct({
    id: Number(sanitizeText(formData.get("id"))) || undefined,
    name: sanitizeText(formData.get("name")),
    category: sanitizeText(formData.get("category")),
    price: Number(sanitizeText(formData.get("price"))),
    unit: sanitizeText(formData.get("unit")),
    imageUrl: sanitizeText(formData.get("imageUrl")),
    description: sanitizeText(formData.get("description")),
    featured: formData.get("featured") === "on",
    inStock: formData.get("inStock") === "on",
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.redirect(new URL("/admin#product-form", request.url), { status: 303 });
}
