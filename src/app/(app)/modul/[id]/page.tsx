"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { KARTOCHKA_TURLARI, ROLLAR } from "@/lib/constants";
import { youtubeEmbed } from "@/lib/utils";

interface SelfCheck { savol: string; variantlar: string[]; togri: number }
interface Kontent { video: string; taqdimot: string; selfCheck: SelfCheck[]; topshiriq: string }
interface CardMini { id: string; raqam: number; nomi: string; turi: string; davomiylik: string }
interface ForumItem { id: string; matn: string; createdAt: string; user: { fio: string; role: string } }
interface Progress { korilgan: boolean; testBall: number; testMax: number; topshiriqMatn: string | null; topshiriqTopshirildi: boolean; bajarildi: boolean }
interface Topic { id: string; tartib: number; nomi: string; maruzaSoat: number; amaliySoat: number; mustaqilSoat: number; kontent: Kontent }

export default function MavzuPage() {
  const params = useParams();
  const id = params.id as string;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [cards, setCards] = useState<CardMini[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [forum, setForum] = useState<ForumItem[]>([]);
  const [yuk, setYuk] = useState(true);

  const load = useCallback(async () => {
    const d = await (await fetch(`/api/modul?id=${id}`)).json();
    setTopic(d.topic); setCards(d.cards ?? []); setProgress(d.progress); setForum(d.forum ?? []);
    setYuk(false);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function progressYangila(patch: Record<string, unknown>) {
    const d = await (await fetch("/api/modul", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: id, ...patch }),
    })).json();
    if (d.progress) setProgress(d.progress);
  }

  if (yuk || !topic) return <div className="yumshoq">Yuklanmoqda...</div>;
  const k = topic.kontent;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-6">
      <Link href="/modul" className="text-sm text-brand-600 hover:underline">← O'quv moduli</Link>
      <div>
        <div className="text-sm yumshoq">{topic.tartib}-mavzu</div>
        <h1 className="text-2xl font-bold">{topic.nomi}</h1>
        <p className="text-sm yumshoq">{topic.maruzaSoat} ma'ruza · {topic.amaliySoat} amaliy · {topic.mustaqilSoat} mustaqil soat</p>
      </div>

      {/* Video ma'ruza */}
      <div className="karta p-5">
        <h2 className="font-bold">📹 Video-ma'ruza</h2>
        <div className="mt-3 aspect-video overflow-hidden rounded-xl" style={{ backgroundColor: "var(--fon)" }}>
          {k.video ? (
            <iframe src={youtubeEmbed(k.video)} className="h-full w-full" allowFullScreen title="Video-ma'ruza" referrerPolicy="strict-origin-when-cross-origin" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center yumshoq">
              <span className="text-4xl">▶️</span>
              <span className="mt-2 text-sm">Video-ma'ruza shu yerga joylashtiriladi (embed)</span>
            </div>
          )}
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={progress?.korilgan ?? false} onChange={(e) => progressYangila({ korilgan: e.target.checked })} />
          Ma'ruzani ko'rib chiqdim
        </label>
      </div>

      {/* Taqdimot */}
      <div className="karta p-5">
        <h2 className="font-bold">📊 Taqdimot</h2>
        {k.taqdimot ? (
          <a href={k.taqdimot} target="_blank" rel="noreferrer" className="btn-ikkinchi mt-3">Taqdimotni ochish →</a>
        ) : (
          <p className="mt-2 text-sm yumshoq">Taqdimot fayli shu yerga joylashtiriladi.</p>
        )}
      </div>

      {/* Kartochkalar */}
      {cards.length > 0 && (
        <div className="karta p-5">
          <h2 className="font-bold">🃏 Kartochkalar to'plami</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cards.map((c) => (
              <span key={c.id} className="rounded-lg bg-brand-50 px-2.5 py-1 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                №{c.raqam} {c.nomi} <span className="text-xs opacity-70">({KARTOCHKA_TURLARI[c.turi as keyof typeof KARTOCHKA_TURLARI]?.nomi})</span>
              </span>
            ))}
          </div>
          <Link href="/kartochkalar" className="mt-3 inline-block text-sm text-brand-600 hover:underline">Kartochkalar bankiga o'tish →</Link>
        </div>
      )}

      {/* Self-check test */}
      <SelfCheckTest savollar={k.selfCheck} onNatija={(ball, max) => progressYangila({ testBall: ball, testMax: max })} oldingi={progress ? { ball: progress.testBall, max: progress.testMax } : null} />

      {/* Amaliy topshiriq */}
      <TopshiriqBolim
        matn={k.topshiriq}
        javob={progress?.topshiriqMatn ?? ""}
        topshirildi={progress?.topshiriqTopshirildi ?? false}
        onSaqla={(matn) => progressYangila({ topshiriqMatn: matn, topshiriqTopshirildi: true })}
      />

      {/* Muhokama forumi */}
      <ForumBolim topicId={id} forum={forum} onYangi={load} />

      {progress?.bajarildi && (
        <div className="karta border-l-4 border-l-ok p-4 text-ok">✓ Bu mavzu to'liq o'zlashtirildi (ma'ruza + test + topshiriq).</div>
      )}
    </div>
  );
}

function SelfCheckTest({ savollar, onNatija, oldingi }: {
  savollar: SelfCheck[]; onNatija: (ball: number, max: number) => void; oldingi: { ball: number; max: number } | null;
}) {
  const [javob, setJavob] = useState<Record<number, number>>({});
  const [tekshir, setTekshir] = useState(false);

  if (!savollar?.length) return null;
  const togri = savollar.filter((s, i) => javob[i] === s.togri).length;

  function yakunla() {
    setTekshir(true);
    onNatija(togri, savollar.length);
  }

  return (
    <div className="karta p-5">
      <h2 className="font-bold">✅ O'z-o'zini tekshirish testi</h2>
      {oldingi && oldingi.max > 0 && !tekshir && (
        <p className="mt-1 text-sm text-ok">Oldingi natija: {oldingi.ball} / {oldingi.max}</p>
      )}
      <div className="mt-3 space-y-4">
        {savollar.map((s, i) => (
          <div key={i}>
            <div className="font-medium">{i + 1}. {s.savol}</div>
            <div className="mt-2 space-y-1.5">
              {s.variantlar.map((v, j) => {
                const tanlangan = javob[i] === j;
                const togriJavob = tekshir && j === s.togri;
                const notogri = tekshir && tanlangan && j !== s.togri;
                return (
                  <button
                    key={j}
                    disabled={tekshir}
                    onClick={() => setJavob((x) => ({ ...x, [i]: j }))}
                    className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm ${
                      togriJavob ? "border-ok bg-ok/10" : notogri ? "border-bad bg-bad/10" : tanlangan ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : ""
                    }`}
                    style={!tanlangan && !togriJavob && !notogri ? { borderColor: "var(--chegara)" } : {}}
                  >
                    {v} {togriJavob && "✓"} {notogri && "✕"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {tekshir ? (
        <div className="mt-4 rounded-xl bg-brand-50 p-3 text-center font-semibold dark:bg-brand-900/30">
          Natija: {togri} / {savollar.length} to'g'ri
          <button onClick={() => { setTekshir(false); setJavob({}); }} className="btn-ikkinchi ml-3 !py-1.5">Qayta</button>
        </div>
      ) : (
        <button onClick={yakunla} disabled={Object.keys(javob).length < savollar.length} className="btn-asosiy mt-4">Tekshirish</button>
      )}
    </div>
  );
}

function TopshiriqBolim({ matn, javob, topshirildi, onSaqla }: {
  matn: string; javob: string; topshirildi: boolean; onSaqla: (m: string) => void;
}) {
  const [text, setText] = useState(javob);
  const [saqlash, setSaqlash] = useState(false);
  return (
    <div className="karta p-5">
      <h2 className="font-bold">📝 Amaliy topshiriq</h2>
      <p className="mt-2 text-sm yumshoq">{matn}</p>
      <textarea className="input mt-3 resize-none" rows={4} placeholder="Javobingizni yozing..." value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 flex items-center gap-3">
        {topshirildi && <span className="text-sm text-ok">✓ Topshirildi</span>}
        <button onClick={async () => { setSaqlash(true); await onSaqla(text); setSaqlash(false); }} disabled={saqlash || !text.trim()} className="btn-asosiy ml-auto">
          {saqlash ? "..." : "Topshirish"}
        </button>
      </div>
    </div>
  );
}

function ForumBolim({ topicId, forum, onYangi }: { topicId: string; forum: ForumItem[]; onYangi: () => void }) {
  const [matn, setMatn] = useState("");
  const [yubor, setYubor] = useState(false);

  async function yubora() {
    if (!matn.trim()) return;
    setYubor(true);
    await fetch("/api/modul/forum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicId, matn }) });
    setMatn(""); setYubor(false); onYangi();
  }

  return (
    <div className="karta p-5">
      <h2 className="font-bold">💬 Muhokama forumi</h2>
      <div className="mt-3 space-y-2">
        {forum.length === 0 && <p className="text-sm yumshoq">Hali muhokama yo'q. Birinchi bo'lib fikr bildiring.</p>}
        {forum.map((f) => (
          <div key={f.id} className="rounded-xl border p-3" style={{ borderColor: "var(--chegara)" }}>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{f.user.fio}</span>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">{ROLLAR[f.user.role as keyof typeof ROLLAR]}</span>
            </div>
            <p className="mt-1 text-sm">{f.matn}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="input flex-1" placeholder="Fikringiz..." value={matn} onChange={(e) => setMatn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && yubora()} />
        <button onClick={yubora} disabled={yubor} className="btn-asosiy">Yuborish</button>
      </div>
    </div>
  );
}
