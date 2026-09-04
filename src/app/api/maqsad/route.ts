import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { haftaKunlari, isoHafta } from "@/lib/utils";
import { MAQSAD_TURLARI } from "@/lib/constants";

// Berilgan tur bo'yicha talabaning joriy darajasini (o'tgan haftadan) hisoblash
async function joriyDaraja(userId: string, tur: string): Promise<number> {
  const asos = new Date();
  asos.setDate(asos.getDate() - 7); // o'tgan hafta
  const kunlar = haftaKunlari(asos);
  const boshi = kunlar[0];
  const oxiri = new Date(kunlar[6]);
  oxiri.setHours(23, 59, 59, 999);
  const entries = await prisma.dailyEntry.findMany({
    where: { userId, sana: { gte: boshi, lte: oxiri } },
  });
  if (entries.length === 0) return 0;
  switch (tur) {
    case "qadam":
      return Math.round(entries.reduce((s, e) => s + e.qadam, 0) / entries.length);
    case "faolDaqiqa":
      return entries.reduce((s, e) => s + e.faolDaqiqa, 0);
    case "pauza":
      return Math.round(entries.reduce((s, e) => s + e.pauzaSoni, 0) / entries.length);
    case "otirish":
      return Math.max(0, ...entries.map((e) => e.engUzunOtirish));
    default:
      return 0;
  }
}

// Joriy darajadan kelib chiqib xavfsiz maqsad taklifi (10–15% yaxshilanish)
function taklif(tur: string, joriy: number): number {
  if (joriy <= 0) {
    // Boshlang'ich maqsadlar (me'yorga bosqichma-bosqich)
    if (tur === "qadam") return 6000;
    if (tur === "faolDaqiqa") return 120;
    if (tur === "pauza") return 3;
    if (tur === "otirish") return 55;
  }
  if (tur === "otirish") {
    // O'tirishni QISQARTIRISH — 10% kamaytirish, 60 daq.dan past bo'lmasin ideal
    return Math.max(50, Math.round((joriy * 0.9) / 5) * 5);
  }
  // Qolganlarini 12% oshirish (100 ga yaxlitlash qadam uchun)
  const yangi = joriy * 1.12;
  return tur === "qadam" ? Math.round(yangi / 100) * 100 : Math.round(yangi);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const hafta = isoHafta(new Date());
  const goals = await prisma.weeklyGoal.findMany({
    where: { userId: session.userId, hafta },
  });

  // Har bir tur uchun taklif
  const takliflar: Record<string, { joriy: number; taklif: number }> = {};
  for (const tur of Object.keys(MAQSAD_TURLARI)) {
    const joriy = await joriyDaraja(session.userId, tur);
    takliflar[tur] = { joriy, taklif: taklif(tur, joriy) };
  }

  return NextResponse.json({ hafta, goals, takliflar });
}

const schema = z.object({
  maqsadTuri: z.enum(["qadam", "faolDaqiqa", "pauza", "otirish"]),
  maqsadQiymat: z.coerce.number().positive(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });

  const { maqsadTuri, maqsadQiymat } = parsed.data;
  const hafta = isoHafta(new Date());
  const joriy = await joriyDaraja(session.userId, maqsadTuri);

  // Keskin sakrashni ogohlantirish (masalan 5000 -> 12000)
  // O'tirish turida "sakrash" = juda katta qisqartirish
  let keskin = false;
  if (joriy > 0) {
    if (maqsadTuri === "otirish") {
      keskin = maqsadQiymat < joriy * 0.6; // 40% dan ko'p qisqartirish real emas
    } else {
      keskin = maqsadQiymat > joriy * 1.3; // 30% dan ko'p oshirish keskin
    }
  }

  if (keskin) {
    return NextResponse.json(
      {
        xato: "Keskin sakrash tavsiya etilmaydi",
        ogohlantirish: `Joriy darajangiz ${joriy}. Tizim bosqichma-bosqich (10–15%) o'sishni tavsiya qiladi. Iltimos, taklif etilgan maqsadga yaqinroq qiymat tanlang.`,
        tavsiya: taklif(maqsadTuri, joriy),
      },
      { status: 422 }
    );
  }

  const goal = await prisma.weeklyGoal.upsert({
    where: { userId_hafta_maqsadTuri: { userId: session.userId, hafta, maqsadTuri } },
    create: { userId: session.userId, hafta, maqsadTuri, joriyQiymat: joriy, maqsadQiymat, bajarildi: false },
    update: { joriyQiymat: joriy, maqsadQiymat },
  });
  return NextResponse.json({ ok: true, goal });
}
