import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson } from "@/lib/utils";

function faqatOqituvchi(role: string) {
  return role === "oqituvchi" || role === "admin";
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (!faqatOqituvchi(session.role)) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });

  const [rejalar, cards] = await Promise.all([
    prisma.lessonPlan.findMany({ where: { oqituvchiId: session.userId }, orderBy: { createdAt: "desc" } }),
    prisma.card.findMany({ select: { id: true, raqam: true, nomi: true, turi: true, davomiylik: true } }),
  ]);
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  return NextResponse.json({
    rejalar: rejalar.map((r) => {
      const ids = parseJson<string[]>(r.cardIds, []);
      return { ...r, cardIds: ids, cards: ids.map((id) => cardMap.get(id)).filter(Boolean) };
    }),
    cards,
  });
}

const schema = z.object({
  id: z.string().optional(),
  nomi: z.string().min(1),
  kun: z.string().min(1),
  boshlanish: z.string().regex(/^\d{2}:\d{2}$/),
  tugash: z.string().regex(/^\d{2}:\d{2}$/),
  guruhNomi: z.string().optional(),
  cardIds: z.array(z.string()).default([]),
  pauzaIzoh: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (!faqatOqituvchi(session.role)) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri" }, { status: 400 });
  const d = parsed.data;

  const data = {
    nomi: d.nomi, kun: d.kun, boshlanish: d.boshlanish, tugash: d.tugash,
    guruhNomi: d.guruhNomi ?? null, cardIds: JSON.stringify(d.cardIds), pauzaIzoh: d.pauzaIzoh ?? null,
  };

  if (d.id) {
    const mavjud = await prisma.lessonPlan.findUnique({ where: { id: d.id } });
    if (!mavjud || mavjud.oqituvchiId !== session.userId) return NextResponse.json({ xato: "Topilmadi" }, { status: 404 });
    const reja = await prisma.lessonPlan.update({ where: { id: d.id }, data });
    return NextResponse.json({ ok: true, reja });
  }
  const reja = await prisma.lessonPlan.create({ data: { ...data, oqituvchiId: session.userId } });
  return NextResponse.json({ ok: true, reja });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ xato: "id kerak" }, { status: 400 });
  const mavjud = await prisma.lessonPlan.findUnique({ where: { id } });
  if (!mavjud || mavjud.oqituvchiId !== session.userId) return NextResponse.json({ xato: "Topilmadi" }, { status: 404 });
  await prisma.lessonPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
