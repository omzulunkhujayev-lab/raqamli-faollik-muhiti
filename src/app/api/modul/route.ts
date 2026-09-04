import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson } from "@/lib/utils";

// GET: barcha mavzular ro'yxati + progress; yoki ?id= bilan bitta mavzu tafsiloti
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    const topic = await prisma.courseTopic.findUnique({ where: { id } });
    if (!topic) return NextResponse.json({ xato: "Topilmadi" }, { status: 404 });
    const kontent = parseJson<Record<string, unknown>>(topic.kontent, {});
    const [progress, forum, cards] = await Promise.all([
      prisma.topicProgress.findUnique({ where: { userId_topicId: { userId: session.userId, topicId: id } } }),
      prisma.forumPost.findMany({
        where: { topicId: id }, orderBy: { createdAt: "asc" },
        include: { user: { select: { fio: true, role: true } } },
      }),
      prisma.card.findMany({
        where: { raqam: { in: (kontent.kartochkaRaqamlar as number[]) ?? [] } },
        select: { id: true, raqam: true, nomi: true, turi: true, davomiylik: true },
      }),
    ]);
    return NextResponse.json({ topic: { ...topic, kontent }, cards, progress, forum });
  }

  const [topics, progresses] = await Promise.all([
    prisma.courseTopic.findMany({ orderBy: { tartib: "asc" } }),
    prisma.topicProgress.findMany({ where: { userId: session.userId } }),
  ]);
  const pMap = new Map(progresses.map((p) => [p.topicId, p]));
  return NextResponse.json({
    topics: topics.map((t) => ({
      id: t.id, tartib: t.tartib, nomi: t.nomi,
      maruzaSoat: t.maruzaSoat, amaliySoat: t.amaliySoat, mustaqilSoat: t.mustaqilSoat,
      progress: pMap.get(t.id) ?? null,
    })),
  });
}

const schema = z.object({
  topicId: z.string().min(1),
  korilgan: z.boolean().optional(),
  testBall: z.number().int().optional(),
  testMax: z.number().int().optional(),
  topshiriqMatn: z.string().max(5000).optional(),
  topshiriqTopshirildi: z.boolean().optional(),
});

// POST: progressni yangilash (ko'rildi / self-check ball / topshiriq)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const { topicId, ...rest } = parsed.data;

  const mavjud = await prisma.topicProgress.findUnique({
    where: { userId_topicId: { userId: session.userId, topicId } },
  });
  const yangi = { ...mavjud, ...rest };
  const bajarildi = !!yangi.korilgan && !!yangi.topshiriqTopshirildi && (yangi.testMax ?? 0) > 0;

  const progress = await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId: session.userId, topicId } },
    create: { userId: session.userId, topicId, ...rest, bajarildi },
    update: { ...rest, bajarildi },
  });
  return NextResponse.json({ ok: true, progress });
}
