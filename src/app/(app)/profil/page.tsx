"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { NORMS } from "@/lib/constants";
import { qadamHolati, otirishHolati, foiz, HOLAT_RANG, faolDaqiqaHolati, son } from "@/lib/utils";

interface Kun {
  kun: string; sana: string; qadam: number; faolDaqiqa: number;
  engUzunOtirish: number; pauzaSoni: number; uyquSoat: number; bor: boolean;
}
interface Xulosa {
  ortachaQadam: number; jamiFaolDaqiqa: number; engUzunOtirish: number;
  jamiPauza: number; ortachaUyqu: number; toldirilganKun: number;
}

export default function ProfilPage() {
  const [offset, setOffset] = useState(0);
  const [kunlik, setKunlik] = useState<Kun[]>([]);
  const [xulosa, setXulosa] = useState<Xulosa | null>(null);
  const [oraliq, setOraliq] = useState({ boshi: "", oxiri: "" });
  const [yuk, setYuk] = useState(true);

  const load = useCallback(async (off: number) => {
    setYuk(true);
    const res = await fetch(`/api/profil?hafta=${off}`);
    const d = await res.json();
    setKunlik(d.kunlik);
    setXulosa(d.xulosa);
    setOraliq({ boshi: d.haftaBoshi, oxiri: d.haftaOxiri });
    setYuk(false);
  }, []);

  useEffect(() => { load(offset); }, [offset, load]);

  const tick = { fontSize: 12, fill: "var(--matn-yumshoq)" };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Haftalik profil</h1>
          <p className="yumshoq">Teskari aloqa: ma'lumotlaringiz tushunarli shaklda</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ikkinchi !px-3" onClick={() => setOffset((o) => o - 1)}>← O'tgan</button>
          <span className="min-w-[120px] text-center text-sm yumshoq">{oraliq.boshi} — {oraliq.oxiri}</span>
          <button className="btn-ikkinchi !px-3" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0}>Keyingi →</button>
        </div>
      </div>

      {yuk || !xulosa ? (
        <div className="yumshoq">Yuklanmoqda...</div>
      ) : xulosa.toldirilganKun === 0 ? (
        <div className="karta p-8 text-center">
          <p className="yumshoq">Bu hafta uchun ma'lumot yo'q.</p>
          <Link href="/kundalik" className="btn-asosiy mt-4">Kundalikni to'ldirish →</Link>
        </div>
      ) : (
        <>
          {/* Me'yorga nisbatan indikatorlar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Indikator
              sarlavha="O'rtacha kunlik qadam"
              qiymat={son(xulosa.ortachaQadam)}
              foiz={foiz(xulosa.ortachaQadam, NORMS.QADAM_KUNLIK)}
              holat={qadamHolati(xulosa.ortachaQadam)}
            />
            <Indikator
              sarlavha="Haftalik faol daqiqalar"
              qiymat={`${xulosa.jamiFaolDaqiqa} daq.`}
              foiz={foiz(xulosa.jamiFaolDaqiqa, NORMS.FAOL_DAQIQA_HAFTALIK_MIN)}
              holat={faolDaqiqaHolati(xulosa.jamiFaolDaqiqa)}
            />
            <Indikator
              sarlavha="Eng uzun o'tirish"
              qiymat={`${xulosa.engUzunOtirish} daq.`}
              foiz={Math.min(100, foiz(xulosa.engUzunOtirish, NORMS.OTIRISH_CHEGARA))}
              holat={otirishHolati(xulosa.engUzunOtirish)}
              teskari
            />
          </div>

          {/* Qadamlar dinamikasi */}
          <div className="karta p-5">
            <h2 className="font-bold">Qadamlar dinamikasi</h2>
            <p className="text-sm yumshoq">Ustunlar me'yorga nisbatan ranglangan (yashil/sariq/qizil)</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kunlik} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
                  <XAxis dataKey="kun" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} />
                  <Tooltip content={<TipQadam />} cursor={{ fill: "var(--chegara)", opacity: 0.3 }} />
                  <ReferenceLine y={NORMS.QADAM_KUNLIK} stroke="#16a34a" strokeDasharray="5 5" label={{ value: "me'yor", position: "right", fontSize: 10, fill: "#16a34a" }} />
                  <Bar dataKey="qadam" radius={[6, 6, 0, 0]}>
                    {kunlik.map((k, i) => (
                      <Cell key={i} fill={HOLAT_RANG[qadamHolati(k.qadam)].hex} opacity={k.bor ? 1 : 0.25} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Faol daqiqalar */}
            <div className="karta p-5">
              <h2 className="font-bold">Faol daqiqalar</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kunlik} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
                    <XAxis dataKey="kun" tick={tick} axisLine={false} tickLine={false} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ stroke: "var(--chegara)" }} contentStyle={tipStyle} />
                    <Line type="monotone" dataKey="faolDaqiqa" name="Faol daq." stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Uzluksiz o'tirish */}
            <div className="karta p-5">
              <h2 className="font-bold">Uzluksiz o'tirish (eng uzun)</h2>
              <p className="text-sm yumshoq">Qizil chiziqdan yuqorisi — faollik uzilishi xavfi</p>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kunlik} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
                    <XAxis dataKey="kun" tick={tick} axisLine={false} tickLine={false} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "var(--chegara)", opacity: 0.3 }} contentStyle={tipStyle} />
                    <ReferenceLine y={NORMS.OTIRISH_CHEGARA} stroke="#dc2626" strokeDasharray="5 5" label={{ value: "60 daq.", position: "right", fontSize: 10, fill: "#dc2626" }} />
                    <Bar dataKey="engUzunOtirish" name="O'tirish (daq.)" radius={[6, 6, 0, 0]}>
                      {kunlik.map((k, i) => (
                        <Cell key={i} fill={HOLAT_RANG[otirishHolati(k.engUzunOtirish)].hex} opacity={k.bor ? 1 : 0.25} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Haftalik tahlil formasi */}
          <HaftalikTahlil offset={offset} />
        </>
      )}
    </div>
  );
}

const tipStyle = {
  backgroundColor: "var(--sirt)",
  border: "1px solid var(--chegara)",
  borderRadius: 12,
  color: "var(--matn)",
  fontSize: 13,
};

function TipQadam({ active, payload }: { active?: boolean; payload?: { payload: Kun }[] }) {
  if (!active || !payload?.length) return null;
  const k = payload[0].payload;
  return (
    <div style={tipStyle} className="p-2">
      <div className="font-semibold">{k.kun}</div>
      <div>{son(k.qadam)} qadam</div>
      {!k.bor && <div className="text-xs yumshoq">Ma'lumot yo'q</div>}
    </div>
  );
}

function Indikator({ sarlavha, qiymat, foiz, holat, teskari }: {
  sarlavha: string; qiymat: string; foiz: number; holat: "ok" | "warn" | "bad"; teskari?: boolean;
}) {
  const r = HOLAT_RANG[holat];
  return (
    <div className={`karta border-l-4 p-5 ${r.border}`}>
      <div className="text-sm yumshoq">{sarlavha}</div>
      <div className={`mt-1 text-2xl font-extrabold ${r.text}`}>{qiymat}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--chegara)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, foiz)}%`, backgroundColor: r.hex }} />
      </div>
      <div className={`mt-1 text-xs ${r.text}`}>
        Me'yorga nisbatan {foiz}%{teskari ? " (kam bo'lgani ma'qul)" : ""}
      </div>
    </div>
  );
}

// 4.3 — hafta yakunidagi majburiy tahlil savollari
function HaftalikTahlil({ offset }: { offset: number }) {
  const [j, setJ] = useState({ engFaolKun: "", engPastKun: "", uzunOtirishVaqt: "", keyingiMaqsad: "" });
  const [saqlandi, setSaqlandi] = useState(false);
  const [saqlash, setSaqlash] = useState(false);

  useEffect(() => {
    fetch(`/api/refleksiya?hafta=${offset}`).then((r) => r.json()).then((d) => {
      if (d.refleksiya) {
        setJ({
          engFaolKun: d.refleksiya.engFaolKun ?? "",
          engPastKun: d.refleksiya.engPastKun ?? "",
          uzunOtirishVaqt: d.refleksiya.uzunOtirishVaqt ?? "",
          keyingiMaqsad: d.refleksiya.keyingiMaqsad ?? "",
        });
      } else {
        setJ({ engFaolKun: "", engPastKun: "", uzunOtirishVaqt: "", keyingiMaqsad: "" });
      }
      setSaqlandi(false);
    });
  }, [offset]);

  async function saqla() {
    setSaqlash(true);
    const res = await fetch("/api/refleksiya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hafta: offset, ...j }),
    });
    if (res.ok) setSaqlandi(true);
    setSaqlash(false);
  }

  const savollar: [keyof typeof j, string][] = [
    ["engFaolKun", "Qaysi kun eng faol bo'ldi va nima uchun?"],
    ["engPastKun", "Qaysi kun eng past ko'rsatkich qayd etildi, sababi nimada?"],
    ["uzunOtirishVaqt", "Qaysi vaqt oralig'ida uzluksiz o'tirish eng uzun bo'ldi?"],
    ["keyingiMaqsad", "Kelgusi haftaga qanday bitta aniq maqsad qo'yaman?"],
  ];

  return (
    <div className="karta border-l-4 border-l-brand-500 p-5">
      <h2 className="font-bold">Hafta yakunidagi tahlil (refleksiya)</h2>
      <p className="text-sm yumshoq">Bu bo'g'in yopiq halqani yopadi — javoblaringiz keyingi maqsad uchun asos bo'ladi</p>
      <div className="mt-4 space-y-4">
        {savollar.map(([k, savol]) => (
          <div key={k}>
            <label className="yorliq">{savol}</label>
            <textarea
              className="input resize-none" rows={2}
              value={j[k]} onChange={(e) => { setJ((s) => ({ ...s, [k]: e.target.value })); setSaqlandi(false); }}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        {saqlandi && <span className="text-sm text-ok">✓ Saqlandi</span>}
        <Link href="/maqsad" className="btn-ikkinchi ml-auto">Maqsad qo'yishga o'tish →</Link>
        <button onClick={saqla} disabled={saqlash} className="btn-asosiy">
          {saqlash ? "Saqlanmoqda..." : "Tahlilni saqlash"}
        </button>
      </div>
    </div>
  );
}
