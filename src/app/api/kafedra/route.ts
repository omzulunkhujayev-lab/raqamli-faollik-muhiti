import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { haftaKunlari, sanaKey } from "@/lib/utils";
import { ortacha, standartChetlanish, tMezoni, chiKvadrat } from "@/lib/statistika";
import { NORMS } from "@/lib/constants";

// Kafedra darajasidagi statistik taqqoslash (tajriba vs nazorat)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });

  // Talabalarni guruh turiga qarab ajratish
  const talabalar = await prisma.user.findMany({
    where: { role: "talaba", group: { isNot: null } },
    select: { id: true, group: { select: { tur: true } } },
  });
  const tajribaIds = talabalar.filter((t) => t.group?.tur === "tajriba").map((t) => t.id);
  const nazoratIds = talabalar.filter((t) => t.group?.tur === "nazorat").map((t) => t.id);

  // Shu hafta oralig'i
  const kunlar = haftaKunlari(new Date());
  const oxiri = new Date(kunlar[6]); oxiri.setHours(23, 59, 59, 999);

  // Har talaba uchun shu haftadagi o'rtacha qadam va haftalik faol daqiqa
  async function kohortQiymatlar(ids: string[]) {
    const es = await prisma.dailyEntry.findMany({ where: { userId: { in: ids }, sana: { gte: kunlar[0], lte: oxiri } } });
    const perUser = new Map<string, { qadam: number[]; faol: number }>();
    for (const id of ids) perUser.set(id, { qadam: [], faol: 0 });
    for (const e of es) { const u = perUser.get(e.userId)!; u.qadam.push(e.qadam); u.faol += e.faolDaqiqa; }
    const qadamlar: number[] = [], meyorErishdi: boolean[] = [];
    for (const u of perUser.values()) {
      if (u.qadam.length) qadamlar.push(Math.round(u.qadam.reduce((s, q) => s + q, 0) / u.qadam.length));
      meyorErishdi.push(u.faol >= NORMS.FAOL_DAQIQA_HAFTALIK_MIN);
    }
    return { qadamlar, meyorErishdi };
  }

  const T = await kohortQiymatlar(tajribaIds);
  const N = await kohortQiymatlar(nazoratIds);

  // Dinamika: oxirgi 4 hafta o'rtacha qadam (har kohort)
  async function haftalikDinamika(ids: string[]) {
    const natija: { hafta: string; ortacha: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const asos = new Date(); asos.setDate(asos.getDate() - w * 7);
      const k = haftaKunlari(asos);
      const oxr = new Date(k[6]); oxr.setHours(23, 59, 59, 999);
      const es = await prisma.dailyEntry.findMany({ where: { userId: { in: ids }, sana: { gte: k[0], lte: oxr } } });
      natija.push({ hafta: sanaKey(k[0]).slice(5), ortacha: es.length ? Math.round(es.reduce((s, e) => s + e.qadam, 0) / es.length) : 0 });
    }
    return natija;
  }

  // Styudent t-mezoni (o'rtacha kunlik qadam bo'yicha)
  const t = tMezoni(T.qadamlar, N.qadamlar);

  // Pirson χ²: faol daqiqa me'yoriga erishish (ha/yo'q) × guruh turi
  const tHa = T.meyorErishdi.filter(Boolean).length, tYoq = T.meyorErishdi.length - tHa;
  const nHa = N.meyorErishdi.filter(Boolean).length, nYoq = N.meyorErishdi.length - nHa;
  const chi = chiKvadrat([[tHa, tYoq], [nHa, nYoq]]);

  const dinamikaT = await haftalikDinamika(tajribaIds);
  const dinamikaN = await haftalikDinamika(nazoratIds);
  const dinamika = dinamikaT.map((d, i) => ({ hafta: d.hafta, tajriba: d.ortacha, nazorat: dinamikaN[i]?.ortacha ?? 0 }));

  return NextResponse.json({
    tajriba: {
      talabaSoni: tajribaIds.length,
      ortachaQadam: Math.round(ortacha(T.qadamlar)),
      std: Math.round(standartChetlanish(T.qadamlar) * 10) / 10,
      meyorErishgan: tHa, meyorErishmagan: tYoq,
    },
    nazorat: {
      talabaSoni: nazoratIds.length,
      ortachaQadam: Math.round(ortacha(N.qadamlar)),
      std: Math.round(standartChetlanish(N.qadamlar) * 10) / 10,
      meyorErishgan: nHa, meyorErishmagan: nYoq,
    },
    tMezoni: t,
    chiKvadrat: chi,
    dinamika,
  });
}
