"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { son } from "@/lib/utils";

interface Kohort { talabaSoni: number; ortachaQadam: number; std: number; meyorErishgan: number; meyorErishmagan: number }
interface TNat { t: number; df: number; p: number; ahamiyatli: boolean }
interface ChiNat { chi2: number; df: number; p: number; ahamiyatli: boolean; kutilgan: number[][] }
interface Data {
  tajriba: Kohort; nazorat: Kohort;
  tMezoni: TNat | null; chiKvadrat: ChiNat | null;
  dinamika: { hafta: string; tajriba: number; nazorat: number }[];
}

export default function KafedraPage() {
  const [d, setD] = useState<Data | null>(null);
  const [yuk, setYuk] = useState(true);

  useEffect(() => {
    fetch("/api/kafedra").then((r) => r.json()).then((res) => { setD(res); setYuk(false); });
  }, []);

  function eksportCSV() {
    if (!d) return;
    const satrlar = [
      ["Ko'rsatkich", "Tajriba", "Nazorat"],
      ["Talaba soni", d.tajriba.talabaSoni, d.nazorat.talabaSoni],
      ["O'rtacha kunlik qadam", d.tajriba.ortachaQadam, d.nazorat.ortachaQadam],
      ["Standart chetlanish", d.tajriba.std, d.nazorat.std],
      ["Me'yorga erishgan", d.tajriba.meyorErishgan, d.nazorat.meyorErishgan],
      ["Me'yorga erishmagan", d.tajriba.meyorErishmagan, d.nazorat.meyorErishmagan],
      [],
      ["Styudent t-mezoni", d.tMezoni ? `t=${d.tMezoni.t}, df=${d.tMezoni.df}, p=${d.tMezoni.p}` : "—"],
      ["Pirson χ²", d.chiKvadrat ? `χ²=${d.chiKvadrat.chi2}, df=${d.chiKvadrat.df}, p=${d.chiKvadrat.p}` : "—"],
    ];
    const csv = "﻿" + satrlar.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "kafedra-statistika.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;
  if (!d) return <div className="karta p-8 text-center yumshoq">Ma'lumot yo'q.</div>;

  const taqqoslash = [
    { nomi: "Tajriba", qadam: d.tajriba.ortachaQadam, std: d.tajriba.std },
    { nomi: "Nazorat", qadam: d.nazorat.ortachaQadam, std: d.nazorat.std },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kafedra statistikasi</h1>
          <p className="yumshoq">Tajriba va nazorat guruhlarini taqqoslash</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={eksportCSV} className="btn-ikkinchi">⬇ Excel (CSV)</button>
          <button onClick={() => window.print()} className="btn-ikkinchi">🖨️ PDF</button>
        </div>
      </div>

      {/* Kohort ko'rsatkichlari */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KohortKarta nomi="Tajriba guruhi" k={d.tajriba} rang="brand" />
        <KohortKarta nomi="Nazorat guruhi" k={d.nazorat} rang="slate" />
      </div>

      {/* O'rtacha qadam taqqoslash */}
      <div className="karta p-5">
        <h2 className="font-bold">O'rtacha kunlik qadam (± std)</h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taqqoslash} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
              <XAxis dataKey="nomi" tick={{ fontSize: 12, fill: "var(--matn-yumshoq)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--matn-yumshoq)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--sirt)", border: "1px solid var(--chegara)", borderRadius: 12 }} />
              <Bar dataKey="qadam" name="O'rtacha qadam" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistik mezonlar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="karta p-5">
          <h2 className="font-bold">Styudent t-mezoni</h2>
          <p className="text-sm yumshoq">O'rtacha kunlik qadam bo'yicha</p>
          {d.tMezoni ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Stat nomi="t" qiymat={d.tMezoni.t} />
                <Stat nomi="df" qiymat={d.tMezoni.df} />
                <Stat nomi="p" qiymat={d.tMezoni.p} />
              </div>
              <div className={`mt-3 rounded-xl p-2 text-center text-sm ${d.tMezoni.ahamiyatli ? "bg-ok/10 text-ok" : "bg-warn/10 text-warn"}`}>
                {d.tMezoni.ahamiyatli ? "Farq statistik ahamiyatli (p < 0,05)" : "Farq statistik ahamiyatli emas (p ≥ 0,05)"}
              </div>
            </>
          ) : <p className="mt-3 text-sm yumshoq">Yetarli ma'lumot yo'q.</p>}
        </div>

        <div className="karta p-5">
          <h2 className="font-bold">Pirson χ²-mezoni</h2>
          <p className="text-sm yumshoq">Me'yorga erishish × guruh turi</p>
          {d.chiKvadrat ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Stat nomi="χ²" qiymat={d.chiKvadrat.chi2} />
                <Stat nomi="df" qiymat={d.chiKvadrat.df} />
                <Stat nomi="p" qiymat={d.chiKvadrat.p} />
              </div>
              <div className={`mt-3 rounded-xl p-2 text-center text-sm ${d.chiKvadrat.ahamiyatli ? "bg-ok/10 text-ok" : "bg-warn/10 text-warn"}`}>
                {d.chiKvadrat.ahamiyatli ? "Bog'liqlik ahamiyatli (p < 0,05)" : "Bog'liqlik ahamiyatli emas (p ≥ 0,05)"}
              </div>
            </>
          ) : <p className="mt-3 text-sm yumshoq">Yetarli ma'lumot yo'q.</p>}
        </div>
      </div>

      {/* Dinamika */}
      <div className="karta p-5">
        <h2 className="font-bold">Dinamika (oxirgi 4 hafta)</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.dinamika} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chegara)" vertical={false} />
              <XAxis dataKey="hafta" tick={{ fontSize: 12, fill: "var(--matn-yumshoq)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--matn-yumshoq)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--sirt)", border: "1px solid var(--chegara)", borderRadius: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="tajriba" name="Tajriba" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="nazorat" name="Nazorat" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KohortKarta({ nomi, k, rang }: { nomi: string; k: Kohort; rang: string }) {
  return (
    <div className={`karta border-l-4 p-5 ${rang === "brand" ? "border-l-brand-500" : "border-l-slate-400"}`}>
      <h2 className="font-bold">{nomi}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div><div className="yumshoq">Talaba soni</div><div className="text-lg font-bold">{k.talabaSoni}</div></div>
        <div><div className="yumshoq">O'rtacha qadam</div><div className="text-lg font-bold">{son(k.ortachaQadam)}</div></div>
        <div><div className="yumshoq">Standart chetlanish</div><div className="text-lg font-bold">{son(k.std)}</div></div>
        <div><div className="yumshoq">Me'yorga erishgan</div><div className="text-lg font-bold">{k.meyorErishgan} / {k.meyorErishgan + k.meyorErishmagan}</div></div>
      </div>
    </div>
  );
}

function Stat({ nomi, qiymat }: { nomi: string; qiymat: number }) {
  return (
    <div className="rounded-lg border p-2" style={{ borderColor: "var(--chegara)" }}>
      <div className="text-xs yumshoq">{nomi}</div>
      <div className="font-bold">{qiymat}</div>
    </div>
  );
}
