"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FAOL_HAFTA_QOIDALARI } from "@/lib/constants";
import { son } from "@/lib/utils";

interface Guruh { nomi: string; ortacha: number; meniki: boolean }
interface GuruhReyting { challengeId: string; nomi: string; tugagan: boolean; guruhlar: Guruh[] }
interface Challenge { id: string; nomi: string; qoidalar: string[]; tugagan: boolean; boshlanish: string; tugash: string }
interface Nishon { id: string; kod: string; nomi: string; shart: string; ikonka: string; erishilgan: boolean }

export default function GamifikatsiyaPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [reyting, setReyting] = useState<GuruhReyting[]>([]);
  const [faolHafta, setFaolHafta] = useState<boolean[]>([false, false, false, false, false]);
  const [nishonlar, setNishonlar] = useState<Nishon[]>([]);
  const [yuk, setYuk] = useState(true);

  async function load() {
    const d = await (await fetch("/api/gamifikatsiya")).json();
    setChallenges(d.challenges ?? []);
    setReyting(d.guruhReyting ?? []);
    setFaolHafta(d.faolHaftaBugun ?? [false, false, false, false, false]);
    setNishonlar(d.nishonlar ?? []);
    setYuk(false);
  }
  useEffect(() => { load(); }, []);

  async function qoidaToggle(i: number) {
    const yangi = faolHafta.map((v, j) => (j === i ? !v : v));
    setFaolHafta(yangi);
    await fetch("/api/gamifikatsiya", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qoidalar: yangi }) });
  }

  const tugaganChellenj = challenges.find((c) => c.tugagan);
  const maxOrtacha = Math.max(1, ...reyting.flatMap((r) => r.guruhlar.map((g) => g.ortacha)));

  if (yuk) return <div className="yumshoq">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold">Rag'bat</h1>
        <p className="yumshoq">Ijtimoiy e'tirof — moddiy rag'bat emas. Musobaqa 2–3 hafta bilan cheklangan.</p>
      </div>

      {/* Chellenj tugaganda avtomatik refleksiyaga o'tkazish */}
      {tugaganChellenj && (
        <div className="karta border-l-4 border-l-brand-500 p-5">
          <div className="font-semibold">«{tugaganChellenj.nomi}» chellenji yakunlandi 🎉</div>
          <p className="mt-1 text-sm yumshoq">Tashqi rag'batga qaramaslik uchun endi shaxsiy maqsad va refleksiyaga o'tamiz.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/maqsad" className="btn-asosiy">Shaxsiy maqsad qo'yish →</Link>
            <Link href="/profil" className="btn-ikkinchi">Refleksiya →</Link>
          </div>
        </div>
      )}

      {/* Guruh qadami reytingi */}
      {reyting.map((r) => (
        <div key={r.challengeId} className="karta p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">🏃 {r.nomi} {r.tugagan && <span className="text-sm yumshoq">(yakunlandi)</span>}</h2>
          </div>
          <p className="text-sm yumshoq">Guruhlarning o'rtacha kunlik qadamlar soni (individual emas)</p>
          <div className="mt-4 space-y-3">
            {r.guruhlar.map((g, i) => (
              <div key={g.nomi}>
                <div className="flex items-center justify-between text-sm">
                  <span className={g.meniki ? "font-bold text-brand-700 dark:text-brand-300" : "font-medium"}>
                    {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : `${i + 1}. `}{g.nomi} {g.meniki && "(mening guruhim)"}
                  </span>
                  <span className="font-bold">{son(g.ortacha)}</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full" style={{ backgroundColor: "var(--chegara)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(g.ortacha / maxOrtacha) * 100}%`, backgroundColor: g.meniki ? "#0d9488" : "#94a3b8" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl p-3 text-xs yumshoq" style={{ backgroundColor: "var(--fon)" }}>
            {challenges.find((c) => c.id === r.challengeId)?.qoidalar.map((q, i) => <div key={i}>• {q}</div>)}
          </div>
        </div>
      ))}

      {/* Faol hafta */}
      <div className="karta p-5">
        <h2 className="font-bold">🌿 Faol hafta — bugungi 5 qoida</h2>
        <p className="text-sm yumshoq">Har kuni bajarilgan qoidalarni belgilang</p>
        <div className="mt-3 space-y-2">
          {FAOL_HAFTA_QOIDALARI.map((q, i) => (
            <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${faolHafta[i] ? "border-ok bg-ok/5" : ""}`} style={!faolHafta[i] ? { borderColor: "var(--chegara)" } : {}}>
              <input type="checkbox" className="h-5 w-5 accent-ok" checked={faolHafta[i]} onChange={() => qoidaToggle(i)} />
              <span className={faolHafta[i] ? "font-medium" : ""}>{q}</span>
              {faolHafta[i] && <span className="ml-auto text-ok">✓</span>}
            </label>
          ))}
        </div>
        <div className="mt-3 text-sm yumshoq">Bugun: {faolHafta.filter(Boolean).length} / 5 bajarildi</div>
      </div>

      {/* Nishonlar */}
      <div className="karta p-5">
        <h2 className="font-bold">🏅 Nishonlar</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {nishonlar.map((n) => (
            <div key={n.id} className={`flex items-center gap-3 rounded-xl border p-3 ${n.erishilgan ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20" : "opacity-60"}`} style={!n.erishilgan ? { borderColor: "var(--chegara)" } : {}}>
              <span className={`text-3xl ${n.erishilgan ? "" : "grayscale"}`}>{n.ikonka}</span>
              <div>
                <div className="font-semibold">{n.nomi} {n.erishilgan && <span className="text-ok">✓</span>}</div>
                <div className="text-xs yumshoq">{n.shart}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamifikatsiya qoidalari */}
      <div className="karta border-l-4 border-l-warn p-4 text-sm yumshoq">
        <b>Gamifikatsiya qoidalari:</b> musobaqa 2–3 hafta bilan cheklanadi · natijalar shaxsiy va guruh
        dinamikasi bo'yicha baholanadi (mutlaq emas) · rag'bat ijtimoiy e'tirof shaklida · chellenj tugagach
        tizim sizni shaxsiy maqsad va refleksiya rejimiga o'tkazadi.
      </div>
    </div>
  );
}
