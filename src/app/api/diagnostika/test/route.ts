import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TEST_BANK, HAR_SAVOL_BALL } from "@/lib/testBank";
import { parseJson } from "@/lib/utils";

const NUQTALAR = ["kirish", "oraliq", "yakuniy"] as const;

// GET: test savollari (javob kalitlarisiz!) + oldingi natija bo'lsa
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const nuqta = new URL(req.url).searchParams.get("nuqta") ?? "kirish";

  const savollar = TEST_BANK.map((s, i) => ({ i, savol: s.savol, variantlar: s.variantlar }));
  const natija = await prisma.testResult.findUnique({
    where: { userId_nuqta: { userId: session.userId, nuqta } },
  });

  return NextResponse.json({
    nuqta,
    savollar,
    jamiBall: TEST_BANK.length * HAR_SAVOL_BALL,
    natija: natija ? { ball: natija.ball, max: natija.max, javoblar: parseJson<number[]>(natija.javoblar, []) } : null,
  });
}

const schema = z.object({
  nuqta: z.enum(NUQTALAR),
  javoblar: z.array(z.number().int().min(-1).max(3)), // har savol uchun tanlangan variant (-1 = javob yo'q)
});

// POST: javoblarni serverda tekshirish va ballash
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const { nuqta, javoblar } = parsed.data;

  let togri = 0;
  const natijaBelgilar = TEST_BANK.map((s, i) => {
    const ok = javoblar[i] === s.togri;
    if (ok) togri++;
    return ok;
  });
  const ball = togri * HAR_SAVOL_BALL;
  const max = TEST_BANK.length * HAR_SAVOL_BALL;

  await prisma.testResult.upsert({
    where: { userId_nuqta: { userId: session.userId, nuqta } },
    create: { userId: session.userId, nuqta, ball, max, javoblar: JSON.stringify(javoblar) },
    update: { ball, max, javoblar: JSON.stringify(javoblar) },
  });

  // Faqat umumiy natija va qaysi savol to'g'ri/noto'g'ri ekanini qaytaramiz (kalitni emas)
  return NextResponse.json({ ok: true, togri, jami: TEST_BANK.length, ball, max, natijaBelgilar });
}
