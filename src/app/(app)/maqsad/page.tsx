"use client";

import { useEffect, useState } from "react";
import { MAQSAD_TURLARI } from "@/lib/constants";
import { son } from "@/lib/utils";
import { useT } from "@/components/LangProvider";

interface Goal { id: string; maqsadTuri: string; joriyQiymat: number; maqsadQiymat: number; bajarildi: boolean; }
type Tur = keyof typeof MAQSAD_TURLARI;

export default function MaqsadPage() {
  const { t } = useT();
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

  if (yuk) return <div className="yumshoq">{t("common.yuklanmoqda")}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold">{t("maqsad.sarlavha")}</h1>
        <p className="yumshoq">{t("maqsad.tavsif")}</p>
      </div>

      <div className="karta border-l-4 border-l-warn p-4 text-sm">{t("maqsad.ogoh")}</div>

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
  const { t } = useT();
  const birlik = t(`maqsadBirlik.${tur}`);
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
          <div className="font-semibold">{t(`maqsadTuri.${tur}`)}</div>
          <div className="text-sm yumshoq">
            {t("maqsad.joriyDaraja")}: <b>{son(joriy)}</b> {birlik}
          </div>
        </div>
        {mavjud ? (
          <div className="rounded-xl bg-brand-50 px-3 py-2 text-center dark:bg-brand-900/30">
            <div className="text-xs yumshoq">{t("maqsad.joriyMaqsad")}</div>
            <div className="font-bold text-brand-700 dark:text-brand-200">{son(mavjud.maqsadQiymat)}</div>
          </div>
        ) : (
          <div className="rounded-xl bg-ok/10 px-3 py-2 text-center">
            <div className="text-xs yumshoq">{t("maqsad.tavsiya")}</div>
            <div className="font-bold text-ok">{son(taklif)}</div>
          </div>
        )}
        <button className="btn-ikkinchi" onClick={() => { setOchiq((o) => !o); setVal(mavjud?.maqsadQiymat ?? taklif); setXato(""); }}>
          {mavjud ? t("maqsad.ozgartirish") : t("maqsad.belgilash")}
        </button>
      </div>

      {ochiq && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--chegara)" }}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm yumshoq">{t("maqsad.qiymat")}</span>
            <span className="text-xl font-bold text-brand-600">{son(val)} {birlik}</span>
          </div>
          <input type="range" className="mt-3 w-full" min={min} max={max} step={step} value={val} onChange={(e) => { setVal(Number(e.target.value)); setXato(""); }} />
          <div className="mt-1 text-center text-sm">
            {teskari ? (
              <span className="yumshoq">{t("maqsad.kamaytirish", { x: Math.abs(osish) })}</span>
            ) : (
              <span className={osish > 15 ? "text-warn" : "text-ok"}>{t("maqsad.osish", { belgi: osish >= 0 ? "+" : "", x: osish })} {osish > 15 ? t("maqsad.tez") : t("maqsad.barqaror")}</span>
            )}
          </div>
          {xato && <div className="mt-3 rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-ikkinchi" onClick={() => setVal(taklif)}>{t("maqsad.tavsiyaOl")}</button>
            <button className="btn-asosiy" onClick={saqla} disabled={saqlash}>{saqlash ? "..." : t("common.saqlash")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
