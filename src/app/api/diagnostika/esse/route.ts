import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const NUQTALAR = ["kirish", "oraliq", "yakuniy"] as const;

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const nuqta = new URL(req.url).searchParams.get("nuqta") ?? "yakuniy";
  const esse = await prisma.reflectiveEssay.findUnique({
    where: { userId_nuqta: { userId: session.userId, nuqta } },
  });
  return NextResponse.json({ nuqta, esse });
}

const schema = z.object({ nuqta: z.enum(NUQTALAR), matn: z.string().min(1).max(5000) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const { nuqta, matn } = parsed.data;

  const esse = await prisma.reflectiveEssay.upsert({
    where: { userId_nuqta: { userId: session.userId, nuqta } },
    create: { userId: session.userId, nuqta, matn },
    update: { matn },
  });
  return NextResponse.json({ ok: true, esse });
}
