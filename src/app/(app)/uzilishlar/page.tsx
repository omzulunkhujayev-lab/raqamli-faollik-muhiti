"use client";

import { useCallback, useEffect, useState } from "react";
import { timelineSegmentlar, minHhmm, type Dars, type Uzilish } from "@/lib/uzilishlar";
import { KUN_TOLIQ } from "@/lib/utils";

interface KunData {
  kun: string;
  darslar: Dars[];
  uzilishlar: Uzilish[];
  monitoring: { engUzunOtirish: number; pauzaSoni: number } | null;
}
interface Guruh { id: string; nomi: string }
interface Taqqoslash { joriy: { otirish: number; pauza: number }; avvalgi: { otirish: number; pauza: number } }

const YECHIM_IKONKA: Record<string, string> = {
  ichki_pauza: "🤸", tanaffus_harakat: "🚶", binolar_piyoda: "🪜", rejim_45_5: "⏲️",
};

const QADAMLAR = [
  "Jadvalni tahlil qilish — ketma-ket mashg'ulotlar va tanaffuslar",
  "Haftalik monitoring ma'lumotini olish — kun bo'yicha faollik profili",
  "Profil va jadvalni taqqoslab, uzilishlarni aniqlash (60 daq.+ o'tirish)",
  "Har bir uzilish uchun to'ldirish variantini taklif qilish",
  "1–2 hafta o'tgach monitoringni takrorlash va samarani baholash",
];

export default function UzilishlarPage() {
  const [guruhlar, setGuruhlar] = useState<Guruh[]>([]);
  const [tanlangan, setTanlangan] = useState<Guruh | null>(null);
  const [kunlar, setKunlar] = useState<KunData[]>([]);
  const [saqlangan, setSaqlangan] = useState<Record<string, string>>({});
  const [taqqoslash, setTaqqoslash] = useState<Taqqoslash | null>(null);
  const [yuk, setYuk] = useState(true);
  const [tahrir, setTahrir] = useState(false);

  const load = useCallback(async (groupId?: string) => {
    setYuk(true);
    const url = groupId ? `/api/uzilishlar?groupId=${groupId}` : "/api/uzilishlar";
    const d = await (await fetch(url)).json();
    setGuruhlar(d.guruhlar);
    setTanlangan(d.tanlangan);
    setKunlar(d.kunlar);
    setSaqlangan(d.saqlangan ?? {});
    setTaqqoslash(d.taqqoslash);
    setYuk(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function yechimSaqla(kun: string, u: Uzilish, yechim: string) {
    if (!tanlangan) return;
    setSaqlangan((s) => ({ ...s, [`${kun}|${u.boshlanish}`]: yechim }));
    await fetch("/api/uzilishlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: tanlangan.id, kun, boshlanish: u.boshlanish, tugash: u.tugash, davomiylikDaq: u.davomiylikDaq, yechim }),
    });
  }

  const jamiUzilish = kunlar.reduce((s, k) => s + k.uzilishlar.length, 0);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Faollik uzilishlari tahlili</h1>
          <p className="yumshoq">Uzluksiz o'tirish 60 daqiqadan oshadigan oraliqlarni aniqlash va to'ldirish</p>
        </div>
        <div className="flex items-center gap-2">
          {guruhlar.length > 1 && (
            <select
              className="input !w-auto"
              value={tanlangan?.id ?? ""}
              onChange={(e) => load(e.target.value)}
            >
              {guruhlar.map((g) => <option key={g.id} value={g.id}>{g.nomi}</option>)}
            </select>
          )}
          <button className="btn-ikkinchi" onClick={() => setTahrir(true)}>Jadvalni tahrirlash</button>
        </div>
      </div>

      {/* 5 qadamli algoritm */}
      <div className="karta p-5">
        <h2 className="font-bold">Tahlil algoritmi (5 qadam)</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {QADAMLAR.map((q, i) => (
            <li key={i} className="rounded-xl border p-3 text-sm" style={{ borderColor: "var(--chegara)" }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
              <span className="mt-2 block yumshoq">{q}</span>
            </li>
          ))}
        </ol>
      </div>

      {yuk ? (
        <div className="yumshoq">Yuklanmoqda...</div>
      ) : kunlar.length === 0 ? (
        <div className="karta p-8 text-center">
          <p className="yumshoq">Dars jadvali kiritilmagan.</p>
          <button className="btn-asosiy mt-4" onClick={() => setTahrir(true)}>Jadval kiritish</button>
        </div>
      ) : (
        <>
          {/* Umumiy holat */}
          <div className={`karta border-l-4 p-4 ${jamiUzilish > 0 ? "border-l-bad" : "border-l-ok"}`}>
            {jamiUzilish > 0 ? (
              <span><b className="text-bad">{jamiUzilish} ta faollik uzilishi</b> aniqlandi. Har biri uchun quyida yechim tanlang.</span>
            ) : (
              <span className="text-ok">✓ Jadvalda 60 daqiqadan oshgan uzluksiz o'tirish bloki aniqlanmadi.</span>
            )}
          </div>

          {/* Kunlar */}
          <div className="space-y-4">
            {kunlar.map((k) => (
              <KunKarta key={k.kun} data={k} saqlangan={saqlangan} onYechim={yechimSaqla} />
            ))}
          </div>

          {/* Taqqoslash (5-qadam) */}
          {taqqoslash && (taqqoslash.joriy.otirish > 0 || taqqoslash.avvalgi.otirish > 0) && (
            <div className="karta p-5">
              <h2 className="font-bold">Samarani baholash (taqqoslama)</h2>
              <p className="text-sm yumshoq">2 hafta oldingi va joriy hafta ko'rsatkichlari</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TaqqoslashKarta nomi="Eng uzun uzluksiz o'tirish (o'rtacha)" avvalgi={taqqoslash.avvalgi.otirish} joriy={taqqoslash.joriy.otirish} birlik="daq." yaxshiKichik />
                <TaqqoslashKarta nomi="Mikrofaollik pauzalari (o'rtacha)" avvalgi={taqqoslash.avvalgi.pauza} joriy={taqqoslash.joriy.pauza} birlik="ta" />
              </div>
            </div>
          )}
        </>
      )}

      {tahrir && tanlangan && (
        <JadvalTahrir groupId={tanlangan.id} kunlar={kunlar} onClose={() => setTahrir(false)} onSaqlandi={() => { setTahrir(false); load(tanlangan.id); }} />
      )}
    </div>
  );
}

function KunKarta({ data, saqlangan, onYechim }: {
  data: KunData; saqlangan: Record<string, string>; onYechim: (kun: string, u: Uzilish, y: string) => void;
}) {
  const { segmentlar, min, max } = timelineSegmentlar(data.darslar);
  const oraliq = Math.max(1, max - min);

  return (
    <div className="karta p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">{data.kun}</h3>
        {data.monitoring && (
          <span className={`rounded-full px-3 py-1 text-xs ${data.monitoring.engUzunOtirish > 60 ? "bg-bad/10 text-bad" : "bg-ok/10 text-ok"}`}>
            Monitoring: eng uzun o'tirish {data.monitoring.engUzunOtirish} daq. · {data.monitoring.pauzaSoni} pauza
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-3">
        <div className="flex h-10 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--fon)" }}>
          {segmentlar.map((s, i) => {
            const w = ((s.tugash - s.boshlanish) / oraliq) * 100;
            const dars = s.turi === "dars";
            return (
              <div
                key={i}
                title={`${dars ? s.nomi : "tanaffus"} · ${minHhmm(s.boshlanish)}–${minHhmm(s.tugash)}`}
                className={`flex items-center justify-center overflow-hidden text-[10px] ${
                  s.uzilishdami ? "text-white" : dars ? "text-white" : "yumshoq"
                }`}
                style={{
                  width: `${w}%`,
                  backgroundColor: s.uzilishdami ? "#dc2626" : dars ? "#0d9488" : "transparent",
                  borderLeft: i > 0 ? "1px solid var(--sirt)" : undefined,
                }}
              >
                {w > 8 && dars ? "•" : ""}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-xs yumshoq">
          <span>{minHhmm(min)}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#0d9488" }} /> mashg'ulot</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#dc2626" }} /> uzilish</span>
          </span>
          <span>{minHhmm(max)}</span>
        </div>
      </div>

      {/* Uzilishlar va yechimlar */}
      {data.uzilishlar.length === 0 ? (
        <p className="mt-3 text-sm text-ok">✓ Bu kun uchun uzilish yo'q</p>
      ) : (
        <div className="mt-4 space-y-3">
          {data.uzilishlar.map((u, i) => {
            const kalit = `${data.kun}|${u.boshlanish}`;
            const tanlangan = saqlangan[kalit];
            return (
              <div key={i} className="rounded-xl border border-bad/30 bg-bad/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-bad">
                    🔴 {u.boshlanish}–{u.tugash} · {u.davomiylikDaq} daqiqa uzluksiz o'tirish
                  </span>
                  <span className="text-xs yumshoq">{u.darslar.join(" → ")}</span>
                </div>
                <div className="mt-2 text-sm yumshoq">Taklif etilgan yechimni tanlang:</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {u.yechimlar.map((y) => (
                    <button
                      key={y.kod}
                      onClick={() => onYechim(data.kun, u, y.kod)}
                      className={`flex items-start gap-2 rounded-xl border p-2.5 text-left text-sm transition ${
                        tanlangan === y.kod ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : ""
                      }`}
                      style={tanlangan !== y.kod ? { borderColor: "var(--chegara)" } : {}}
                    >
                      <span className="text-lg">{YECHIM_IKONKA[y.kod]}</span>
                      <span>
                        <span className="font-medium">{y.nomi}</span>
                        {tanlangan === y.kod && <span className="ml-1 text-ok">✓</span>}
                        <span className="mt-0.5 block text-xs yumshoq">{y.izoh}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaqqoslashKarta({ nomi, avvalgi, joriy, birlik, yaxshiKichik }: {
  nomi: string; avvalgi: number; joriy: number; birlik: string; yaxshiKichik?: boolean;
}) {
  const fark = joriy - avvalgi;
  const yaxshi = yaxshiKichik ? fark < 0 : fark > 0;
  const belgi = fark === 0 ? "→" : yaxshi ? "↓ yaxshilandi" : "↑ yomonlashdi";
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--chegara)" }}>
      <div className="text-sm yumshoq">{nomi}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-sm yumshoq">{avvalgi} {birlik}</span>
        <span>→</span>
        <span className="text-2xl font-bold">{joriy} {birlik}</span>
      </div>
      {fark !== 0 && (
        <div className={`mt-1 text-sm ${yaxshi ? "text-ok" : "text-bad"}`}>
          {yaxshiKichik ? (fark < 0 ? "↓ " : "↑ ") : (fark > 0 ? "↑ " : "↓ ")}{Math.abs(fark)} {birlik} — {yaxshi ? "yaxshilandi" : "e'tibor bering"}
        </div>
      )}
    </div>
  );
}

// Jadval tahrirlash modali
function JadvalTahrir({ groupId, kunlar, onClose, onSaqlandi }: {
  groupId: string; kunlar: KunData[]; onClose: () => void; onSaqlandi: () => void;
}) {
  const [kun, setKun] = useState(KUN_TOLIQ[0]);
  const mavjud = kunlar.find((k) => k.kun === kun)?.darslar ?? [];
  const [darslar, setDarslar] = useState<Dars[]>(mavjud);
  const [saqlash, setSaqlash] = useState(false);

  function kunOzgar(yangi: string) {
    setKun(yangi);
    setDarslar(kunlar.find((k) => k.kun === yangi)?.darslar ?? []);
  }
  function qator() { setDarslar((d) => [...d, { nomi: "", boshlanish: "08:30", tugash: "09:50" }]); }
  function ozgart(i: number, f: keyof Dars, v: string) {
    setDarslar((d) => d.map((x, j) => (j === i ? { ...x, [f]: v } : x)));
  }
  function ochir(i: number) { setDarslar((d) => d.filter((_, j) => j !== i)); }

  async function saqla() {
    setSaqlash(true);
    const toza = darslar.filter((d) => d.nomi.trim());
    await fetch("/api/jadval", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, kun, darslar: toza }),
    });
    setSaqlash(false);
    onSaqlandi();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl" style={{ backgroundColor: "var(--sirt)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b p-4" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
          <h3 className="font-bold">Dars jadvalini tahrirlash</h3>
          <button onClick={onClose} className="btn-ikkinchi !px-2.5 !py-1.5">✕</button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="yorliq">Kun</label>
            <select className="input" value={kun} onChange={(e) => kunOzgar(e.target.value)}>
              {KUN_TOLIQ.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            {darslar.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="input flex-1" placeholder="Mashg'ulot nomi" value={d.nomi} onChange={(e) => ozgart(i, "nomi", e.target.value)} />
                <input className="input !w-24" type="time" value={d.boshlanish} onChange={(e) => ozgart(i, "boshlanish", e.target.value)} />
                <input className="input !w-24" type="time" value={d.tugash} onChange={(e) => ozgart(i, "tugash", e.target.value)} />
                <button onClick={() => ochir(i)} className="btn-ikkinchi !px-2.5 !py-2 text-bad" aria-label="O'chirish">✕</button>
              </div>
            ))}
            <button onClick={qator} className="btn-ikkinchi w-full">+ Mashg'ulot qo'shish</button>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn-ikkinchi">Bekor qilish</button>
            <button onClick={saqla} disabled={saqlash} className="btn-asosiy">{saqlash ? "Saqlanmoqda..." : "Saqlash"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
