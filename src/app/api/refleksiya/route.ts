import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isoHafta } from "@/lib/utils";

// Berilgan haftaga (offset) mos ISO haftani hisoblash
function haftaOffsetdan(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  return isoHafta(d);
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const offset = Number(new URL(req.url).searchParams.get("hafta") ?? 0);
  const hafta = haftaOffsetdan(offset);
  const refleksiya = await prisma.weeklyReflection.findUnique({
    where: { userId_hafta: { userId: session.userId, hafta } },
  });
  return NextResponse.json({ hafta, refleksiya });
}

const schema = z.object({
  hafta: z.number().int().default(0), // offset
  engFaolKun: z.string().max(500).optional(),
  engPastKun: z.string().max(500).optional(),
  uzunOtirishVaqt: z.string().max(500).optional(),
  keyingiMaqsad: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });

  const { hafta: offset, ...data } = parsed.data;
  const hafta = haftaOffsetdan(offset);

  const refleksiya = await prisma.weeklyReflection.upsert({
    where: { userId_hafta: { userId: session.userId, hafta } },
    create: { userId: session.userId, hafta, ...data },
    update: data,
  });
  return NextResponse.json({ ok: true, refleksiya });
}
