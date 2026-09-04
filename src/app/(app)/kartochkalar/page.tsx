"use client";

import { useEffect, useMemo, useState } from "react";
import { KARTOCHKA_TURLARI, JOY_TURLARI } from "@/lib/constants";

interface Card {
  id: string; raqam: number; nomi: string; turi: string; davomiylik: string;
  joyJihoz: string; joyTuri: string; algoritm: string[]; metodikEslatma: string;
  mosFanlar: string[]; moslashtirilganVariant: string | null; sevimli: boolean;
}

const TUR_RANG: Record<string, string> = {
  gigiyenik: "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200",
  kognitiv: "bg-ok/15 text-ok",
  kasbiy: "bg-warn/15 text-yellow-700 dark:text-yellow-400",
};

export default function KartochkalarPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [yuk, setYuk] = useState(true);
  const [tur, setTur] = useState<string>("");
  const [joy, setJoy] = useState<string>("");
  const [qidiruv, setQidiruv] = useState("");
  const [faqatSevimli, setFaqatSevimli] = useState(false);
  const [tanlangan, setTanlangan] = useState<Card | null>(null);

  async function load() {
    const d = await (await fetch("/api/kartochkalar")).json();
    setCards(d.cards);
    setYuk(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleSevimli(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    const res = await fetch("/api/sevimli", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: id }),
    });
    const d = await res.json();
    if (res.ok) {
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, sevimli: d.sevimli } : c)));
      setTanlangan((t) => (t && t.id === id ? { ...t, sevimli: d.sevimli } : t));
    }
  }

  const filtered = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    return cards.filter((c) => {
      if (tur && c.turi !== tur) return false;
      if (joy && c.joyTuri !== joy) return false;
      if (faqatSevimli && !c.sevimli) return false;
      if (q && !(c.nomi.toLowerCase().includes(q) || c.mosFanlar.some((f) => f.toLowerCase().includes(q)))) return false;
      return true;
    });
  }, [cards, tur, joy, qidiruv, faqatSevimli]);

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold">Faollik kartochkalari banki</h1>
        <p className="yumshoq">Mikrofaollik pauzalari uchun tayyor metodik kartochkalar</p>
      </div>

      {/* Filtrlar */}
      <div className="karta space-y-3 p-4">
        <input className="input" placeholder="🔍 Nomi yoki fan bo'yicha qidirish..." value={qidiruv} onChange={(e) => setQidiruv(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Chip faol={tur === ""} onClick={() => setTur("")}>Barcha turlar</Chip>
          {Object.entries(KARTOCHKA_TURLARI).map(([k, v]) => (
            <Chip key={k} faol={tur === k} onClick={() => setTur(k)}>{v.nomi}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip faol={joy === ""} onClick={() => setJoy("")}>Barcha joylar</Chip>
          {Object.entries(JOY_TURLARI).map(([k, v]) => (
            <Chip key={k} faol={joy === k} onClick={() => setJoy(k)}>{v}</Chip>
          ))}
          <Chip faol={faqatSevimli} onClick={() => setFaqatSevimli((s) => !s)}>⭐ Sevimlilar</Chip>
        </div>
      </div>

      <div className="text-sm yumshoq">{filtered.length} ta kartochka</div>

      {/* Kartochkalar to'ri */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => setTanlangan(c)} className="karta p-4 text-left transition hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TUR_RANG[c.turi]}`}>
                {KARTOCHKA_TURLARI[c.turi as keyof typeof KARTOCHKA_TURLARI]?.nomi}
              </span>
              <span onClick={(e) => toggleSevimli(c.id, e)} className="text-xl leading-none" role="button" aria-label="Sevimli">
                {c.sevimli ? "⭐" : "☆"}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">№{c.raqam}. {c.nomi}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs yumshoq">
              <span className="rounded-md border px-2 py-0.5" style={{ borderColor: "var(--chegara)" }}>⏱ {c.davomiylik}</span>
              <span className="rounded-md border px-2 py-0.5" style={{ borderColor: "var(--chegara)" }}>📍 {JOY_TURLARI[c.joyTuri as keyof typeof JOY_TURLARI]}</span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="karta p-8 text-center yumshoq">Filtrga mos kartochka topilmadi.</div>
      )}

      {tanlangan && <Detal card={tanlangan} onClose={() => setTanlangan(null)} onFav={() => toggleSevimli(tanlangan.id)} />}
    </div>
  );
}

function Chip({ faol, onClick, children }: { faol: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        faol ? "bg-brand-600 text-white" : "border"
      }`}
      style={!faol ? { borderColor: "var(--chegara)" } : {}}
    >
      {children}
    </button>
  );
}

function Detal({ card, onClose, onFav }: { card: Card; onClose: () => void; onFav: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl print:max-h-none print:overflow-visible"
        style={{ backgroundColor: "var(--sirt)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b p-4 print:hidden" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TUR_RANG[card.turi]}`}>
            {KARTOCHKA_TURLARI[card.turi as keyof typeof KARTOCHKA_TURLARI]?.nomi}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onFav} className="btn-ikkinchi !px-2.5 !py-1.5">{card.sevimli ? "⭐" : "☆"}</button>
            <button onClick={() => window.print()} className="btn-ikkinchi !px-2.5 !py-1.5" title="Chop etish">🖨️</button>
            <button onClick={onClose} className="btn-ikkinchi !px-2.5 !py-1.5">✕</button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <h2 className="text-xl font-bold">№{card.raqam}. {card.nomi}</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info yorliq="Davomiyligi" qiymat={card.davomiylik} />
            <Info yorliq="Joy va jihoz" qiymat={card.joyJihoz} />
          </div>

          <div>
            <h3 className="font-semibold">O'tkazish algoritmi</h3>
            <ol className="mt-2 space-y-2">
              {card.algoritm.map((qadam, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-sm">{qadam}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-900/20">
            <h3 className="text-sm font-semibold">📌 Metodik eslatma</h3>
            <p className="mt-1 text-sm yumshoq">{card.metodikEslatma}</p>
          </div>

          {card.moslashtirilganVariant && (
            <div className="rounded-xl border border-warn/40 bg-warn/10 p-3">
              <h3 className="text-sm font-semibold">♿ Moslashtirilgan variant (sog'liq cheklovi uchun)</h3>
              <p className="mt-1 text-sm yumshoq">{card.moslashtirilganVariant}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold">Mos fanlar</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {card.mosFanlar.map((f) => (
                <span key={f} className="rounded-md border px-2 py-0.5 text-xs" style={{ borderColor: "var(--chegara)" }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ yorliq, qiymat }: { yorliq: string; qiymat: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "var(--chegara)" }}>
      <div className="text-xs yumshoq">{yorliq}</div>
      <div className="mt-0.5 font-medium">{qiymat}</div>
    </div>
  );
}
