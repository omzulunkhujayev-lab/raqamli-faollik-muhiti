// Server tomonida joriy tilni cookie'dan olish (server komponentlari uchun)
import { cookies } from "next/headers";
import { tarjima, tilTekshir, TIL_COOKIE, type Til } from "./i18n";

export async function getTil(): Promise<Til> {
  const store = await cookies();
  return tilTekshir(store.get(TIL_COOKIE)?.value);
}

// Server komponentlari uchun tarjima funksiyasi
export async function getT() {
  const til = await getTil();
  const t = (kalit: string, orin?: Record<string, string | number>) => tarjima(til, kalit, orin);
  return { til, t };
}
