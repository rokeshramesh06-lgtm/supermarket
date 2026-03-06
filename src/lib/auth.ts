import bcrypt from "bcryptjs";
import { createUserAccount, getUserByEmailForAuth, getUserById } from "@/lib/data";
import { createSession, destroySession, getSessionUser } from "@/lib/session";

export async function getCurrentUser() {
  return getSessionUser();
}

export async function loginUser(input: { email: string; password: string }) {
  const user = getUserByEmailForAuth(input.email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const passwordMatches = bcrypt.compareSync(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  await createSession(user.id);
  return user;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = getUserByEmailForAuth(input.email);

  if (existing) {
    throw new Error("Email already exists.");
  }

  const userId = createUserAccount({
    name: input.name,
    email: input.email,
    passwordHash: bcrypt.hashSync(input.password, 10),
  });

  await createSession(userId);
  return getUserById(userId);
}

export async function logoutUser() {
  await destroySession();
}
