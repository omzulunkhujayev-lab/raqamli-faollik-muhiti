import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { haftaKunlari, sanaKey, KUN_NOMLARI } from "@/lib/utils";
import { NORMS } from "@/lib/constants";

// Haftalik profil: kunlik dinamika + haftalik yig'indilar + me'yorga nisbatan foiz
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const url = new URL(req.url);
  const offset = Number(url.searchParams.get("hafta") ?? 0); // 0 = joriy hafta, -1 = o'tgan

  const asos = new Date();
  asos.setDate(asos.getDate() + offset * 7);
  const kunlar = haftaKunlari(asos);
  const boshi = kunlar[0];
  const oxiri = new Date(kunlar[6]);
  oxiri.setHours(23, 59, 59, 999);

  const entries = await prisma.dailyEntry.findMany({
    where: { userId: session.userId, sana: { gte: boshi, lte: oxiri } },
  });
  const map = new Map(entries.map((e) => [sanaKey(new Date(e.sana)), e]));

  const kunlik = kunlar.map((d, i) => {
    const e = map.get(sanaKey(d));
    return {
      kun: KUN_NOMLARI[i],
      sana: sanaKey(d),
      qadam: e?.qadam ?? 0,
      faolDaqiqa: e?.faolDaqiqa ?? 0,
      engUzunOtirish: e?.engUzunOtirish ?? 0,
      pauzaSoni: e?.pauzaSoni ?? 0,
      uyquSoat: e?.uyquSoat ?? 0,
      ekranSoat: e?.ekranSoat ?? 0,
      kayfiyatBall: e?.kayfiyatBall ?? 0,
      bor: !!e,
    };
  });

  const kunSoni = kunlik.filter((k) => k.bor).length || 1;
  const jamiQadam = kunlik.reduce((s, k) => s + k.qadam, 0);
  const jamiFaolDaqiqa = kunlik.reduce((s, k) => s + k.faolDaqiqa, 0);
  const engUzunOtirish = Math.max(0, ...kunlik.map((k) => k.engUzunOtirish));
  const jamiPauza = kunlik.reduce((s, k) => s + k.pauzaSoni, 0);
  const ortachaUyqu = kunlik.reduce((s, k) => s + k.uyquSoat, 0) / kunSoni;
  const ortachaQadam = Math.round(jamiQadam / kunSoni);

  return NextResponse.json({
    kunlik,
    haftaBoshi: sanaKey(boshi),
    haftaOxiri: sanaKey(kunlar[6]),
    offset,
    xulosa: {
      ortachaQadam,
      jamiFaolDaqiqa,
      engUzunOtirish,
      jamiPauza,
      ortachaUyqu: Math.round(ortachaUyqu * 10) / 10,
      toldirilganKun: kunlik.filter((k) => k.bor).length,
    },
    meyor: {
      qadam: NORMS.QADAM_KUNLIK,
      faolDaqiqa: NORMS.FAOL_DAQIQA_HAFTALIK_MIN,
      otirish: NORMS.OTIRISH_CHEGARA,
      uyquMin: NORMS.UYQU_MIN,
      uyquMax: NORMS.UYQU_MAX,
    },
  });
}
