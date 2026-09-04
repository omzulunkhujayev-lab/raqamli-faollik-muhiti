import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { haftaKunlari, sanaKey } from "@/lib/utils";
import { NORMS } from "@/lib/constants";

// Tyutor/admin uchun guruh bo'yicha ANONIM hisobot (faqat 3 umumlashtirilgan ko'rsatkich)
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (session.role !== "tyutor" && session.role !== "admin") {
    return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });
  }

  const guruhlar =
    session.role === "tyutor"
      ? await prisma.group.findMany({ where: { tyutorId: session.userId }, select: { id: true, nomi: true, tur: true } })
      : await prisma.group.findMany({ select: { id: true, nomi: true, tur: true }, orderBy: { nomi: "asc" } });

  if (guruhlar.length === 0) return NextResponse.json({ guruhlar: [], tanlangan: null, hisobot: null });

  const soralgan = new URL(req.url).searchParams.get("groupId");
  const tanlangan = guruhlar.find((g) => g.id === soralgan) ?? guruhlar[0];

  // Guruh a'zolari (talabalar)
  const azolar = await prisma.user.findMany({
    where: { groupId: tanlangan.id, role: "talaba" },
    select: { id: true },
  });
  const azoIds = azolar.map((a) => a.id);

  // Shu hafta ma'lumotlari
  const kunlar = haftaKunlari(new Date());
  const oxiri = new Date(kunlar[6]); oxiri.setHours(23, 59, 59, 999);
  const entries = await prisma.dailyEntry.findMany({
    where: { userId: { in: azoIds }, sana: { gte: kunlar[0], lte: oxiri } },
  });

  // Talabaga bo'lib guruhlash
  const perUser = new Map<string, { qadam: number[]; faol: number; kunlar: Set<string> }>();
  for (const id of azoIds) perUser.set(id, { qadam: [], faol: 0, kunlar: new Set() });
  for (const e of entries) {
    const u = perUser.get(e.userId)!;
    u.qadam.push(e.qadam);
    u.faol += e.faolDaqiqa;
    u.kunlar.add(sanaKey(new Date(e.sana)));
  }

  const jamiTalaba = azoIds.length || 1;

  // 1) Guruhning o'rtacha kunlik qadamlar soni
  const barchaQadam = entries.map((e) => e.qadam);
  const ortachaQadam = barchaQadam.length
    ? Math.round(barchaQadam.reduce((s, q) => s + q, 0) / barchaQadam.length)
    : 0;

  // 2) Haftalik faol daqiqalar me'yoriga erishganlar ulushi
  const meyorgaErishgan = [...perUser.values()].filter((u) => u.faol >= NORMS.FAOL_DAQIQA_HAFTALIK_MIN).length;
  const meyorFoiz = Math.round((meyorgaErishgan / jamiTalaba) * 100);

  // 3) Monitoringni muntazam yuritganlar (>= 5 kun) ulushi
  const muntazam = [...perUser.values()].filter((u) => u.kunlar.size >= 5).length;
  const muntazamFoiz = Math.round((muntazam / jamiTalaba) * 100);

  return NextResponse.json({
    guruhlar,
    tanlangan,
    hisobot: {
      talabaSoni: azoIds.length,
      ortachaQadam,
      meyorgaErishgan,
      meyorFoiz,
      muntazam,
      muntazamFoiz,
    },
  });
}
