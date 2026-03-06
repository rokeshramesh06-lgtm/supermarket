import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { getSafeRedirectPath, sanitizeText } from "@/lib/utils";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = sanitizeText(formData.get("email")).toLowerCase();
  const password = sanitizeText(formData.get("password"));
  const next = getSafeRedirectPath(sanitizeText(formData.get("next")), "");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(`/login?error=missing${next ? `&next=${encodeURIComponent(next)}` : ""}`, request.url),
      { status: 303 },
    );
  }

  try {
    const user = await loginUser({ email, password });
    const redirectPath = next || (user.role === "admin" ? "/admin" : "/account");
    return NextResponse.redirect(new URL(redirectPath, request.url), { status: 303 });
  } catch {
    return NextResponse.redirect(
      new URL(`/login?error=invalid${next ? `&next=${encodeURIComponent(next)}` : ""}`, request.url),
      { status: 303 },
    );
  }
}
