import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clearSessionCookie } from "@/lib/auth";

// Joriy foydalanuvchi ma'lumoti
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, email: true, role: true, fio: true, yonalish: true, kurs: true,
      jins: true, tibbiyGuruh: true, groupId: true, group: { select: { nomi: true } },
    },
  });
  if (!user) return NextResponse.json({ xato: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ user });
}

// Maxfiylik sharti: foydalanuvchi istalgan vaqtda ma'lumotlarini o'chirib chiqib keta oladi
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  await prisma.user.delete({ where: { id: session.userId } });
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
