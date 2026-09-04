import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson } from "@/lib/utils";

const NUQTALAR = ["kirish", "oraliq", "yakuniy"] as const;

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const nuqta = new URL(req.url).searchParams.get("nuqta") ?? "kirish";
  const javob = await prisma.surveyResponse.findUnique({
    where: { userId_nuqta: { userId: session.userId, nuqta } },
  });
  return NextResponse.json({ nuqta, javoblar: javob ? parseJson(javob.javoblar, {}) : null });
}

const schema = z.object({
  nuqta: z.enum(NUQTALAR),
  javoblar: z.record(z.string(), z.union([z.string(), z.number()])),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const { nuqta, javoblar } = parsed.data;

  await prisma.surveyResponse.upsert({
    where: { userId_nuqta: { userId: session.userId, nuqta } },
    create: { userId: session.userId, nuqta, javoblar: JSON.stringify(javoblar) },
    update: { javoblar: JSON.stringify(javoblar) },
  });
  return NextResponse.json({ ok: true });
}
