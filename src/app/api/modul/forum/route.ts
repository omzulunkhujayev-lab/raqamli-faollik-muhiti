import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ topicId: z.string().min(1), matn: z.string().min(1).max(2000) });

// Muhokama forumiga xabar qoldirish
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });

  const post = await prisma.forumPost.create({
    data: { topicId: parsed.data.topicId, userId: session.userId, matn: parsed.data.matn },
    include: { user: { select: { fio: true, role: true } } },
  });
  return NextResponse.json({ ok: true, post });
}
