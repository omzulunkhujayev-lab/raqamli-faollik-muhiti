"use client";

import { useCallback, useEffect, useState } from "react";
import { MEZON_NOMLARI, type Mezonlar } from "@/lib/baholash";

const NUQTALAR = [
  { kod: "kirish", nomi: "Kirish" },
  { kod: "oraliq", nomi: "Oraliq" },
  { kod: "yakuniy", nomi: "Yakuniy" },
];

export default function BaholashPage() {
  const [role, setRole] = useState<string>("");
  const [nuqta, setNuqta] = useState("yakuniy");

  useEffect(() => {
    fetch("/api/auth/men").then((r) => r.json()).then((d) => setRole(d.user?.role ?? ""));
  }, []);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Baholash va darajalar</h1>
          <p className="yumshoq">Ikki qatlamli tizim: obyektiv (30%) + pedagogik mezonlar (70%)</p>
        </div>
        <div className="flex gap-2">
          {NUQTALAR.map((n) => (
            <button key={n.kod} onClick={() => setNuqta(n.kod)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${nuqta === n.kod ? "bg-brand-600 text-white" : "border"}`}
              style={nuqta !== n.kod ? { borderColor: "var(--chegara)" } : {}}>
              {n.nomi}
            </button>
          ))}
        </div>
      </div>

      {role === "talaba" && <ShaxsiyBaholash nuqta={nuqta} />}
      {(role === "tyutor" || role === "admin") && <GuruhBaholash nuqta={nuqta} />}
    </div>
  );
}

interface Natija {
  obyektiv: number; mezonlar: Mezonlar; integral: number;
  daraja: { kod: string; nomi: string; oraliq: string; tavsif: string; rang: string };
  triangulyatsiya: { nomuvofiq: boolean; farq: number; izoh: string };
  manbalar: { test: boolean; anketa: boolean; esse: boolean; monitoringKun: number; modulTugatildi: number; modulJami: number };
  detallar: { ortachaQadam: number; haftalikFaolDaqiqa: number; ortachaEngUzunOtirish: number; ortachaPauza: number; ortachaUyqu: number };
}

const RANG: Record<string, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad" };
const RANG_HEX: Record<string, string> = { ok: "#16a34a", warn: "#eab308", bad: "#dc2626" };

function ShaxsiyBaholash({ nuqta }: { nuqta: string }) {
  const [d, setD] = useState<Natija | null>(null);
  const [yuk, setYuk] = useState(true);

  const load = useCallback(async () => {
    setYuk(true);
    const res = await (await fetch(`/api/baholash?nuqta=${nuqta}`)).json();
    setD(res); setYuk(false);
  }, [nuqta]);
  useEffect(() => { load(); }, [load]);

  if (yuk || !d) return <div className="yumshoq">Yuklanmoqda...</div>;

  const mezonRang = (v: number) => (v >= 86 ? "ok" : v >= 71 ? "warn" : "bad");

  return (
    <div className="space-y-5">
      {/* Integral va daraja */}
      <div className="karta p-6 text-center">
        <div className="text-sm yumshoq">Integral baho ({nuqta})</div>
        <div className={`mt-1 text-5xl font-extrabold ${RANG[d.daraja.rang]}`}>{d.integral}</div>
        <div className={`mt-2 inline-block rounded-full px-4 py-1 font-semibold ${d.daraja.rang === "ok" ? "bg-ok/10 text-ok" : d.daraja.rang === "warn" ? "bg-warn/10 text-warn" : "bg-bad/10 text-bad"}`}>
          {d.daraja.nomi} daraja ({d.daraja.oraliq})
        </div>
        <p className="mx-auto mt-3 max-w-xl text-sm yumshoq">{d.daraja.tavsif}</p>
      </div>

      {/* Obyektiv qatlam */}
      <div className="karta p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Obyektiv qatlam <span className="yumshoq font-normal">(ulush 30%)</span></h2>
          <span className="text-xl font-bold">{d.obyektiv}/100</span>
        </div>
        <p className="text-sm yumshoq">Me'yorga moslik (mutlaq ko'rsatkich baho emas — faqat 30% ulush)</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <Detal nomi="O'rt. qadam" qiymat={d.detallar.ortachaQadam} />
          <Detal nomi="Faol daq./hafta" qiymat={d.detallar.haftalikFaolDaqiqa} />
          <Detal nomi="O'rt. o'tirish" qiymat={`${d.detallar.ortachaEngUzunOtirish} daq.`} />
          <Detal nomi="O'rt. pauza" qiymat={d.detallar.ortachaPauza} />
          <Detal nomi="O'rt. uyqu" qiymat={`${d.detallar.ortachaUyqu} s`} />
        </div>
      </div>

      {/* Pedagogik mezonlar */}
      <div className="karta p-5">
        <h2 className="font-bold">Pedagogik mezonlar <span className="yumshoq font-normal">(ulush 70%)</span></h2>
        <div className="mt-4 space-y-4">
          {(Object.keys(MEZON_NOMLARI) as (keyof Mezonlar)[]).map((k) => {
            const v = d.mezonlar[k];
            const rang = mezonRang(v);
            return (
              <div key={k}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{MEZON_NOMLARI[k].nomi}</span>
                  <span className={`font-bold ${RANG[rang]}`}>{v}/100</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--chegara)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, backgroundColor: RANG_HEX[rang] }} />
                </div>
                <div className="mt-0.5 text-xs yumshoq">Vosita: {MEZON_NOMLARI[k].vosita}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Triangulyatsiya */}
      <div className={`karta border-l-4 p-4 ${d.triangulyatsiya.nomuvofiq ? "border-l-warn" : "border-l-ok"}`}>
        <h2 className="font-bold">Triangulyatsiya</h2>
        <p className="mt-1 text-sm yumshoq">
          Talaba yozuvi + qurilma ma'lumoti + kuzatuv/ekspert bahosi taqqoslanadi.
        </p>
        <p className={`mt-2 text-sm ${d.triangulyatsiya.nomuvofiq ? "text-warn" : "text-ok"}`}>
          {d.triangulyatsiya.nomuvofiq ? "⚠️ " : "✓ "}{d.triangulyatsiya.izoh}
        </p>
      </div>

      {/* Manbalar holati */}
      <div className="karta p-5">
        <h2 className="font-bold">Ma'lumot manbalari holati</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <Manba bor={d.manbalar.anketa} nomi="Anketa" havola="/diagnostika" />
          <Manba bor={d.manbalar.test} nomi="Bilim testi" havola="/diagnostika" />
          <Manba bor={d.manbalar.esse} nomi="Refleksiv esse" havola="/diagnostika" />
          <Manba bor={d.manbalar.monitoringKun > 0} nomi={`Monitoring (${d.manbalar.monitoringKun} kun)`} havola="/kundalik" />
          <Manba bor={d.manbalar.modulTugatildi > 0} nomi={`Modul (${d.manbalar.modulTugatildi}/${d.manbalar.modulJami})`} havola="/modul" />
        </div>
        <p className="mt-3 text-xs yumshoq">Yetishmayotgan manbalarni to'ldirish integral bahoni to'liqroq qiladi.</p>
      </div>
    </div>
  );
}

function Detal({ nomi, qiymat }: { nomi: string; qiymat: string | number }) {
  return (
    <div className="rounded-lg border p-2 text-center" style={{ borderColor: "var(--chegara)" }}>
      <div className="text-xs yumshoq">{nomi}</div>
      <div className="font-semibold">{qiymat}</div>
    </div>
  );
}

function Manba({ bor, nomi, havola }: { bor: boolean; nomi: string; havola: string }) {
  return (
    <a href={havola} className="flex items-center gap-2 rounded-lg border p-2 transition hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--chegara)" }}>
      <span className={bor ? "text-ok" : "text-bad"}>{bor ? "✓" : "○"}</span>
      <span>{nomi}</span>
    </a>
  );
}

interface GuruhNatija {
  talabaSoni: number;
  darajalar: { yuqori: number; orta: number; quyi: number };
  ortacha: Mezonlar & { obyektiv: number; integral: number };
  nomuvofiqSoni: number;
}

function GuruhBaholash({ nuqta }: { nuqta: string }) {
  const [guruhlar, setGuruhlar] = useState<{ id: string; nomi: string }[]>([]);
  const [tanlangan, setTanlangan] = useState<{ id: string; nomi: string } | null>(null);
  const [natija, setNatija] = useState<GuruhNatija | null>(null);
  const [yuk, setYuk] = useState(true);

  const load = useCallback(async (groupId?: string) => {
    setYuk(true);
    const url = `/api/baholash/guruh?nuqta=${nuqta}${groupId ? `&groupId=${groupId}` : ""}`;
    const d = await (await fetch(url)).json();
    setGuruhlar(d.guruhlar ?? []); setTanlangan(d.tanlangan); setNatija(d.natija); setYuk(false);
  }, [nuqta]);
  useEffect(() => { load(tanlangan?.id); }, [nuqta]); // eslint-disable-line react-hooks/exhaustive-deps

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;
  if (!natija) return <div className="karta p-8 text-center yumshoq">Guruh yoki ma'lumot yo'q.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="karta border-l-4 border-l-brand-500 p-3 text-sm yumshoq">
          🔒 Anonim: alohida talaba ismi/natijasi ko'rinmaydi — faqat guruh taqsimoti.
        </div>
        {guruhlar.length > 1 && (
          <select className="input !w-auto" value={tanlangan?.id ?? ""} onChange={(e) => load(e.target.value)}>
            {guruhlar.map((g) => <option key={g.id} value={g.id}>{g.nomi}</option>)}
          </select>
        )}
      </div>

      <div className="text-sm yumshoq">Guruh: <b>{tanlangan?.nomi}</b> · {natija.talabaSoni} talaba · {nuqta}</div>

      {/* Darajalar taqsimoti */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DarajaKarta nomi="Yuqori (86–100)" soni={natija.darajalar.yuqori} jami={natija.talabaSoni} rang="ok" />
        <DarajaKarta nomi="O'rta (71–85)" soni={natija.darajalar.orta} jami={natija.talabaSoni} rang="warn" />
        <DarajaKarta nomi="Quyi (≤70)" soni={natija.darajalar.quyi} jami={natija.talabaSoni} rang="bad" />
      </div>

      {/* Mezon o'rtachalari */}
      <div className="karta p-5">
        <h2 className="font-bold">Mezonlar bo'yicha o'rtacha (guruh)</h2>
        <div className="mt-4 space-y-3">
          {([["motivatsion", "Motivatsion-qadriyatli"], ["kognitiv", "Kognitiv-metodik"], ["faoliyatli", "Faoliyatli-monitoring"], ["refleksiv", "Refleksiv-korreksion"], ["obyektiv", "Obyektiv (30%)"]] as [keyof GuruhNatija["ortacha"], string][]).map(([k, nomi]) => {
            const v = natija.ortacha[k];
            return (
              <div key={k}>
                <div className="flex justify-between text-sm"><span>{nomi}</span><span className="font-bold">{v}/100</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--chegara)" }}>
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Triangulyatsiya signallari */}
      <div className={`karta border-l-4 p-4 ${natija.nomuvofiqSoni > 0 ? "border-l-warn" : "border-l-ok"}`}>
        <h2 className="font-bold">Triangulyatsiya signallari</h2>
        <p className="mt-1 text-sm yumshoq">
          {natija.nomuvofiqSoni > 0
            ? `${natija.nomuvofiqSoni} ta talabada manbalar orasida sezilarli farq bor. Bu jazo emas — individual suhbat uchun signal.`
            : "Nomuvofiqlik signali yo'q."}
        </p>
      </div>
    </div>
  );
}

function DarajaKarta({ nomi, soni, jami, rang }: { nomi: string; soni: number; jami: number; rang: string }) {
  const foiz = jami ? Math.round((soni / jami) * 100) : 0;
  return (
    <div className={`karta border-l-4 p-5 ${rang === "ok" ? "border-l-ok" : rang === "warn" ? "border-l-warn" : "border-l-bad"}`}>
      <div className="text-sm yumshoq">{nomi}</div>
      <div className={`mt-1 text-3xl font-extrabold ${RANG[rang]}`}>{soni}</div>
      <div className="text-xs yumshoq">{foiz}% talaba</div>
    </div>
  );
}
