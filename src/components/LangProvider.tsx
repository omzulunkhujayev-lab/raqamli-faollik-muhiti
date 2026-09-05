"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { tarjima, TIL_COOKIE, type Til } from "@/lib/i18n";

interface LangCtx {
  til: Til;
  t: (kalit: string, orin?: Record<string, string | number>) => string;
  tilOzgart: (yangi: Til) => void;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ initialTil, children }: { initialTil: Til; children: React.ReactNode }) {
  const [til, setTil] = useState<Til>(initialTil);

  const t = useCallback(
    (kalit: string, orin?: Record<string, string | number>) => tarjima(til, kalit, orin),
    [til]
  );

  const tilOzgart = useCallback((yangi: Til) => {
    setTil(yangi);
    try {
      document.cookie = `${TIL_COOKIE}=${yangi}; path=/; max-age=${60 * 60 * 24 * 365}`;
      localStorage.setItem("rfm-til", yangi);
    } catch {}
    document.documentElement.lang = yangi;
  }, []);

  return <Ctx.Provider value={{ til, t, tilOzgart }}>{children}</Ctx.Provider>;
}

export function useT() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Provider tashqarisida — fallback (o'zbekcha)
    return { til: "uz" as Til, t: (k: string) => k, tilOzgart: () => {} };
  }
  return ctx;
}
