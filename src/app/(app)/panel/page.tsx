"use client";

import { useEffect, useState } from "react";
import { KARTOCHKA_TURLARI } from "@/lib/constants";
import { KUN_TOLIQ } from "@/lib/utils";

interface CardMini { id: string; raqam: number; nomi: string; turi: string; davomiylik: string }
interface Reja {
  id: string; nomi: string; kun: string; boshlanish: string; tugash: string;
  guruhNomi: string | null; pauzaIzoh: string | null; cardIds: string[]; cards: CardMini[];
}
interface Kuzatuv {
  id: string; pauzaTuri: string | null; otkazildi: boolean; ishtirokDarajasi: string | null;
  izoh: string | null; createdAt: string; lessonPlan: { nomi: string; kun: string } | null;
}

export default function PanelPage() {
  const [rejalar, setRejalar] = useState<Reja[]>([]);
  const [cards, setCards] = useState<CardMini[]>([]);
  const [kuzatuvlar, setKuzatuvlar] = useState<Kuzatuv[]>([]);
  const [yuk, setYuk] = useState(true);
  const [rejaForma, setRejaForma] = useState(false);

  async function load() {
    const [r, k] = await Promise.all([
      (await fetch("/api/panel/reja")).json(),
      (await fetch("/api/panel/kuzatuv")).json(),
    ]);
    setRejalar(r.rejalar ?? []);
    setCards(r.cards ?? []);
    setKuzatuvlar(k.kartalar ?? []);
    setYuk(false);
  }
  useEffect(() => { load(); }, []);

  async function rejaOchir(id: string) {
    await fetch(`/api/panel/reja?id=${id}`, { method: "DELETE" });
    load();
  }

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold">O'qituvchi paneli</h1>
        <p className="yumshoq">Mashg'ulotga mikrofaollik pauzalarini rejalashtirish va kuzatish</p>
      </div>

      {/* Mashg'ulot rejalari */}
      <div className="karta p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Mashg'ulot rejalari va pauzalar</h2>
          <button className="btn-asosiy" onClick={() => setRejaForma(true)}>+ Yangi reja</button>
        </div>
        {rejalar.length === 0 ? (
          <p className="mt-3 text-sm yumshoq">Hali reja yo'q. Mashg'ulot yarating va unga kartochka biriktiring.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {rejalar.map((r) => (
              <div key={r.id} className="rounded-xl border p-3" style={{ borderColor: "var(--chegara)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold">{r.nomi}</span>
                    <span className="ml-2 text-sm yumshoq">{r.kun} · {r.boshlanish}–{r.tugash}{r.guruhNomi ? ` · ${r.guruhNomi}` : ""}</span>
                  </div>
                  <button onClick={() => rejaOchir(r.id)} className="btn-ikkinchi !px-2.5 !py-1.5 text-bad">O'chirish</button>
                </div>
                {r.cards.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.cards.map((c) => (
                      <span key={c.id} className="rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                        №{c.raqam} {c.nomi}
                      </span>
                    ))}
                  </div>
                )}
                {r.pauzaIzoh && <p className="mt-2 text-sm yumshoq">📌 {r.pauzaIzoh}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kuzatuv kartasi */}
      <KuzatuvBolim rejalar={rejalar} kuzatuvlar={kuzatuvlar} onSaqlandi={load} />

      {/* Uslubiy tavsiyalar */}
      <div className="karta p-5">
        <h2 className="font-bold">Uslubiy tavsiyalar</h2>
        <ul className="mt-3 space-y-2 text-sm yumshoq">
          <li>• Mikrofaollik pauzasini mashg'ulotning har 45–50 daqiqasida rejalashtiring.</li>
          <li>• Pauza mavzuga bog'liq bo'lsa (kognitiv-faollashtiruvchi), o'quv samarasi ortadi.</li>
          <li>• Sog'liq cheklovi bo'lgan talabalar uchun har kartochkaning moslashtirilgan variantidan foydalaning — hech kimni ajratmang.</li>
          <li>• Pauza — jazolash yoki tartib vositasi emas; ijobiy, ixtiyoriy muhit yarating.</li>
          <li>• Kuzatuv kartasini muntazam to'ldirish keyingi tahlil uchun asos beradi.</li>
        </ul>
      </div>

      {rejaForma && <RejaForma cards={cards} onClose={() => setRejaForma(false)} onSaqlandi={() => { setRejaForma(false); load(); }} />}
    </div>
  );
}

function RejaForma({ cards, onClose, onSaqlandi }: { cards: CardMini[]; onClose: () => void; onSaqlandi: () => void }) {
  const [f, setF] = useState({ nomi: "", kun: KUN_TOLIQ[0], boshlanish: "08:30", tugash: "09:50", guruhNomi: "", pauzaIzoh: "" });
  const [tanlangan, setTanlangan] = useState<string[]>([]);
  const [saqlash, setSaqlash] = useState(false);
  const [xato, setXato] = useState("");

  function toggle(id: string) {
    setTanlangan((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function saqla() {
    if (!f.nomi.trim()) { setXato("Mashg'ulot nomini kiriting"); return; }
    setSaqlash(true);
    const res = await fetch("/api/panel/reja", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, cardIds: tanlangan }),
    });
    setSaqlash(false);
    if (res.ok) onSaqlandi(); else setXato("Xatolik");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl" style={{ backgroundColor: "var(--sirt)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b p-4" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
          <h3 className="font-bold">Yangi mashg'ulot rejasi</h3>
          <button onClick={onClose} className="btn-ikkinchi !px-2.5 !py-1.5">✕</button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="yorliq">Mashg'ulot nomi</label>
            <input className="input" value={f.nomi} onChange={(e) => setF({ ...f, nomi: e.target.value })} placeholder="Pedagogika" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="yorliq">Kun</label>
              <select className="input" value={f.kun} onChange={(e) => setF({ ...f, kun: e.target.value })}>
                {KUN_TOLIQ.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="yorliq">Boshlanish</label>
              <input className="input" type="time" value={f.boshlanish} onChange={(e) => setF({ ...f, boshlanish: e.target.value })} />
            </div>
            <div>
              <label className="yorliq">Tugash</label>
              <input className="input" type="time" value={f.tugash} onChange={(e) => setF({ ...f, tugash: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="yorliq">Guruh (ixtiyoriy)</label>
            <input className="input" value={f.guruhNomi} onChange={(e) => setF({ ...f, guruhNomi: e.target.value })} placeholder="PT-21-01" />
          </div>
          <div>
            <label className="yorliq">Kartochka biriktirish ({tanlangan.length} ta tanlandi)</label>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border p-2" style={{ borderColor: "var(--chegara)" }}>
              {cards.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                  <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={tanlangan.includes(c.id)} onChange={() => toggle(c.id)} />
                  <span>№{c.raqam} {c.nomi}</span>
                  <span className="ml-auto text-xs yumshoq">{KARTOCHKA_TURLARI[c.turi as keyof typeof KARTOCHKA_TURLARI]?.nomi}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="yorliq">Pauza rejasi izohi (ixtiyoriy)</label>
            <textarea className="input resize-none" rows={2} value={f.pauzaIzoh} onChange={(e) => setF({ ...f, pauzaIzoh: e.target.value })} placeholder="Masalan: 25-daqiqada ko'z gimnastikasi" />
          </div>
          {xato && <div className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn-ikkinchi">Bekor</button>
            <button onClick={saqla} disabled={saqlash} className="btn-asosiy">{saqlash ? "..." : "Saqlash"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KuzatuvBolim({ rejalar, kuzatuvlar, onSaqlandi }: { rejalar: Reja[]; kuzatuvlar: Kuzatuv[]; onSaqlandi: () => void }) {
  const [f, setF] = useState({ lessonPlanId: "", pauzaTuri: "", otkazildi: true, ishtirokDarajasi: "yuqori", izoh: "" });
  const [saqlash, setSaqlash] = useState(false);

  async function saqla() {
    setSaqlash(true);
    const res = await fetch("/api/panel/kuzatuv", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, lessonPlanId: f.lessonPlanId || null }),
    });
    setSaqlash(false);
    if (res.ok) { setF({ lessonPlanId: "", pauzaTuri: "", otkazildi: true, ishtirokDarajasi: "yuqori", izoh: "" }); onSaqlandi(); }
  }

  return (
    <div className="karta p-5">
      <h2 className="font-bold">Kuzatuv kartasi</h2>
      <p className="text-sm yumshoq">Mashg'ulotdagi pauzani qayd eting</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="yorliq">Mashg'ulot (ixtiyoriy)</label>
          <select className="input" value={f.lessonPlanId} onChange={(e) => setF({ ...f, lessonPlanId: e.target.value })}>
            <option value="">—</option>
            {rejalar.map((r) => <option key={r.id} value={r.id}>{r.nomi} ({r.kun})</option>)}
          </select>
        </div>
        <div>
          <label className="yorliq">Pauza turi</label>
          <select className="input" value={f.pauzaTuri} onChange={(e) => setF({ ...f, pauzaTuri: e.target.value })}>
            <option value="">—</option>
            {Object.entries(KARTOCHKA_TURLARI).map(([k, v]) => <option key={k} value={k}>{v.nomi}</option>)}
          </select>
        </div>
        <div>
          <label className="yorliq">Pauza o'tkazildimi?</label>
          <select className="input" value={f.otkazildi ? "ha" : "yoq"} onChange={(e) => setF({ ...f, otkazildi: e.target.value === "ha" })}>
            <option value="ha">Ha, o'tkazildi</option>
            <option value="yoq">Yo'q, o'tkazilmadi</option>
          </select>
        </div>
        <div>
          <label className="yorliq">Ishtirok darajasi</label>
          <select className="input" value={f.ishtirokDarajasi} onChange={(e) => setF({ ...f, ishtirokDarajasi: e.target.value })}>
            <option value="yuqori">Yuqori</option>
            <option value="orta">O'rta</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className="yorliq">Izoh</label>
        <textarea className="input resize-none" rows={2} value={f.izoh} onChange={(e) => setF({ ...f, izoh: e.target.value })} />
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={saqla} disabled={saqlash} className="btn-asosiy">{saqlash ? "..." : "Kuzatuvni qayd etish"}</button>
      </div>

      {kuzatuvlar.length > 0 && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--chegara)" }}>
          <h3 className="text-sm font-semibold">So'nggi kuzatuvlar</h3>
          <div className="mt-2 space-y-2">
            {kuzatuvlar.slice(0, 6).map((k) => (
              <div key={k.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm" style={{ borderColor: "var(--chegara)" }}>
                <span className={k.otkazildi ? "text-ok" : "text-bad"}>{k.otkazildi ? "✓ o'tkazildi" : "✕ o'tkazilmadi"}</span>
                {k.lessonPlan && <span className="yumshoq">· {k.lessonPlan.nomi}</span>}
                {k.pauzaTuri && <span className="yumshoq">· {KARTOCHKA_TURLARI[k.pauzaTuri as keyof typeof KARTOCHKA_TURLARI]?.nomi}</span>}
                {k.ishtirokDarajasi && <span className="ml-auto rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">ishtirok: {k.ishtirokDarajasi}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
