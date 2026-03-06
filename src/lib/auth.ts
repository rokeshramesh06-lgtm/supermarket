import crypto from "node:crypto";
import { createRequire } from "node:module";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import * as demoStore from "@/lib/demo-store";
import { createUserAccount, getUserByEmailForAuth, getUserById } from "@/lib/data";
import type { UserSummary } from "@/lib/types";

const isVercel = Boolean(process.env.VERCEL);
const COOKIE_NAME = "verdura_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_SECRET =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "verdura-market-demo-session";
const require = createRequire(import.meta.url);
const sqliteAuth = isVercel ? null : (require("./auth-sqlite") as typeof import("./auth-sqlite"));

type SessionPayload = UserSummary & { exp: number };

function signSessionPayload(value: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function encodeSession(user: UserSummary) {
  const payload: SessionPayload = { ...user, exp: Date.now() + SESSION_DURATION_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signSessionPayload(encoded)}`;
}

function decodeSession(value: string) {
  const [encoded, signature] = value.split(".");

  if (!encoded || !signature || signSessionPayload(encoded) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;

    if (payload.exp <= Date.now()) {
      return null;
    }

    return demoStore.ensureSessionUser({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      createdAt: payload.createdAt,
    });
  } catch {
    return null;
  }
}

async function setDemoSession(user: UserSummary) {
  const store = await cookies();

  store.set(COOKIE_NAME, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

async function clearDemoSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  if (!isVercel) {
    return sqliteAuth!.getCurrentUser();
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const user = decodeSession(token);

  if (!user) {
    store.delete(COOKIE_NAME);
    return null;
  }

  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  if (!isVercel) {
    return sqliteAuth!.loginUser(input);
  }

  const user = getUserByEmailForAuth(input.email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.passwordHash || !bcrypt.compareSync(input.password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  } satisfies UserSummary;

  await setDemoSession(sessionUser);
  return { ...sessionUser, passwordHash: user.passwordHash };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  if (!isVercel) {
    return sqliteAuth!.registerUser(input);
  }

  const existing = getUserByEmailForAuth(input.email);

  if (existing) {
    throw new Error("Email already exists.");
  }

  const userId = createUserAccount({
    name: input.name,
    email: input.email,
    passwordHash: bcrypt.hashSync(input.password, 10),
  });
  const user = getUserById(userId);

  if (!user) {
    throw new Error("Could not create your account.");
  }

  await setDemoSession(user);
  return user;
}

export async function logoutUser() {
  if (!isVercel) {
    await sqliteAuth!.logoutUser();
    return;
  }

  await clearDemoSession();
}
