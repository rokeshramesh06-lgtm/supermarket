import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { UserSummary } from "@/lib/types";

const COOKIE_NAME = "verdura_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const store = await cookies();

  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  db.prepare(`
    INSERT INTO sessions (user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(userId, hashToken(token), expiresAt, new Date().toISOString());

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function getSessionUser() {
  const store = await cookies();
  const sessionToken = store.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());

  const user = db
    .prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at AS createdAt
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?
      LIMIT 1
    `)
    .get(hashToken(sessionToken), new Date().toISOString()) as UserSummary | undefined;

  if (!user) {
    store.delete(COOKIE_NAME);
    return null;
  }

  return user;
}

export async function destroySession() {
  const store = await cookies();
  const sessionToken = store.get(COOKIE_NAME)?.value;

  if (sessionToken) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(sessionToken));
  }

  store.delete(COOKIE_NAME);
}
