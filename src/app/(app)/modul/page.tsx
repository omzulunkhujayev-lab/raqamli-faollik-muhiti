"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Progress { korilgan: boolean; testMax: number; testBall: number; topshiriqTopshirildi: boolean; bajarildi: boolean }
interface Topic {
  id: string; tartib: number; nomi: string;
  maruzaSoat: number; amaliySoat: number; mustaqilSoat: number;
  progress: Progress | null;
}

export default function ModulPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [yuk, setYuk] = useState(true);

  useEffect(() => {
    fetch("/api/modul").then((r) => r.json()).then((d) => { setTopics(d.topics ?? []); setYuk(false); });
  }, []);

  const tugatilgan = topics.filter((t) => t.progress?.bajarildi).length;
  const jamiSoat = topics.reduce((s, t) => s + t.maruzaSoat + t.amaliySoat + t.mustaqilSoat, 0);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold">«Raqamli faollik madaniyati» o'quv moduli</h1>
        <p className="yumshoq">2 kredit · {jamiSoat || 60} soat · 9 mavzu</p>
      </div>

      {/* Kurs haqida */}
      <div className="grid gap-4 sm:grid-cols-4">
        <InfoKarta katta="2" past="kredit" />
        <InfoKarta katta="16 / 24 / 20" past="ma'ruza / amaliy / mustaqil" />
        <InfoKarta katta={`${tugatilgan} / ${topics.length || 9}`} past="tugatilgan mavzu" rang="text-brand-600" />
        <InfoKarta katta="40 / 30 / 30" past="joriy / oraliq / yakuniy (ball)" />
      </div>

      {/* Reyting tuzilmasi */}
      <div className="karta p-5">
        <h2 className="font-bold">Baholash (reyting)</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 dark:bg-brand-900/30">Joriy nazorat — <b>40 ball</b></span>
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 dark:bg-brand-900/30">Oraliq nazorat — <b>30 ball</b></span>
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 dark:bg-brand-900/30">Yakuniy nazorat — <b>30 ball</b></span>
        </div>
      </div>

      {/* Mavzular */}
      {yuk ? (
        <div className="yumshoq">Yuklanmoqda...</div>
      ) : (
        <div className="space-y-3">
          {topics.map((t) => {
            const p = t.progress;
            const holat = p?.bajarildi ? "tugatildi" : p?.korilgan ? "boshlandi" : "boshlanmagan";
            return (
              <Link key={t.id} href={`/modul/${t.id}`} className="karta flex items-center gap-4 p-4 transition hover:shadow-md">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  p?.bajarildi ? "bg-ok text-white" : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                }`}>
                  {p?.bajarildi ? "✓" : t.tartib}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{t.nomi}</div>
                  <div className="text-xs yumshoq">
                    {t.maruzaSoat} ma'ruza · {t.amaliySoat} amaliy · {t.mustaqilSoat} mustaqil soat
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                  holat === "tugatildi" ? "bg-ok/10 text-ok" : holat === "boshlandi" ? "bg-warn/10 text-warn" : "yumshoq"
                }`} style={holat === "boshlanmagan" ? { backgroundColor: "var(--fon)" } : {}}>
                  {holat === "tugatildi" ? "Tugatildi" : holat === "boshlandi" ? "Boshlandi" : "Boshlanmagan"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoKarta({ katta, past, rang }: { katta: string; past: string; rang?: string }) {
  return (
    <div className="karta p-4 text-center">
      <div className={`text-xl font-extrabold ${rang ?? ""}`}>{katta}</div>
      <div className="mt-1 text-xs yumshoq">{past}</div>
    </div>
  );
}
