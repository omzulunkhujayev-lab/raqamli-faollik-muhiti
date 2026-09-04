import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson, haftaKunlari, sanaKey, KUN_TOLIQ } from "@/lib/utils";
import { uzilishlarniAniqla, type Dars } from "@/lib/uzilishlar";

async function accessibleGroups(userId: string, role: string) {
  if (role === "talaba") {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { groupId: true } });
    if (!u?.groupId) return [];
    const g = await prisma.group.findUnique({ where: { id: u.groupId }, select: { id: true, nomi: true } });
    return g ? [g] : [];
  }
  if (role === "tyutor") return prisma.group.findMany({ where: { tyutorId: userId }, select: { id: true, nomi: true } });
  return prisma.group.findMany({ select: { id: true, nomi: true }, orderBy: { nomi: "asc" } });
}

// Bir hafta ma'lumotini olish (offset: 0 joriy, -2 ikki hafta oldin)
async function haftaMonitoring(userId: string, offset: number) {
  const asos = new Date();
  asos.setDate(asos.getDate() + offset * 7);
  const kunlar = haftaKunlari(asos);
  const oxiri = new Date(kunlar[6]); oxiri.setHours(23, 59, 59, 999);
  const entries = await prisma.dailyEntry.findMany({
    where: { userId, sana: { gte: kunlar[0], lte: oxiri } },
  });
  const map = new Map(entries.map((e) => [sanaKey(new Date(e.sana)), e]));
  return { kunlar, map, entries };
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const guruhlar = await accessibleGroups(session.userId, session.role);
  if (guruhlar.length === 0) return NextResponse.json({ guruhlar: [], tanlangan: null, kunlar: [], saqlangan: {}, taqqoslash: null });

  const soralgan = new URL(req.url).searchParams.get("groupId");
  const tanlangan = guruhlar.find((g) => g.id === soralgan) ?? guruhlar[0];

  const [schedules, saqlanganGaps] = await Promise.all([
    prisma.schedule.findMany({ where: { groupId: tanlangan.id } }),
    prisma.activityGap.findMany({ where: { groupId: tanlangan.id } }),
  ]);

  // Talaba bo'lsa — shaxsiy monitoring; aks holda cross-reference yo'q
  const talaba = session.role === "talaba";
  const { map } = talaba ? await haftaMonitoring(session.userId, 0) : { map: new Map() };
  const haftaK = haftaKunlari(new Date());

  // Kun tartibi
  const KUN_TARTIB = KUN_TOLIQ;
  const kunlar = schedules
    .map((s) => {
      const darslar = parseJson<Dars[]>(s.mashgulotSoatlari, []);
      const uzilishlar = uzilishlarniAniqla(darslar);
      // Monitoring (shu hafta shu kun)
      let monitoring: { engUzunOtirish: number; pauzaSoni: number } | null = null;
      if (talaba) {
        const idx = KUN_TARTIB.indexOf(s.kun);
        if (idx >= 0) {
          const e = map.get(sanaKey(haftaK[idx]));
          if (e) monitoring = { engUzunOtirish: e.engUzunOtirish, pauzaSoni: e.pauzaSoni };
        }
      }
      return { kun: s.kun, darslar, uzilishlar, monitoring };
    })
    .sort((a, b) => KUN_TARTIB.indexOf(a.kun) - KUN_TARTIB.indexOf(b.kun));

  const saqlangan: Record<string, string> = {};
  for (const g of saqlanganGaps) {
    if (g.taklifEtilganYechim) saqlangan[`${g.kun}|${g.boshlanish}`] = g.taklifEtilganYechim;
  }

  // Taqqoslash (step 5): joriy hafta vs 2 hafta oldin (faqat talaba)
  let taqqoslash = null;
  if (talaba) {
    const joriy = await haftaMonitoring(session.userId, 0);
    const avvalgi = await haftaMonitoring(session.userId, -2);
    const ort = (es: typeof joriy.entries, f: (e: (typeof es)[number]) => number) =>
      es.length ? Math.round(es.reduce((s, e) => s + f(e), 0) / es.length) : 0;
    taqqoslash = {
      joriy: { otirish: ort(joriy.entries, (e) => e.engUzunOtirish), pauza: ort(joriy.entries, (e) => e.pauzaSoni) },
      avvalgi: { otirish: ort(avvalgi.entries, (e) => e.engUzunOtirish), pauza: ort(avvalgi.entries, (e) => e.pauzaSoni) },
    };
  }

  return NextResponse.json({ guruhlar, tanlangan, kunlar, saqlangan, taqqoslash });
}

const schema = z.object({
  groupId: z.string().min(1),
  kun: z.string().min(1),
  boshlanish: z.string(),
  tugash: z.string(),
  davomiylikDaq: z.coerce.number().int(),
  yechim: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const d = parsed.data;

  const guruhlar = await accessibleGroups(session.userId, session.role);
  if (!guruhlar.some((g) => g.id === d.groupId)) {
    return NextResponse.json({ xato: "Bu guruhga ruxsat yo'q" }, { status: 403 });
  }

  await prisma.activityGap.upsert({
    where: { groupId_kun_boshlanish: { groupId: d.groupId, kun: d.kun, boshlanish: d.boshlanish } },
    create: { groupId: d.groupId, kun: d.kun, boshlanish: d.boshlanish, tugash: d.tugash, davomiylikDaq: d.davomiylikDaq, taklifEtilganYechim: d.yechim },
    update: { taklifEtilganYechim: d.yechim, tugash: d.tugash, davomiylikDaq: d.davomiylikDaq },
  });
  return NextResponse.json({ ok: true });
}
