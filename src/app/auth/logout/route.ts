import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth";

export async function POST(request: Request) {
  await logoutUser();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
