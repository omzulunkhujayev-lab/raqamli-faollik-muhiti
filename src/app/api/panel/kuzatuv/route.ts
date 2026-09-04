import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function faqatOqituvchi(role: string) {
  return role === "oqituvchi" || role === "admin";
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (!faqatOqituvchi(session.role)) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });

  const kartalar = await prisma.observationCard.findMany({
    where: { oqituvchiId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { lessonPlan: { select: { nomi: true, kun: true } } },
  });
  return NextResponse.json({ kartalar });
}

const schema = z.object({
  lessonPlanId: z.string().optional().nullable(),
  pauzaTuri: z.string().optional(),
  otkazildi: z.boolean().default(false),
  ishtirokDarajasi: z.string().optional(),
  izoh: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (!faqatOqituvchi(session.role)) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: "Ma'lumot noto'g'ri" }, { status: 400 });
  const d = parsed.data;

  const karta = await prisma.observationCard.create({
    data: {
      oqituvchiId: session.userId,
      lessonPlanId: d.lessonPlanId || null,
      pauzaTuri: d.pauzaTuri ?? null,
      otkazildi: d.otkazildi,
      ishtirokDarajasi: d.ishtirokDarajasi ?? null,
      izoh: d.izoh ?? null,
    },
  });
  return NextResponse.json({ ok: true, karta });
}
