import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson } from "@/lib/utils";
import type { Dars } from "@/lib/uzilishlar";

// Foydalanuvchi kira oladigan guruhlarni aniqlash
async function accessibleGroups(userId: string, role: string) {
  if (role === "talaba") {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { groupId: true } });
    if (!u?.groupId) return [];
    const g = await prisma.group.findUnique({ where: { id: u.groupId }, select: { id: true, nomi: true } });
    return g ? [g] : [];
  }
  if (role === "tyutor") {
    return prisma.group.findMany({ where: { tyutorId: userId }, select: { id: true, nomi: true } });
  }
  // admin
  return prisma.group.findMany({ select: { id: true, nomi: true }, orderBy: { nomi: "asc" } });
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const guruhlar = await accessibleGroups(session.userId, session.role);
  if (guruhlar.length === 0) return NextResponse.json({ guruhlar: [], tanlangan: null, jadval: [] });

  const soralgan = new URL(req.url).searchParams.get("groupId");
  const tanlangan = guruhlar.find((g) => g.id === soralgan) ?? guruhlar[0];

  const schedules = await prisma.schedule.findMany({ where: { groupId: tanlangan.id } });
  const jadval = schedules.map((s) => ({
    kun: s.kun,
    darslar: parseJson<Dars[]>(s.mashgulotSoatlari, []),
  }));

  return NextResponse.json({ guruhlar, tanlangan, jadval });
}

const schema = z.object({
  groupId: z.string().min(1),
  kun: z.string().min(1),
  darslar: z.array(
    z.object({
      nomi: z.string().min(1),
      boshlanish: z.string().regex(/^\d{2}:\d{2}$/),
      tugash: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const { groupId, kun, darslar } = parsed.data;

  // Kirish huquqini tekshirish
  const guruhlar = await accessibleGroups(session.userId, session.role);
  if (!guruhlar.some((g) => g.id === groupId)) {
    return NextResponse.json({ xato: "Bu guruhga ruxsat yo'q" }, { status: 403 });
  }

  // Tanaffuslarni darslar orasidan hosil qilish
  const sorted = [...darslar].sort((a, b) => a.boshlanish.localeCompare(b.boshlanish));
  const tanaffuslar = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    tanaffuslar.push({ boshlanish: sorted[i].tugash, tugash: sorted[i + 1].boshlanish });
  }

  if (sorted.length === 0) {
    await prisma.schedule.deleteMany({ where: { groupId, kun } });
    return NextResponse.json({ ok: true });
  }

  await prisma.schedule.upsert({
    where: { groupId_kun: { groupId, kun } },
    create: { groupId, kun, mashgulotSoatlari: JSON.stringify(sorted), tanaffuslar: JSON.stringify(tanaffuslar) },
    update: { mashgulotSoatlari: JSON.stringify(sorted), tanaffuslar: JSON.stringify(tanaffuslar) },
  });
  return NextResponse.json({ ok: true });
}
