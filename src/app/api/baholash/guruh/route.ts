import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { baholaHisobla } from "@/lib/baholashHisobla";

// Guruh bo'yicha ANONIM baholash: darajalar taqsimoti + mezon o'rtachalari + triangulyatsiya belgilari
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });
  if (session.role !== "tyutor" && session.role !== "admin") {
    return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });
  }

  const nuqta = new URL(req.url).searchParams.get("nuqta") ?? "yakuniy";
  const soralgan = new URL(req.url).searchParams.get("groupId");

  const guruhlar =
    session.role === "tyutor"
      ? await prisma.group.findMany({ where: { tyutorId: session.userId }, select: { id: true, nomi: true, tur: true } })
      : await prisma.group.findMany({ select: { id: true, nomi: true, tur: true }, orderBy: { nomi: "asc" } });
  if (guruhlar.length === 0) return NextResponse.json({ guruhlar: [], tanlangan: null, natija: null });

  const tanlangan = guruhlar.find((g) => g.id === soralgan) ?? guruhlar[0];
  const azolar = await prisma.user.findMany({ where: { groupId: tanlangan.id, role: "talaba" }, select: { id: true } });

  const darajalar = { yuqori: 0, orta: 0, quyi: 0 };
  const jami = { motivatsion: 0, kognitiv: 0, faoliyatli: 0, refleksiv: 0, obyektiv: 0, integral: 0 };
  let nomuvofiqSoni = 0;

  for (const a of azolar) {
    const b = await baholaHisobla(a.id, nuqta);
    darajalar[b.daraja.kod]++;
    jami.motivatsion += b.mezonlar.motivatsion;
    jami.kognitiv += b.mezonlar.kognitiv;
    jami.faoliyatli += b.mezonlar.faoliyatli;
    jami.refleksiv += b.mezonlar.refleksiv;
    jami.obyektiv += b.obyektiv;
    jami.integral += b.integral;
    if (b.triangulyatsiya.nomuvofiq) nomuvofiqSoni++;
  }

  const soni = azolar.length || 1;
  const ort = (v: number) => Math.round(v / soni);

  return NextResponse.json({
    guruhlar, tanlangan, nuqta,
    natija: {
      talabaSoni: azolar.length,
      darajalar,
      ortacha: {
        motivatsion: ort(jami.motivatsion), kognitiv: ort(jami.kognitiv),
        faoliyatli: ort(jami.faoliyatli), refleksiv: ort(jami.refleksiv),
        obyektiv: ort(jami.obyektiv), integral: ort(jami.integral),
      },
      nomuvofiqSoni,
    },
  });
}
