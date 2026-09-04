"use client";

import { useCallback, useEffect, useState } from "react";
import { son } from "@/lib/utils";

interface Guruh { id: string; nomi: string; tur: string }
interface Hisobot {
  talabaSoni: number; ortachaQadam: number;
  meyorgaErishgan: number; meyorFoiz: number;
  muntazam: number; muntazamFoiz: number;
}

export default function HisobotPage() {
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [tanlangan, setTanlangan] = useState<Guruh | null>(null);
  const [hisobot, setHisobot] = useState<Hisobot | null>(null);
  const [yuk, setYuk] = useState(true);

  const load = useCallback(async (groupId?: string) => {
    setYuk(true);
    const url = groupId ? `/api/tyutor/hisobot?groupId=${groupId}` : "/api/tyutor/hisobot";
    const d = await (await fetch(url)).json();
    setGuruhlar(d.guruhlar);
    setTanlangan(d.tanlangan);
    setHisobot(d.hisobot);
    setYuk(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Guruh hisoboti</h1>
          <p className="yumshoq">Haftalik anonim ko'rsatkichlar</p>
        </div>
        {guruhlar.length > 1 && (
          <select className="input !w-auto" value={tanlangan?.id ?? ""} onChange={(e) => load(e.target.value)}>
            {guruhlar.map((g) => <option key={g.id} value={g.id}>{g.nomi}</option>)}
          </select>
        )}
      </div>

      {/* Maxfiylik eslatmasi */}
      <div className="karta border-l-4 border-l-brand-500 p-4 text-sm yumshoq">
        🔒 Hisobot faqat <b>umumlashtirilgan va shaxssizlashtirilgan</b> ko'rsatkichlarni ko'rsatadi.
        Alohida talabaning ismi, natijasi yoki reytingi ko'rinmaydi.
      </div>

      {yuk ? (
        <div className="yumshoq">Yuklanmoqda...</div>
      ) : !hisobot || guruhlar.length === 0 ? (
        <div className="karta p-8 text-center yumshoq">Guruh biriktirilmagan yoki ma'lumot yo'q.</div>
      ) : (
        <>
          <div className="text-sm yumshoq">
            Guruh: <b>{tanlangan?.nomi}</b> · {hisobot.talabaSoni} talaba · joriy hafta
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetrKarta
              sarlavha="O'rtacha kunlik qadam"
              qiymat={son(hisobot.ortachaQadam)}
              izoh="Guruh bo'yicha o'rtacha"
              rang={hisobot.ortachaQadam >= 8000 ? "text-ok" : hisobot.ortachaQadam >= 5000 ? "text-warn" : "text-bad"}
            />
            <MetrKarta
              sarlavha="Faol daqiqa me'yoriga erishganlar"
              qiymat={`${hisobot.meyorFoiz}%`}
              izoh={`${hisobot.meyorgaErishgan} / ${hisobot.talabaSoni} talaba (150+ daq./hafta)`}
              rang={hisobot.meyorFoiz >= 50 ? "text-ok" : "text-warn"}
              foiz={hisobot.meyorFoiz}
            />
            <MetrKarta
              sarlavha="Monitoringni muntazam yuritganlar"
              qiymat={`${hisobot.muntazamFoiz}%`}
              izoh={`${hisobot.muntazam} / ${hisobot.talabaSoni} talaba (haftada 5+ kun)`}
              rang={hisobot.muntazamFoiz >= 50 ? "text-ok" : "text-warn"}
              foiz={hisobot.muntazamFoiz}
            />
          </div>

          <div className="karta p-5 text-sm yumshoq">
            <p><b>Izoh:</b> Bu ko'rsatkichlar guruhning umumiy dinamikasini kuzatish uchun. Baholanadigan narsa —
            mutlaq qadamlar emas, balki <b>monitoringning muntazamligi</b> va guruhning umumiy faollik madaniyati.
            Individual suhbat va diagnostika alohida (shaxsiy) tartibda tashkil etiladi.</p>
          </div>
        </>
      )}
    </div>
  );
}

function MetrKarta({ sarlavha, qiymat, izoh, rang, foiz }: {
  sarlavha: string; qiymat: string; izoh: string; rang: string; foiz?: number;
}) {
  return (
    <div className="karta p-5">
      <div className="text-sm yumshoq">{sarlavha}</div>
      <div className={`mt-1 text-3xl font-extrabold ${rang}`}>{qiymat}</div>
      {foiz !== undefined && (
        <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--chegara)" }}>
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, foiz)}%` }} />
        </div>
      )}
      <div className="mt-2 text-xs yumshoq">{izoh}</div>
    </div>
  );
}
