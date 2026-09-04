import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ cardId: z.string().min(1) });

// Sevimliga qo'shish / olib tashlash (toggle)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });

  const mavjud = await prisma.favorite.findUnique({
    where: { userId_cardId: { userId: session.userId, cardId: parsed.data.cardId } },
  });

  if (mavjud) {
    await prisma.favorite.delete({ where: { id: mavjud.id } });
    return NextResponse.json({ ok: true, sevimli: false });
  }
  await prisma.favorite.create({ data: { userId: session.userId, cardId: parsed.data.cardId } });
  return NextResponse.json({ ok: true, sevimli: true });
}
