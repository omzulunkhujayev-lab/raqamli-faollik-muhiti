"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { TILLAR, TIL_RUYXAT, type Til } from "@/lib/i18n";
import { useT } from "./LangProvider";

const QISQA: Record<Til, string> = { uz: "UZ", ru: "RU", en: "EN" };

// Til almashtirgich (uz/ru/en) — cookie'ni yangilaydi va server komponentlarini qayta yuklaydi
export default function TilSwitcher() {
  const { til, tilOzgart } = useT();
  const router = useRouter();
  const [ochiq, setOchiq] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function tashqari(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOchiq(false);
    }
    document.addEventListener("mousedown", tashqari);
    return () => document.removeEventListener("mousedown", tashqari);
  }, []);

  function tanla(yangi: Til) {
    tilOzgart(yangi);
    setOchiq(false);
    router.refresh(); // server komponentlarini yangi til bilan qayta render qilish
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOchiq((o) => !o)} className="btn-ikkinchi !px-2.5 !py-2 text-sm font-semibold" aria-label="Til" title="Til / Язык / Language">
        🌐 {QISQA[til]}
      </button>
      {ochiq && (
        <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
          {TIL_RUYXAT.map((k) => (
            <button
              key={k}
              onClick={() => tanla(k)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5 ${k === til ? "font-semibold text-brand-600" : ""}`}
            >
              <span className="w-6 text-xs opacity-70">{QISQA[k]}</span>
              {TILLAR[k]}
              {k === til && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
