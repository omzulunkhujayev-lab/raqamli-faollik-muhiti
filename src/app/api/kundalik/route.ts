import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { keyToDate, sanaKey } from "@/lib/utils";

// Bugungi/ma'lum kun yozuvini yoki oxirgi yozuvlarni olish
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const url = new URL(req.url);
  const sana = url.searchParams.get("sana"); // "YYYY-MM-DD"

  if (sana) {
    const entry = await prisma.dailyEntry.findUnique({
      where: { userId_sana: { userId: session.userId, sana: keyToDate(sana) } },
    });
    return NextResponse.json({ entry });
  }

  const limit = Number(url.searchParams.get("limit") ?? 14);
  const entries = await prisma.dailyEntry.findMany({
    where: { userId: session.userId },
    orderBy: { sana: "desc" },
    take: Math.min(limit, 60),
  });
  return NextResponse.json({
    entries: entries.map((e) => ({ ...e, sanaKey: sanaKey(new Date(e.sana)) })),
  });
}

const schema = z.object({
  sana: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  qadam: z.coerce.number().int().min(0).max(100000),
  faolDaqiqa: z.coerce.number().int().min(0).max(1440),
  engUzunOtirish: z.coerce.number().int().min(0).max(1440),
  pauzaSoni: z.coerce.number().int().min(0).max(50),
  uyquSoat: z.coerce.number().min(0).max(24),
  ekranSoat: z.coerce.number().min(0).max(24),
  kayfiyatBall: z.coerce.number().int().min(1).max(5),
  refleksiyaMatn: z.string().max(1000).optional().nullable(),
});

// Kunlik yozuvni saqlash (upsert — bir kunga bitta yozuv)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ xato: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri" }, { status: 400 });
  }
  const d = parsed.data;
  const sana = d.sana ? keyToDate(d.sana) : keyToDate(sanaKey(new Date()));

  const entry = await prisma.dailyEntry.upsert({
    where: { userId_sana: { userId: session.userId, sana } },
    create: {
      userId: session.userId,
      sana,
      qadam: d.qadam,
      faolDaqiqa: d.faolDaqiqa,
      engUzunOtirish: d.engUzunOtirish,
      pauzaSoni: d.pauzaSoni,
      uyquSoat: d.uyquSoat,
      ekranSoat: d.ekranSoat,
      kayfiyatBall: d.kayfiyatBall,
      refleksiyaMatn: d.refleksiyaMatn ?? null,
    },
    update: {
      qadam: d.qadam,
      faolDaqiqa: d.faolDaqiqa,
      engUzunOtirish: d.engUzunOtirish,
      pauzaSoni: d.pauzaSoni,
      uyquSoat: d.uyquSoat,
      ekranSoat: d.ekranSoat,
      kayfiyatBall: d.kayfiyatBall,
      refleksiyaMatn: d.refleksiyaMatn ?? null,
    },
  });
  return NextResponse.json({ ok: true, entry });
}
