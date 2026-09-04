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

  const cards = await prisma.card.findMany({ orderBy: { raqam: "asc" } });
  return NextResponse.json({
    cards: cards.map((c) => ({
      ...c,
      algoritm: parseJson<string[]>(c.algoritm, []),
      mosFanlar: parseJson<string[]>(c.mosFanlar, []),
    })),
  });
}

const schema = z.object({
  id: z.string().optional(),
  raqam: z.coerce.number().int().min(1),
  nomi: z.string().min(1),
  turi: z.enum(["gigiyenik", "kognitiv", "kasbiy"]),
  davomiylik: z.string().min(1),
  joyJihoz: z.string().min(1),
  joyTuri: z.enum(["urindan_turmasdan", "auditoriya", "tanaffus_ochiq_havo"]),
  algoritm: z.array(z.string()),
  metodikEslatma: z.string(),
  mosFanlar: z.array(z.string()),
  moslashtirilganVariant: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const a = await adminTekshir();
  if (a.xato) return NextResponse.json({ xato: a.xato }, { status: a.status });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ xato: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri" }, { status: 400 });
  const d = parsed.data;

  // Raqam takrorlanmasligini tekshirish
  const raqamEgasI = await prisma.card.findUnique({ where: { raqam: d.raqam } });
  if (raqamEgasI && raqamEgasI.id !== d.id) {
    return NextResponse.json({ xato: `№${d.raqam} allaqachon band` }, { status: 409 });
  }

  const data = {
    raqam: d.raqam, nomi: d.nomi, turi: d.turi, davomiylik: d.davomiylik,
    joyJihoz: d.joyJihoz, joyTuri: d.joyTuri,
    algoritm: JSON.stringify(d.algoritm.filter((x) => x.trim())),
    metodikEslatma: d.metodikEslatma,
    mosFanlar: JSON.stringify(d.mosFanlar.filter((x) => x.trim())),
    moslashtirilganVariant: d.moslashtirilganVariant || null,
  };

  const card = d.id
    ? await prisma.card.update({ where: { id: d.id }, data })
    : await prisma.card.create({ data });
  return NextResponse.json({ ok: true, card });
}

export async function DELETE(req: Request) {
  const a = await adminTekshir();
  if (a.xato) return NextResponse.json({ xato: a.xato }, { status: a.status });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ xato: "id kerak" }, { status: 400 });
  await prisma.card.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
