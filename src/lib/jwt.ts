// Edge-xavfsiz JWT yordamchilari (middleware'da ishlatiladi — next/headers va bcrypt YO'Q)
import { SignJWT, jwtVerify } from "jose";
import type { Rol } from "./constants";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "insecure-dev-secret"
);

export const COOKIE_NOMI = "rfm_token";

export interface SessionPayload {
  userId: string;
  role: Rol;
  fio: string;
  [key: string]: unknown;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
