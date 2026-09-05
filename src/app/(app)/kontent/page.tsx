"use client";

import { useEffect, useState } from "react";
import { KARTOCHKA_TURLARI, JOY_TURLARI } from "@/lib/constants";
import { youtubeEmbed } from "@/lib/utils";

type Tab = "kartochka" | "mavzu";

export default function KontentPage() {
  const [tab, setTab] = useState<Tab>("kartochka");
  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold">Kontent boshqaruvi</h1>
        <p className="yumshoq">Kartochkalar va o'quv mavzularini tahrirlash (video, test, topshiriq)</p>
      </div>
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--chegara)" }}>
        {([["kartochka", "Kartochkalar"], ["mavzu", "Mavzular"]] as [Tab, string][]).map(([k, n]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${tab === k ? "border-brand-600 text-brand-600" : "border-transparent yumshoq"}`}>
            {n}
          </button>
        ))}
      </div>
      {tab === "kartochka" ? <Kartochkalar /> : <Mavzular />}
    </div>
  );
}

/* ============ KARTOCHKALAR ============ */
interface Card {
  id?: string; raqam: number; nomi: string; turi: string; davomiylik: string;
  joyJihoz: string; joyTuri: string; algoritm: string[]; metodikEslatma: string;
  mosFanlar: string[]; moslashtirilganVariant: string | null;
}
const BOSH_CARD: Card = {
  raqam: 0, nomi: "", turi: "gigiyenik", davomiylik: "2–3 daq.", joyJihoz: "",
  joyTuri: "urindan_turmasdan", algoritm: [], metodikEslatma: "", mosFanlar: [], moslashtirilganVariant: "",
};

function Kartochkalar() {
  const [cards, setCards] = useState<Card[]>([]);
  const [tahrir, setTahrir] = useState<Card | null>(null);
  const [yuk, setYuk] = useState(true);

  async function load() {
    const d = await (await fetch("/api/admin/kartochkalar")).json();
    setCards(d.cards ?? []); setYuk(false);
  }
  useEffect(() => { load(); }, []);

  async function ochir(id: string) {
    if (!confirm("Kartochka o'chirilsinmi?")) return;
    await fetch(`/api/admin/kartochkalar?id=${id}`, { method: "DELETE" });
    load();
  }

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button className="btn-asosiy" onClick={() => setTahrir({ ...BOSH_CARD, raqam: Math.max(0, ...cards.map((c) => c.raqam)) + 1 })}>+ Yangi kartochka</button>
      </div>
      {cards.map((c) => (
        <div key={c.id} className="karta flex items-center gap-3 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{c.raqam}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{c.nomi}</div>
            <div className="text-xs yumshoq">{KARTOCHKA_TURLARI[c.turi as keyof typeof KARTOCHKA_TURLARI]?.nomi} · {c.davomiylik}</div>
          </div>
          <button onClick={() => setTahrir(c)} className="btn-ikkinchi !px-3 !py-1.5 text-sm">Tahrir</button>
          <button onClick={() => c.id && ochir(c.id)} className="btn-ikkinchi !px-3 !py-1.5 text-sm text-bad">O'chir</button>
        </div>
      ))}
      {tahrir && <CardEditor card={tahrir} onClose={() => setTahrir(null)} onSaqlandi={() => { setTahrir(null); load(); }} />}
    </div>
  );
}

function CardEditor({ card, onClose, onSaqlandi }: { card: Card; onClose: () => void; onSaqlandi: () => void }) {
  const [f, setF] = useState<Card>(card);
  const [algoritmMatn, setAlgoritmMatn] = useState(card.algoritm.join("\n"));
  const [fanMatn, setFanMatn] = useState(card.mosFanlar.join(", "));
  const [xato, setXato] = useState("");
  const [saqlash, setSaqlash] = useState(false);

  async function saqla() {
    setSaqlash(true); setXato("");
    const body = {
      ...f,
      algoritm: algoritmMatn.split("\n").map((s) => s.trim()).filter(Boolean),
      mosFanlar: fanMatn.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch("/api/admin/kartochkalar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    setSaqlash(false);
    if (!res.ok) { setXato(d.xato ?? "Xatolik"); return; }
    onSaqlandi();
  }

  return (
    <Modal sarlavha={card.id ? "Kartochkani tahrirlash" : "Yangi kartochka"} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Raqam"><input type="number" className="input" value={f.raqam} onChange={(e) => setF({ ...f, raqam: Number(e.target.value) })} /></Field>
        <div className="col-span-2"><Field label="Davomiylik"><input className="input" value={f.davomiylik} onChange={(e) => setF({ ...f, davomiylik: e.target.value })} /></Field></div>
      </div>
      <Field label="Nomi"><input className="input" value={f.nomi} onChange={(e) => setF({ ...f, nomi: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Turi">
          <select className="input" value={f.turi} onChange={(e) => setF({ ...f, turi: e.target.value })}>
            {Object.entries(KARTOCHKA_TURLARI).map(([k, v]) => <option key={k} value={k}>{v.nomi}</option>)}
          </select>
        </Field>
        <Field label="Joy turi">
          <select className="input" value={f.joyTuri} onChange={(e) => setF({ ...f, joyTuri: e.target.value })}>
            {Object.entries(JOY_TURLARI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Joy va jihoz"><input className="input" value={f.joyJihoz} onChange={(e) => setF({ ...f, joyJihoz: e.target.value })} /></Field>
      <Field label="Algoritm (har qator — bitta qadam)"><textarea className="input resize-none" rows={4} value={algoritmMatn} onChange={(e) => setAlgoritmMatn(e.target.value)} /></Field>
      <Field label="Metodik eslatma"><textarea className="input resize-none" rows={2} value={f.metodikEslatma} onChange={(e) => setF({ ...f, metodikEslatma: e.target.value })} /></Field>
      <Field label="Mos fanlar (vergul bilan)"><input className="input" value={fanMatn} onChange={(e) => setFanMatn(e.target.value)} /></Field>
      <Field label="Moslashtirilgan variant (sog'liq cheklovi)"><textarea className="input resize-none" rows={2} value={f.moslashtirilganVariant ?? ""} onChange={(e) => setF({ ...f, moslashtirilganVariant: e.target.value })} /></Field>
      {xato && <div className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
      <ModalTugma saqlash={saqlash} onClose={onClose} onSaqla={saqla} />
    </Modal>
  );
}

/* ============ MAVZULAR ============ */
interface SelfCheck { savol: string; variantlar: string[]; togri: number }
interface MediaItem { turi: "rasm" | "video" | "havola"; url: string; izoh?: string }
interface Kontent { video: string; taqdimot: string; media: MediaItem[]; kartochkaRaqamlar: number[]; selfCheck: SelfCheck[]; topshiriq: string }
interface Topic { id: string; tartib: number; nomi: string; maruzaSoat: number; amaliySoat: number; mustaqilSoat: number; kontent: Kontent }

function Mavzular() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tahrir, setTahrir] = useState<Topic | null>(null);
  const [yuk, setYuk] = useState(true);

  async function load() {
    const d = await (await fetch("/api/admin/mavzular")).json();
    setTopics(d.topics ?? []); setYuk(false);
  }
  useEffect(() => { load(); }, []);
  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="space-y-3">
      {topics.map((t) => (
        <div key={t.id} className="karta flex items-center gap-3 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{t.tartib}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{t.nomi}</div>
            <div className="text-xs yumshoq">{t.kontent.video ? "🎬 video bor" : "video yo'q"} · {t.kontent.selfCheck?.length ?? 0} test savoli</div>
          </div>
          <button onClick={() => setTahrir(t)} className="btn-ikkinchi !px-3 !py-1.5 text-sm">Tahrir</button>
        </div>
      ))}
      {tahrir && <TopicEditor topic={tahrir} onClose={() => setTahrir(null)} onSaqlandi={() => { setTahrir(null); load(); }} />}
    </div>
  );
}

function TopicEditor({ topic, onClose, onSaqlandi }: { topic: Topic; onClose: () => void; onSaqlandi: () => void }) {
  const [f, setF] = useState(topic);
  const [k, setK] = useState<Kontent>({
    video: topic.kontent.video ?? "",
    taqdimot: topic.kontent.taqdimot ?? "",
    media: topic.kontent.media ?? [],
    kartochkaRaqamlar: topic.kontent.kartochkaRaqamlar ?? [],
    selfCheck: topic.kontent.selfCheck ?? [],
    topshiriq: topic.kontent.topshiriq ?? "",
  });
  const [raqamMatn, setRaqamMatn] = useState((topic.kontent.kartochkaRaqamlar ?? []).join(", "));
  const [saqlash, setSaqlash] = useState(false);
  const [xato, setXato] = useState("");

  function scSet(i: number, patch: Partial<SelfCheck>) {
    setK((x) => ({ ...x, selfCheck: x.selfCheck.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  }

  async function saqla() {
    setSaqlash(true); setXato("");
    const body = {
      id: f.id, nomi: f.nomi, maruzaSoat: f.maruzaSoat, amaliySoat: f.amaliySoat, mustaqilSoat: f.mustaqilSoat,
      video: k.video, taqdimot: k.taqdimot, media: k.media.filter((m) => m.url.trim()),
      kartochkaRaqamlar: raqamMatn.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0),
      selfCheck: k.selfCheck, topshiriq: k.topshiriq,
    };
    const res = await fetch("/api/admin/mavzular", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    setSaqlash(false);
    if (!res.ok) { setXato(d.xato ?? "Xatolik"); return; }
    onSaqlandi();
  }

  return (
    <Modal sarlavha={`${topic.tartib}-mavzu`} onClose={onClose}>
      <Field label="Mavzu nomi"><input className="input" value={f.nomi} onChange={(e) => setF({ ...f, nomi: e.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Ma'ruza soat"><input type="number" className="input" value={f.maruzaSoat} onChange={(e) => setF({ ...f, maruzaSoat: Number(e.target.value) })} /></Field>
        <Field label="Amaliy soat"><input type="number" className="input" value={f.amaliySoat} onChange={(e) => setF({ ...f, amaliySoat: Number(e.target.value) })} /></Field>
        <Field label="Mustaqil soat"><input type="number" className="input" value={f.mustaqilSoat} onChange={(e) => setF({ ...f, mustaqilSoat: Number(e.target.value) })} /></Field>
      </div>
      <Field label="🎬 Video-ma'ruza havolasi (YouTube)">
        <input className="input" placeholder="https://www.youtube.com/watch?v=..." value={k.video} onChange={(e) => setK({ ...k, video: e.target.value })} />
      </Field>
      {k.video && youtubeEmbed(k.video).includes("/embed/") && (
        <div className="aspect-video overflow-hidden rounded-xl">
          <iframe src={youtubeEmbed(k.video)} className="h-full w-full" allowFullScreen title="oldindan ko'rish" />
        </div>
      )}
      <Field label="Taqdimot havolasi"><input className="input" placeholder="https://..." value={k.taqdimot} onChange={(e) => setK({ ...k, taqdimot: e.target.value })} /></Field>

      {/* Rasmlar & Media */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium yumshoq">🖼️ Rasmlar & Media</span>
          <button className="btn-ikkinchi !px-2.5 !py-1 text-sm" onClick={() => setK((x) => ({ ...x, media: [...x.media, { turi: "rasm", url: "", izoh: "" }] }))}>+ Media</button>
        </div>
        <div className="space-y-2">
          {k.media.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border p-2" style={{ borderColor: "var(--chegara)" }}>
              <select className="input !w-28 !py-1.5" value={m.turi} onChange={(e) => setK((x) => ({ ...x, media: x.media.map((y, j) => (j === i ? { ...y, turi: e.target.value as MediaItem["turi"] } : y)) }))}>
                <option value="rasm">Rasm</option>
                <option value="video">Video</option>
                <option value="havola">Havola</option>
              </select>
              <div className="flex-1 space-y-1">
                <input className="input !py-1.5" placeholder="URL (https://...)" value={m.url} onChange={(e) => setK((x) => ({ ...x, media: x.media.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)) }))} />
                <input className="input !py-1.5" placeholder="Izoh (ixtiyoriy)" value={m.izoh ?? ""} onChange={(e) => setK((x) => ({ ...x, media: x.media.map((y, j) => (j === i ? { ...y, izoh: e.target.value } : y)) }))} />
              </div>
              <button onClick={() => setK((x) => ({ ...x, media: x.media.filter((_, j) => j !== i) }))} className="text-bad">✕</button>
            </div>
          ))}
          {k.media.length === 0 && <p className="text-xs yumshoq">Rasm, video yoki havola qo'shing.</p>}
        </div>
      </div>

      <Field label="Kartochka raqamlari (vergul bilan)"><input className="input" placeholder="1, 7, 10" value={raqamMatn} onChange={(e) => setRaqamMatn(e.target.value)} /></Field>
      <Field label="Amaliy topshiriq"><textarea className="input resize-none" rows={2} value={k.topshiriq} onChange={(e) => setK({ ...k, topshiriq: e.target.value })} /></Field>

      {/* Self-check savollari */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium yumshoq">O'z-o'zini tekshirish savollari</span>
          <button className="btn-ikkinchi !px-2.5 !py-1 text-sm" onClick={() => setK((x) => ({ ...x, selfCheck: [...x.selfCheck, { savol: "", variantlar: ["", ""], togri: 0 }] }))}>+ Savol</button>
        </div>
        <div className="space-y-3">
          {k.selfCheck.map((s, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ borderColor: "var(--chegara)" }}>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Savol" value={s.savol} onChange={(e) => scSet(i, { savol: e.target.value })} />
                <button onClick={() => setK((x) => ({ ...x, selfCheck: x.selfCheck.filter((_, j) => j !== i) }))} className="btn-ikkinchi !px-2.5 text-bad">✕</button>
              </div>
              <div className="mt-2 space-y-1">
                {s.variantlar.map((v, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input type="radio" name={`togri-${i}`} className="accent-brand-600" checked={s.togri === j} onChange={() => scSet(i, { togri: j })} title="To'g'ri javob" />
                    <input className="input flex-1 !py-1.5" placeholder={`Variant ${j + 1}`} value={v} onChange={(e) => scSet(i, { variantlar: s.variantlar.map((x, jj) => (jj === j ? e.target.value : x)) })} />
                    <button onClick={() => scSet(i, { variantlar: s.variantlar.filter((_, jj) => jj !== j) })} className="text-bad">✕</button>
                  </div>
                ))}
                <button onClick={() => scSet(i, { variantlar: [...s.variantlar, ""] })} className="text-sm text-brand-600">+ Variant</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {xato && <div className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
      <ModalTugma saqlash={saqlash} onClose={onClose} onSaqla={saqla} />
    </Modal>
  );
}

/* ============ Umumiy UI ============ */
function Modal({ sarlavha, onClose, children }: { sarlavha: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl" style={{ backgroundColor: "var(--sirt)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b p-4" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
          <h3 className="font-bold">{sarlavha}</h3>
          <button onClick={onClose} className="btn-ikkinchi !px-2.5 !py-1.5">✕</button>
        </div>
        <div className="space-y-3 p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="yorliq">{label}</label>{children}</div>;
}
function ModalTugma({ saqlash, onClose, onSaqla }: { saqlash: boolean; onClose: () => void; onSaqla: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button onClick={onClose} className="btn-ikkinchi">Bekor</button>
      <button onClick={onSaqla} disabled={saqlash} className="btn-asosiy">{saqlash ? "..." : "Saqlash"}</button>
    </div>
  );
}
