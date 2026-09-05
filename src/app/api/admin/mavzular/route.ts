import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJson } from "@/lib/utils";

async function adminTekshir() {
  const session = await getSession();
  if (!session) return { xato: "Avtorizatsiya yo'q", status: 401 };
  if (session.role !== "admin") return { xato: "Ruxsat yo'q", status: 403 };
  return { session };
}

export async function GET() {
  const a = await adminTekshir();
  if (a.xato) return NextResponse.json({ xato: a.xato }, { status: a.status });

  const [topics, cards] = await Promise.all([
    prisma.courseTopic.findMany({ orderBy: { tartib: "asc" } }),
    prisma.card.findMany({ select: { raqam: true, nomi: true }, orderBy: { raqam: "asc" } }),
  ]);
  return NextResponse.json({
    topics: topics.map((t) => ({ ...t, kontent: parseJson<Record<string, unknown>>(t.kontent, {}) })),
    cards,
  });
}

const selfCheckSchema = z.object({
  savol: z.string(),
  variantlar: z.array(z.string()),
  togri: z.coerce.number().int().min(0),
});

const mediaSchema = z.object({
  turi: z.enum(["rasm", "video", "havola"]),
  url: z.string(),
  izoh: z.string().optional(),
});

const schema = z.object({
  id: z.string().min(1),
  nomi: z.string().min(1),
  maruzaSoat: z.coerce.number().int().min(0),
  amaliySoat: z.coerce.number().int().min(0),
  mustaqilSoat: z.coerce.number().int().min(0),
  video: z.string().optional(),
  taqdimot: z.string().optional(),
  media: z.array(mediaSchema).default([]),
  kartochkaRaqamlar: z.array(z.coerce.number().int()),
  selfCheck: z.array(selfCheckSchema),
  topshiriq: z.string(),
});

export async function POST(req: Request) {
  const a = await adminTekshir();
  if (a.xato) return NextResponse.json({ xato: a.xato }, { status: a.status });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri" }, { status: 400 });
  const d = parsed.data;

  const topic = await prisma.courseTopic.update({
    where: { id: d.id },
    data: {
      nomi: d.nomi,
      maruzaSoat: d.maruzaSoat, amaliySoat: d.amaliySoat, mustaqilSoat: d.mustaqilSoat,
      kontent: JSON.stringify({
        video: d.video ?? "",
        taqdimot: d.taqdimot ?? "",
        media: d.media.filter((m) => m.url.trim()),
        kartochkaRaqamlar: d.kartochkaRaqamlar,
        selfCheck: d.selfCheck.filter((s) => s.savol.trim()),
        topshiriq: d.topshiriq,
      }),
    },
  });
  return NextResponse.json({ ok: true, topic });
}
