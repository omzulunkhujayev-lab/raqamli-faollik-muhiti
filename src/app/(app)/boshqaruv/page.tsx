import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLLAR, NORMS, type Rol } from "@/lib/constants";
import { haftaKunlari, sanaKey, isoHafta, qadamHolati, HOLAT_RANG, son } from "@/lib/utils";
import YopiqHalqa from "@/components/YopiqHalqa";

export default async function BoshqaruvPage() {
  const session = (await getSession())!;
  const role = session.role as Rol;

  if (role !== "talaba") {
    return <BoshqaRol fio={session.fio} role={role} />;
  }

  // Talaba uchun holat ma'lumotlari
  const bugun = sanaKey(new Date());
  const kunlar = haftaKunlari(new Date());
  const boshi = kunlar[0];
  const oxiri = new Date(kunlar[6]);
  oxiri.setHours(23, 59, 59, 999);

  const [bugungi, haftaEntries, goal] = await Promise.all([
    prisma.dailyEntry.findFirst({ where: { userId: session.userId, sana: { gte: new Date(bugun + "T00:00:00.000Z") } } }),
    prisma.dailyEntry.findMany({ where: { userId: session.userId, sana: { gte: boshi, lte: oxiri } } }),
    prisma.weeklyGoal.findFirst({ where: { userId: session.userId, hafta: isoHafta(new Date()) } }),
  ]);

  const ortachaQadam = haftaEntries.length
    ? Math.round(haftaEntries.reduce((s, e) => s + e.qadam, 0) / haftaEntries.length)
    : 0;
  const jamiFaolDaqiqa = haftaEntries.reduce((s, e) => s + e.faolDaqiqa, 0);

  // Yopiq halqa holati (talaba uchun bo'g'inlar bajarilganmi)
  const halqa = [
    { nomi: "Monitoring", ok: !!bugungi, izoh: bugungi ? "Bugun to'ldirilgan" : "Bugun to'ldirilmagan", href: "/kundalik" },
    { nomi: "Teskari aloqa", ok: haftaEntries.length >= 2, izoh: "Haftalik profil", href: "/profil" },
    { nomi: "Mikrofaollik", ok: haftaEntries.some((e) => e.pauzaSoni > 0), izoh: "Pauza kartochkalari", href: "/kartochkalar" },
    { nomi: "Rag'bat", ok: haftaEntries.some((e) => e.pauzaSoni > 0), izoh: "Chellenj va nishonlar", href: "/gamifikatsiya" },
    { nomi: "Refleksiya", ok: !!goal, izoh: goal ? "Maqsad qo'yilgan" : "Maqsad qo'ying", href: "/maqsad" },
  ];

  const holat = qadamHolati(ortachaQadam);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assalomu alaykum, {session.fio.split(" ")[0]}! 👋</h1>
        <p className="yumshoq">Bugungi holatingiz va haftalik ko'rsatkichlaringiz</p>
      </div>

      {/* Tezkor ko'rsatkichlar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          sarlavha="Bu hafta o'rtacha qadam"
          qiymat={son(ortachaQadam)}
          izoh={`Me'yor: ${son(NORMS.QADAM_KUNLIK)}+`}
          rang={HOLAT_RANG[holat].text}
        />
        <StatCard
          sarlavha="Haftalik faol daqiqalar"
          qiymat={String(jamiFaolDaqiqa)}
          izoh={`Me'yor: ${NORMS.FAOL_DAQIQA_HAFTALIK_MIN}+ daq.`}
          rang={jamiFaolDaqiqa >= NORMS.FAOL_DAQIQA_HAFTALIK_MIN ? "text-ok" : "text-warn"}
        />
        <StatCard
          sarlavha="To'ldirilgan kunlar"
          qiymat={`${haftaEntries.length} / 7`}
          izoh="Muntazamlik baholanadi"
          rang="text-brand-600"
        />
      </div>

      {/* Bugungi harakat chaqiruvi */}
      {!bugungi && (
        <div className="karta flex flex-col items-start gap-3 border-l-4 border-l-warn p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">Bugungi kundalikni to'ldiring</div>
            <div className="text-sm yumshoq">Bir daqiqadan kam vaqt oladi — bu monitoring bo'g'ini</div>
          </div>
          <Link href="/kundalik" className="btn-asosiy">Kundalikni to'ldirish →</Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yopiq halqa holati */}
        <div className="karta p-5">
          <h2 className="font-bold">Yopiq halqa holati</h2>
          <p className="text-sm yumshoq">Har bir bo'g'in bo'yicha bugungi holatingiz</p>
          <div className="mt-4 space-y-2">
            {halqa.map((b) => (
              <Link key={b.nomi} href={b.href} className="flex items-center justify-between rounded-xl border p-3 transition hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--chegara)" }}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${b.ok ? "bg-ok" : "bg-slate-400"}`}>
                    {b.ok ? "✓" : "•"}
                  </span>
                  <span className="font-medium">{b.nomi}</span>
                </div>
                <span className="text-sm yumshoq">{b.izoh}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Halqa sxemasi */}
        <div className="karta p-5">
          <h2 className="font-bold">Tizim mantig'i</h2>
          <div className="mt-2">
            <YopiqHalqa compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ sarlavha, qiymat, izoh, rang }: { sarlavha: string; qiymat: string; izoh: string; rang: string }) {
  return (
    <div className="karta p-5">
      <div className="text-sm yumshoq">{sarlavha}</div>
      <div className={`mt-1 text-3xl font-extrabold ${rang}`}>{qiymat}</div>
      <div className="mt-1 text-xs yumshoq">{izoh}</div>
    </div>
  );
}

// Talaba bo'lmagan rollar uchun boshqaruv
function BoshqaRol({ fio, role }: { fio: string; role: Rol }) {
  const havolalar: Record<string, { nomi: string; href: string }[]> = {
    oqituvchi: [
      { nomi: "O'qituvchi paneli", href: "/panel" },
      { nomi: "Kartochkalar banki", href: "/kartochkalar" },
    ],
    tyutor: [
      { nomi: "Guruh hisoboti", href: "/hisobot" },
      { nomi: "Faollik uzilishlari", href: "/uzilishlar" },
      { nomi: "Guruh baholashi", href: "/baholash" },
    ],
    admin: [
      { nomi: "Kafedra statistikasi", href: "/kafedra" },
      { nomi: "O'quv moduli", href: "/modul" },
      { nomi: "Guruh baholashi", href: "/baholash" },
      { nomi: "Kartochkalar banki", href: "/kartochkalar" },
    ],
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assalomu alaykum, {fio.split(" ")[0]}!</h1>
        <p className="yumshoq">Rol: <b>{ROLLAR[role]}</b></p>
      </div>
      <div className="karta p-5">
        <h2 className="font-bold">Bo'limlaringiz</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(havolalar[role] ?? []).map((h) => (
            <Link key={h.href} href={h.href} className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--chegara)" }}>
              <span className="font-medium">{h.nomi}</span>
              <span className="text-brand-600">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
