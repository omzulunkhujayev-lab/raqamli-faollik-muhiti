"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { NORMS } from "@/lib/constants";
import { qadamHolati, otirishHolati, foiz, HOLAT_RANG, faolDaqiqaHolati, son } from "@/lib/utils";
import { useT } from "@/components/LangProvider";

interface Kun {
  kun: string; sana: string; qadam: number; faolDaqiqa: number;
  engUzunOtirish: number; pauzaSoni: number; uyquSoat: number; bor: boolean;
}
interface Xulosa {
  ortachaQadam: number; jamiFaolDaqiqa: number; engUzunOtirish: number;
  jamiPauza: number; ortachaUyqu: number; toldirilganKun: number;
}

export default function ProfilPage() {
  const { t } = useT();
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
          <h1 className="text-2xl font-bold">{t("profil.sarlavha")}</h1>
          <p className="yumshoq">{t("profil.tavsif")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ikkinchi !px-3" onClick={() => setOffset((o) => o - 1)}>{t("profil.otgan")}</button>
          <span className="min-w-[120px] text-center text-sm yumshoq">{oraliq.boshi} — {oraliq.oxiri}</span>
          <button className="btn-ikkinchi !px-3" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0}>{t("profil.keyingi")}</button>
        </div>
      </div>

      {yuk || !xulosa ? (
        <div className="yumshoq">{t("common.yuklanmoqda")}</div>
      ) : xulosa.toldirilganKun === 0 ? (
        <div className="karta p-8 text-center">
          <p className="yumshoq">{t("profil.malumotYoq")}</p>
          <Link href="/kundalik" className="btn-asosiy mt-4">{t("dash.kundalikTugma")}</Link>
        </div>
      ) : (
        <>
          {/* Me'yorga nisbatan indikatorlar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Indikator
              sarlavha={t("profil.ortachaQadam")}
              qiymat={son(xulosa.ortachaQadam)}
              foiz={foiz(xulosa.ortachaQadam, NORMS.QADAM_KUNLIK)}
              holat={qadamHolati(xulosa.ortachaQadam)}
            />
            <Indikator
              sarlavha={t("profil.haftalikFaol")}
              qiymat={`${xulosa.jamiFaolDaqiqa} ${t("unit.daq")}`}
              foiz={foiz(xulosa.jamiFaolDaqiqa, NORMS.FAOL_DAQIQA_HAFTALIK_MIN)}
              holat={faolDaqiqaHolati(xulosa.jamiFaolDaqiqa)}
            />
            <Indikator
              sarlavha={t("profil.engUzun")}
              qiymat={`${xulosa.engUzunOtirish} ${t("unit.daq")}`}
              foiz={Math.min(100, foiz(xulosa.engUzunOtirish, NORMS.OTIRISH_CHEGARA))}
              holat={otirishHolati(xulosa.engUzunOtirish)}
              teskari
            />
          </div>

          {/* Qadamlar dinamikasi */}
          <div className="karta p-5">
            <h2 className="font-bold">{t("profil.qadamDinamika")}</h2>
            <p className="text-sm yumshoq">{t("profil.qadamDinamikaTavsif")}</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kunlik} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
                  <XAxis dataKey="kun" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} />
                  <Tooltip content={<TipQadam />} cursor={{ fill: "var(--chegara)", opacity: 0.3 }} />
                  <ReferenceLine y={NORMS.QADAM_KUNLIK} stroke="#16a34a" strokeDasharray="5 5" label={{ value: t("chart.meyor"), position: "right", fontSize: 10, fill: "#16a34a" }} />
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
              <h2 className="font-bold">{t("profil.faolDaqiqa")}</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kunlik} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
                    <XAxis dataKey="kun" tick={tick} axisLine={false} tickLine={false} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ stroke: "var(--chegara)" }} contentStyle={tipStyle} />
                    <Line type="monotone" dataKey="faolDaqiqa" name={t("chart.faolDaq")} stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Uzluksiz o'tirish */}
            <div className="karta p-5">
              <h2 className="font-bold">{t("profil.otirishSarlavha")}</h2>
              <p className="text-sm yumshoq">{t("profil.otirishTavsif")}</p>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kunlik} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
                    <XAxis dataKey="kun" tick={tick} axisLine={false} tickLine={false} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "var(--chegara)", opacity: 0.3 }} contentStyle={tipStyle} />
                    <ReferenceLine y={NORMS.OTIRISH_CHEGARA} stroke="#dc2626" strokeDasharray="5 5" label={{ value: "60 daq.", position: "right", fontSize: 10, fill: "#dc2626" }} />
                    <Bar dataKey="engUzunOtirish" name={t("chart.otirish")} radius={[6, 6, 0, 0]}>
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
  const { t } = useT();
  if (!active || !payload?.length) return null;
  const k = payload[0].payload;
  return (
    <div style={tipStyle} className="p-2">
      <div className="font-semibold">{k.kun}</div>
      <div>{son(k.qadam)} {t("profil.qadamBirlik")}</div>
      {!k.bor && <div className="text-xs yumshoq">{t("profil.malumotYoqTip")}</div>}
    </div>
  );
}

function Indikator({ sarlavha, qiymat, foiz, holat, teskari }: {
  sarlavha: string; qiymat: string; foiz: number; holat: "ok" | "warn" | "bad"; teskari?: boolean;
}) {
  const { t } = useT();
  const r = HOLAT_RANG[holat];
  return (
    <div className={`karta border-l-4 p-5 ${r.border}`}>
      <div className="text-sm yumshoq">{sarlavha}</div>
      <div className={`mt-1 text-2xl font-extrabold ${r.text}`}>{qiymat}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--chegara)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, foiz)}%`, backgroundColor: r.hex }} />
      </div>
      <div className={`mt-1 text-xs ${r.text}`}>
        {t("profil.meyorNisbatan", { foiz })}{teskari ? t("profil.kamMaqul") : ""}
      </div>
    </div>
  );
}

// 4.3 — hafta yakunidagi majburiy tahlil savollari
function HaftalikTahlil({ offset }: { offset: number }) {
  const { t } = useT();
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
    ["engFaolKun", t("tahlil.q1")],
    ["engPastKun", t("tahlil.q2")],
    ["uzunOtirishVaqt", t("tahlil.q3")],
    ["keyingiMaqsad", t("tahlil.q4")],
  ];

  return (
    <div className="karta border-l-4 border-l-brand-500 p-5">
      <h2 className="font-bold">{t("tahlil.sarlavha")}</h2>
      <p className="text-sm yumshoq">{t("tahlil.tavsif")}</p>
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
        {saqlandi && <span className="text-sm text-ok">✓ {t("common.saqlandi")}</span>}
        <Link href="/maqsad" className="btn-ikkinchi ml-auto">{t("tahlil.maqsadga")}</Link>
        <button onClick={saqla} disabled={saqlash} className="btn-asosiy">
          {saqlash ? t("common.saqlanmoqda") : t("tahlil.saqla")}
        </button>
      </div>
    </div>
  );
}
