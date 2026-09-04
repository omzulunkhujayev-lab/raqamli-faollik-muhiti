"use client";

import { useEffect, useState } from "react";
import { MAQSAD_TURLARI } from "@/lib/constants";
import { son } from "@/lib/utils";

interface Goal { id: string; maqsadTuri: string; joriyQiymat: number; maqsadQiymat: number; bajarildi: boolean; }
type Tur = keyof typeof MAQSAD_TURLARI;

const BIRLIK: Record<Tur, string> = {
  qadam: "qadam/kun", faolDaqiqa: "daq./hafta", pauza: "pauza/kun", otirish: "daq. (o'tirish)",
};

export default function MaqsadPage() {
  const [takliflar, setTakliflar] = useState<Record<string, { joriy: number; taklif: number }>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [yuk, setYuk] = useState(true);

  async function load() {
    const d = await (await fetch("/api/maqsad")).json();
    setTakliflar(d.takliflar);
    setGoals(d.goals);
    setYuk(false);
  }
  useEffect(() => { load(); }, []);

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold">Maqsad qo'yish</h1>
        <p className="yumshoq">Tizim joriy darajangizdan kelib chiqib xavfsiz (10–15%) maqsad taklif qiladi</p>
      </div>

      <div className="karta border-l-4 border-l-warn p-4 text-sm">
        ⚠️ Keskin sakrash (masalan 5 000 → 12 000) tavsiya etilmaydi. Bosqichma-bosqich o'sish
        barqaror odat shakllantiradi.
      </div>

      <div className="space-y-4">
        {(Object.keys(MAQSAD_TURLARI) as Tur[]).map((tur) => (
          <MaqsadKarta
            key={tur}
            tur={tur}
            joriy={takliflar[tur]?.joriy ?? 0}
            taklif={takliflar[tur]?.taklif ?? 0}
            mavjud={goals.find((g) => g.maqsadTuri === tur)}
            onSaqlandi={load}
          />
        ))}
      </div>
    </div>
  );
}

function MaqsadKarta({ tur, joriy, taklif, mavjud, onSaqlandi }: {
  tur: Tur; joriy: number; taklif: number; mavjud?: Goal; onSaqlandi: () => void;
}) {
  const teskari = tur === "otirish"; // o'tirishda kamaytirish yaxshi
  // Slayder chegaralari — keskin sakrashning oldini oladi
  const min = teskari ? Math.max(30, Math.round(joriy * 0.7) || 40) : joriy || 0;
  const max = teskari ? (joriy || 90) : Math.round((joriy || taklif * 1.2) * 1.3) || taklif * 2;
  const step = tur === "qadam" ? 100 : 1;

  const [val, setVal] = useState<number>(mavjud?.maqsadQiymat ?? taklif);
  const [ochiq, setOchiq] = useState(false);
  const [xato, setXato] = useState("");
  const [saqlash, setSaqlash] = useState(false);

  async function saqla() {
    setSaqlash(true);
    setXato("");
    const res = await fetch("/api/maqsad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maqsadTuri: tur, maqsadQiymat: val }),
    });
    const d = await res.json();
    setSaqlash(false);
    if (!res.ok) {
      setXato(d.ogohlantirish ?? d.xato ?? "Xatolik");
      if (d.tavsiya) setVal(d.tavsiya);
      return;
    }
    setOchiq(false);
    onSaqlandi();
  }

  const osish = joriy > 0 ? Math.round(((val - joriy) / joriy) * 100) : 0;

  return (
    <div className="karta p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{MAQSAD_TURLARI[tur]}</div>
          <div className="text-sm yumshoq">
            Joriy daraja: <b>{son(joriy)}</b> {BIRLIK[tur]}
          </div>
        </div>
        {mavjud ? (
          <div className="rounded-xl bg-brand-50 px-3 py-2 text-center dark:bg-brand-900/30">
            <div className="text-xs yumshoq">Joriy maqsad</div>
            <div className="font-bold text-brand-700 dark:text-brand-200">{son(mavjud.maqsadQiymat)}</div>
          </div>
        ) : (
          <div className="rounded-xl bg-ok/10 px-3 py-2 text-center">
            <div className="text-xs yumshoq">Tavsiya</div>
            <div className="font-bold text-ok">{son(taklif)}</div>
          </div>
        )}
        <button className="btn-ikkinchi" onClick={() => { setOchiq((o) => !o); setVal(mavjud?.maqsadQiymat ?? taklif); setXato(""); }}>
          {mavjud ? "O'zgartirish" : "Belgilash"}
        </button>
      </div>

      {ochiq && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--chegara)" }}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm yumshoq">Maqsad qiymati</span>
            <span className="text-xl font-bold text-brand-600">{son(val)} {BIRLIK[tur]}</span>
          </div>
          <input type="range" className="mt-3 w-full" min={min} max={max} step={step} value={val} onChange={(e) => { setVal(Number(e.target.value)); setXato(""); }} />
          <div className="mt-1 text-center text-sm">
            {teskari ? (
              <span className="yumshoq">Joriydan {Math.abs(osish)}% kamaytirish</span>
            ) : (
              <span className={osish > 15 ? "text-warn" : "text-ok"}>Joriydan {osish >= 0 ? "+" : ""}{osish}% {osish > 15 ? "(tez o'sish)" : "(barqaror)"}</span>
            )}
          </div>
          {xato && <div className="mt-3 rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-ikkinchi" onClick={() => setVal(taklif)}>Tavsiyani olish</button>
            <button className="btn-asosiy" onClick={saqla} disabled={saqlash}>{saqlash ? "..." : "Saqlash"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
