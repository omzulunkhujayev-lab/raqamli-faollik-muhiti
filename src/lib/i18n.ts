// Ko'p tillilik (i18n) — uz / ru / en. Barcha matn shu yerdan (lug'atlardan) boshqariladi.
import { uz } from "./dictionaries/uz";
import { ru } from "./dictionaries/ru";
import { en } from "./dictionaries/en";

export const TILLAR = { uz: "O'zbek", ru: "Русский", en: "English" } as const;
export type Til = keyof typeof TILLAR;
export const TIL_RUYXAT: Til[] = ["uz", "ru", "en"];
export const DEFAULT_TIL: Til = "uz";
export const TIL_COOKIE = "rfm_til";

export type Lugat = Record<string, string>;

export const LUGATLAR: Record<Til, Lugat> = { uz, ru, en };

// Tarjima olish — kalit topilmasa o'zbekchaga (default) qaytadi
export function tarjima(til: Til, kalit: string, orin?: Record<string, string | number>): string {
  const dict = LUGATLAR[til] ?? uz;
  let matn = dict[kalit] ?? uz[kalit] ?? kalit;
  if (orin) {
    for (const [k, v] of Object.entries(orin)) matn = matn.replaceAll(`{${k}}`, String(v));
  }
  return matn;
}

export function tilTekshir(v: string | undefined | null): Til {
  return v === "ru" || v === "en" || v === "uz" ? v : DEFAULT_TIL;
}
