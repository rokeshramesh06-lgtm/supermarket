import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { getSafeRedirectPath, sanitizeText } from "@/lib/utils";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = sanitizeText(formData.get("name"));
  const email = sanitizeText(formData.get("email")).toLowerCase();
  const password = sanitizeText(formData.get("password"));
  const next = getSafeRedirectPath(sanitizeText(formData.get("next")), "");

  if (!name || !email || !password) {
    return NextResponse.redirect(
      new URL(`/register?error=missing${next ? `&next=${encodeURIComponent(next)}` : ""}`, request.url),
      { status: 303 },
    );
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      new URL(`/register?error=weak${next ? `&next=${encodeURIComponent(next)}` : ""}`, request.url),
      { status: 303 },
    );
  }

  try {
    await registerUser({ name, email, password });
    return NextResponse.redirect(new URL(next || "/account", request.url), { status: 303 });
  } catch {
    return NextResponse.redirect(
      new URL(`/register?error=exists${next ? `&next=${encodeURIComponent(next)}` : ""}`, request.url),
      { status: 303 },
    );
  }
}
