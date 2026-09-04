import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  fio: z.string().min(3, "F.I.O. kiritilishi shart"),
  email: z.string().email("Email noto'g'ri"),
  parol: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lsin"),
  role: z.enum(["talaba", "oqituvchi", "tyutor", "admin"]).default("talaba"),
  yonalish: z.string().optional(),
  kurs: z.coerce.number().int().optional(),
  jins: z.string().optional(),
  yashashSharoiti: z.string().optional(),
  tibbiyGuruh: z.string().optional(),
  rozilik: z.literal(true, { errorMap: () => ({ message: "Ishtirokka rozilik berilishi shart" }) }),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { xato: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const mavjud = await prisma.user.findUnique({ where: { email: d.email } });
  if (mavjud) {
    return NextResponse.json({ xato: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: d.email,
      passwordHash: await hashPassword(d.parol),
      role: d.role,
      fio: d.fio,
      yonalish: d.yonalish,
      kurs: d.kurs,
      jins: d.jins,
      yashashSharoiti: d.yashashSharoiti,
      tibbiyGuruh: d.tibbiyGuruh,
      consentAt: new Date(), // aniq rozilik qayd etiladi
    },
  });

  const token = await signToken({ userId: user.id, role: user.role as never, fio: user.fio });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, role: user.role });
}
