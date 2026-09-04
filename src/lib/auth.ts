// Server tomonidagi auth yordamchilari (route handler / server komponentlari uchun)
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE_NOMI, signToken, verifyToken, type SessionPayload } from "./jwt";

export { COOKIE_NOMI, signToken, verifyToken };
export type { SessionPayload };

// Parolni heshlash / tekshirish
export async function hashPassword(parol: string): Promise<string> {
  return bcrypt.hash(parol, 10);
}
export async function comparePassword(parol: string, hash: string): Promise<boolean> {
  return bcrypt.compare(parol, hash);
}

// Joriy sessiyani cookie'dan olish
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NOMI)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Cookie o'rnatish / o'chirish
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NOMI, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NOMI);
}
