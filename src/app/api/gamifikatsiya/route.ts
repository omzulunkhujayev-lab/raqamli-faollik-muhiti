import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson, sanaKey, keyToDate } from "@/lib/utils";

// Nishonlarni foydalanuvchi ma'lumotidan hisoblab, yangilarini beradi
async function nishonlarniHisobla(userId: string): Promise<Set<string>> {
  const now = new Date();
  const oy = new Date(now); oy.setDate(now.getDate() - 28);
  const ikkiHafta = new Date(now); ikkiHafta.setDate(now.getDate() - 14);

  const [entries28, faolKunlar, badges, mavjudUB] = await Promise.all([
    prisma.dailyEntry.findMany({ where: { userId, sana: { gte: oy } } }),
    prisma.faolHaftaKun.findMany({ where: { userId } }),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
  ]);
  const entries14 = entries28.filter((e) => new Date(e.sana) >= ikkiHafta);

  const erishilgan = new Set<string>();
  // Muntazam kuzatuvchi: oxirgi 28 kunda >= 20 kun to'ldirilgan
  if (entries28.length >= 20) erishilgan.add("muntazam_kuzatuvchi");
  // Zinapoya do'sti: «liftdan voz kechish» (indeks 2) >= 5 kun belgilangan
  const liftKunlar = faolKunlar.filter((k) => parseJson<boolean[]>(k.qoidalar, [])[2]).length;
  if (liftKunlar >= 5) erishilgan.add("zinapoya_dosti");
  // Faol tanaffus tashkilotchisi: 14 kunda pauza>=3 bo'lgan kun >= 5
  if (entries14.filter((e) => e.pauzaSoni >= 3).length >= 5) erishilgan.add("faol_tanaffus");
  // Pauza ustasi: 14 kun jami pauza >= 20
  if (entries14.reduce((s, e) => s + e.pauzaSoni, 0) >= 20) erishilgan.add("pauza_ustasi");

  // Yangi erishilganlarni saqlash
  const bMap = new Map(badges.map((b) => [b.kod, b.id]));
  const bor = new Set(mavjudUB.map((u) => u.badge.kod));
  for (const kod of erishilgan) {
    if (!bor.has(kod) && bMap.has(kod)) {
      await prisma.userBadge.create({ data: { userId, badgeId: bMap.get(kod)! } }).catch(() => {});
    }
  }
  return erishilgan;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { groupId: true } });

  // Faol chellenjlar
  const now = new Date();
  const challenges = await prisma.challenge.findMany({ orderBy: { boshlanish: "desc" } });

  // «Guruh qadami» reytingi (guruh o'rtacha kunlik qadam) — anonim (guruh nomi)
  const guruhReyting: { challengeId: string; nomi: string; tugagan: boolean; guruhlar: { nomi: string; ortacha: number; meniki: boolean }[] }[] = [];
  for (const ch of challenges.filter((c) => c.tur === "guruh")) {
    const groups = await prisma.group.findMany({ select: { id: true, nomi: true, members: { where: { role: "talaba" }, select: { id: true } } } });
    const oxiri = new Date(ch.tugash); oxiri.setHours(23, 59, 59, 999);
    const reyting = [];
    for (const g of groups) {
      const ids = g.members.map((m) => m.id);
      if (ids.length === 0) continue;
      const es = await prisma.dailyEntry.findMany({ where: { userId: { in: ids }, sana: { gte: ch.boshlanish, lte: oxiri } } });
      const ortacha = es.length ? Math.round(es.reduce((s, e) => s + e.qadam, 0) / es.length) : 0;
      reyting.push({ nomi: g.nomi, ortacha, meniki: g.id === me?.groupId });
    }
    reyting.sort((a, b) => b.ortacha - a.ortacha);
    guruhReyting.push({ challengeId: ch.id, nomi: ch.nomi, tugagan: new Date(ch.tugash) < now, guruhlar: reyting });
  }

  // Faol hafta — bugungi belgilar
  const bugunKey = sanaKey(now);
  const bugun = await prisma.faolHaftaKun.findUnique({
    where: { userId_sana: { userId: session.userId, sana: keyToDate(bugunKey) } },
  });

  // Nishonlar
  const erishilgan = await nishonlarniHisobla(session.userId);
  const badges = await prisma.badge.findMany();

  return NextResponse.json({
    challenges: challenges.map((c) => ({ ...c, qoidalar: parseJson<string[]>(c.qoidalar, []), tugagan: new Date(c.tugash) < now })),
    guruhReyting,
    faolHaftaBugun: bugun ? parseJson<boolean[]>(bugun.qoidalar, [false, false, false, false, false]) : [false, false, false, false, false],
    nishonlar: badges.map((b) => ({ ...b, erishilgan: erishilgan.has(b.kod) })),
  });
}

const schema = z.object({ qoidalar: z.array(z.boolean()).length(5) });

// Faol hafta — bugungi belgilarni saqlash
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });

  const sana = keyToDate(sanaKey(new Date()));
  await prisma.faolHaftaKun.upsert({
    where: { userId_sana: { userId: session.userId, sana } },
    create: { userId: session.userId, sana, qoidalar: JSON.stringify(parsed.data.qoidalar) },
    update: { qoidalar: JSON.stringify(parsed.data.qoidalar) },
  });
  return NextResponse.json({ ok: true });
}
