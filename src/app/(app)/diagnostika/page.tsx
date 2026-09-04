"use client";

import { useCallback, useEffect, useState } from "react";
import { ANKETA, LIKERT } from "@/lib/anketa";

const NUQTALAR: { kod: string; nomi: string }[] = [
  { kod: "kirish", nomi: "Kirish" },
  { kod: "oraliq", nomi: "Oraliq (semestr o'rtasi)" },
  { kod: "yakuniy", nomi: "Yakuniy" },
];
type Tab = "anketa" | "test" | "esse";

export default function DiagnostikaPage() {
  const [nuqta, setNuqta] = useState("kirish");
  const [tab, setTab] = useState<Tab>("anketa");

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold">Diagnostika</h1>
        <p className="yumshoq">Uch nuqtada: kirish → oraliq → yakuniy</p>
      </div>

      {/* Nuqta tanlash */}
      <div className="flex flex-wrap gap-2">
        {NUQTALAR.map((n) => (
          <button key={n.kod} onClick={() => setNuqta(n.kod)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${nuqta === n.kod ? "bg-brand-600 text-white" : "border"}`}
            style={nuqta !== n.kod ? { borderColor: "var(--chegara)" } : {}}>
            {n.nomi}
          </button>
        ))}
      </div>

      {/* Tablar */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--chegara)" }}>
        {([["anketa", "Anketa"], ["test", "Bilim testi"], ["esse", "Refleksiv esse"]] as [Tab, string][]).map(([k, n]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${tab === k ? "border-brand-600 text-brand-600" : "border-transparent yumshoq"}`}>
            {n}
          </button>
        ))}
      </div>

      {tab === "anketa" && <Anketa nuqta={nuqta} />}
      {tab === "test" && <BilimTest nuqta={nuqta} />}
      {tab === "esse" && <Esse nuqta={nuqta} />}
    </div>
  );
}

function Anketa({ nuqta }: { nuqta: string }) {
  const [javoblar, setJavoblar] = useState<Record<string, number | string>>({});
  const [saqlandi, setSaqlandi] = useState(false);
  const [saqlash, setSaqlash] = useState(false);

  const load = useCallback(async () => {
    const d = await (await fetch(`/api/diagnostika/anketa?nuqta=${nuqta}`)).json();
    setJavoblar(d.javoblar ?? {});
    setSaqlandi(false);
  }, [nuqta]);
  useEffect(() => { load(); }, [load]);

  async function saqla() {
    setSaqlash(true);
    const res = await fetch("/api/diagnostika/anketa", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuqta, javoblar }),
    });
    setSaqlash(false);
    if (res.ok) setSaqlandi(true);
  }

  return (
    <div className="space-y-4">
      <div className="karta border-l-4 border-l-brand-500 p-3 text-sm yumshoq">
        🔒 Anketa anonim tahlil uchun. Munosabat qismidagi javoblar motivatsion-qadriyatli mezonga asos bo'ladi.
      </div>
      {ANKETA.map((qism) => (
        <div key={qism.nomi} className="karta p-5">
          <h3 className="font-bold">{qism.nomi}</h3>
          <div className="mt-3 space-y-4">
            {qism.savollar.map((s) => (
              <div key={s.id}>
                <div className="text-sm font-medium">{s.savol}</div>
                {s.tur === "likert" ? (
                  <div className="mt-2 grid grid-cols-5 gap-1">
                    {LIKERT.map((l, i) => (
                      <button key={i} onClick={() => { setJavoblar((x) => ({ ...x, [s.id]: i + 1 })); setSaqlandi(false); }}
                        className={`rounded-lg border p-2 text-center text-xs transition ${javoblar[s.id] === i + 1 ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : ""}`}
                        style={javoblar[s.id] !== i + 1 ? { borderColor: "var(--chegara)" } : {}} title={l}>
                        <div className="text-base font-bold">{i + 1}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.variantlar!.map((v) => (
                      <button key={v} onClick={() => { setJavoblar((x) => ({ ...x, [s.id]: v })); setSaqlandi(false); }}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${javoblar[s.id] === v ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : ""}`}
                        style={javoblar[s.id] !== v ? { borderColor: "var(--chegara)" } : {}}>
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-3">
        {saqlandi && <span className="text-sm text-ok">✓ Saqlandi</span>}
        <button onClick={saqla} disabled={saqlash} className="btn-asosiy">{saqlash ? "..." : "Anketani saqlash"}</button>
      </div>
    </div>
  );
}

function BilimTest({ nuqta }: { nuqta: string }) {
  const [savollar, setSavollar] = useState<{ i: number; savol: string; variantlar: string[] }[]>([]);
  const [jamiBall, setJamiBall] = useState(100);
  const [javob, setJavob] = useState<Record<number, number>>({});
  const [natija, setNatija] = useState<{ ball: number; max: number; togri: number; jami: number; belgilar: boolean[] } | null>(null);
  const [yuk, setYuk] = useState(true);
  const [yubor, setYubor] = useState(false);

  const load = useCallback(async () => {
    setYuk(true); setNatija(null); setJavob({});
    const d = await (await fetch(`/api/diagnostika/test?nuqta=${nuqta}`)).json();
    setSavollar(d.savollar ?? []); setJamiBall(d.jamiBall ?? 100);
    if (d.natija) setNatija({ ball: d.natija.ball, max: d.natija.max, togri: d.natija.ball / 4, jami: (d.savollar ?? []).length, belgilar: [] });
    setYuk(false);
  }, [nuqta]);
  useEffect(() => { load(); }, [load]);

  async function yubora() {
    setYubor(true);
    const javoblar = savollar.map((s) => (javob[s.i] ?? -1));
    const d = await (await fetch("/api/diagnostika/test", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuqta, javoblar }),
    })).json();
    setYubor(false);
    if (d.ok) setNatija({ ball: d.ball, max: d.max, togri: d.togri, jami: d.jami, belgilar: d.natijaBelgilar });
  }

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="space-y-4">
      <div className="karta border-l-4 border-l-brand-500 p-3 text-sm yumshoq">
        Bilim testi: {savollar.length} topshiriq × 4 ball = {jamiBall} ball. Avtomatik tekshiriladi (javob kalitlari serverda).
      </div>

      {natija && (
        <div className="karta p-5 text-center">
          <div className="text-sm yumshoq">Natija</div>
          <div className={`text-4xl font-extrabold ${natija.ball >= 71 ? "text-ok" : natija.ball >= 55 ? "text-warn" : "text-bad"}`}>
            {natija.ball} / {natija.max}
          </div>
          <div className="mt-1 text-sm yumshoq">{natija.togri} / {natija.jami} to'g'ri javob</div>
          <button onClick={load} className="btn-ikkinchi mt-3">Qayta ishlash</button>
        </div>
      )}

      {!natija && (
        <>
          <div className="space-y-4">
            {savollar.map((s) => (
              <div key={s.i} className="karta p-4">
                <div className="font-medium">{s.i + 1}. {s.savol}</div>
                <div className="mt-2 space-y-1.5">
                  {s.variantlar.map((v, j) => (
                    <button key={j} onClick={() => setJavob((x) => ({ ...x, [s.i]: j }))}
                      className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm transition ${javob[s.i] === j ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : ""}`}
                      style={javob[s.i] !== j ? { borderColor: "var(--chegara)" } : {}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm yumshoq">{Object.keys(javob).length} / {savollar.length} javob berildi</span>
            <button onClick={yubora} disabled={yubor} className="btn-asosiy">{yubor ? "Tekshirilmoqda..." : "Testni yakunlash"}</button>
          </div>
        </>
      )}
    </div>
  );
}

function Esse({ nuqta }: { nuqta: string }) {
  const [matn, setMatn] = useState("");
  const [saqlandi, setSaqlandi] = useState(false);
  const [saqlash, setSaqlash] = useState(false);

  const load = useCallback(async () => {
    const d = await (await fetch(`/api/diagnostika/esse?nuqta=${nuqta}`)).json();
    setMatn(d.esse?.matn ?? ""); setSaqlandi(false);
  }, [nuqta]);
  useEffect(() => { load(); }, [load]);

  async function saqla() {
    setSaqlash(true);
    const res = await fetch("/api/diagnostika/esse", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuqta, matn }),
    });
    setSaqlash(false);
    if (res.ok) setSaqlandi(true);
  }

  return (
    <div className="karta p-5">
      <h3 className="font-bold">Refleksiv esse</h3>
      <p className="mt-1 text-sm yumshoq">Baholash mezonlari: fikr chuqurligi, sabab-natija tahlili, o'z-o'zini baholash, keyingi qadam aniqligi.</p>
      <ul className="mt-2 list-inside list-disc text-sm yumshoq">
        <li>Semestr davomida harakat rejimingiz qanday o'zgardi?</li>
        <li>Qaysi bo'g'in (monitoring/pauza/refleksiya) sizga eng ko'p yordam berdi?</li>
        <li>Kelajakda o'quvchilaringiz uchun buni qanday qo'llaysiz?</li>
      </ul>
      <textarea className="input mt-3 resize-none" rows={8} placeholder="Esseingizni yozing..." value={matn} onChange={(e) => { setMatn(e.target.value); setSaqlandi(false); }} />
      <div className="mt-3 flex items-center justify-end gap-3">
        {saqlandi && <span className="text-sm text-ok">✓ Saqlandi</span>}
        <button onClick={saqla} disabled={saqlash || !matn.trim()} className="btn-asosiy">{saqlash ? "..." : "Esseni saqlash"}</button>
      </div>
    </div>
  );
}
