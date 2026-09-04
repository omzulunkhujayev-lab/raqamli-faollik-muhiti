import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Email noto'g'ri"),
  parol: z.string().min(1, "Parol kiriting"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ xato: "Email yoki parol noto'g'ri" }, { status: 400 });
  }
  const { email, parol } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(parol, user.passwordHash))) {
    return NextResponse.json({ xato: "Email yoki parol noto'g'ri" }, { status: 401 });
  }

  const token = await signToken({ userId: user.id, role: user.role as never, fio: user.fio });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, role: user.role });
}
