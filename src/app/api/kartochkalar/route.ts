import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson } from "@/lib/utils";

// Kartochkalar katalogi (filtrlash mijoz tomonida ham qo'llanadi)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const [cards, favs] = await Promise.all([
    prisma.card.findMany({ orderBy: { raqam: "asc" } }),
    prisma.favorite.findMany({ where: { userId: session.userId }, select: { cardId: true } }),
  ]);
  const favSet = new Set(favs.map((f) => f.cardId));

  return NextResponse.json({
    cards: cards.map((c) => ({
      id: c.id,
      raqam: c.raqam,
      nomi: c.nomi,
      turi: c.turi,
      davomiylik: c.davomiylik,
      joyJihoz: c.joyJihoz,
      joyTuri: c.joyTuri,
      algoritm: parseJson<string[]>(c.algoritm, []),
      metodikEslatma: c.metodikEslatma,
      mosFanlar: parseJson<string[]>(c.mosFanlar, []),
      moslashtirilganVariant: c.moslashtirilganVariant,
      sevimli: favSet.has(c.id),
    })),
  });
}
