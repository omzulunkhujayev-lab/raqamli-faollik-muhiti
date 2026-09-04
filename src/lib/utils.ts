import { NORMS } from "./constants";

// Sana yordamchilari ---------------------------------------------------------

// Sanani "YYYY-MM-DD" ga aylantirish (mahalliy)
export function sanaKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "YYYY-MM-DD" dan kun boshiga (UTC 00:00) Date
export function keyToDate(key: string): Date {
  return new Date(key + "T00:00:00.000Z");
}

// ISO hafta raqami (masalan "2026-W36")
export function isoHafta(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// Berilgan sanadagi haftaning dushanbasi
export function haftaBoshi(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7; // yakshanba = 7
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (day - 1));
  return date;
}

// Haftaning 7 kunini (dushanbadan) qaytaradi
export function haftaKunlari(d: Date): Date[] {
  const boshi = haftaBoshi(d);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(boshi);
    x.setDate(boshi.getDate() + i);
    return x;
  });
}

const OY_NOMLARI = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

// Sanani o'zbekcha formatlash (locale ma'lumotisiz) — masalan "Payshanba, 3-sentabr"
export function sanaUzbek(d: Date, haftaKuniBilan = true): string {
  const jsDay = d.getDay(); // 0=Yakshanba
  const kunIndex = jsDay === 0 ? 6 : jsDay - 1;
  const asos = `${d.getDate()}-${OY_NOMLARI[d.getMonth()]}`;
  return haftaKuniBilan ? `${KUN_TOLIQ[kunIndex]}, ${asos}` : asos;
}

// Sonni bo'sh joy ajratgichi bilan (o'zbekcha ko'rinish): 8100 -> "8 100"
export function son(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const KUN_NOMLARI = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
export const KUN_TOLIQ = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

// Indikator rang mantiqi ------------------------------------------------------
// Me'yorga nisbatan holat: "ok" (yashil) | "warn" (sariq) | "bad" (qizil)

export type Holat = "ok" | "warn" | "bad";

export function qadamHolati(qadam: number): Holat {
  if (qadam >= NORMS.QADAM_KUNLIK) return "ok";
  if (qadam >= NORMS.QADAM_KUNLIK * 0.6) return "warn";
  return "bad";
}

export function faolDaqiqaHolati(haftalik: number): Holat {
  if (haftalik >= NORMS.FAOL_DAQIQA_HAFTALIK_MIN) return "ok";
  if (haftalik >= NORMS.FAOL_DAQIQA_HAFTALIK_MIN * 0.6) return "warn";
  return "bad";
}

export function otirishHolati(daqiqa: number): Holat {
  if (daqiqa <= NORMS.OTIRISH_CHEGARA) return "ok";
  if (daqiqa <= NORMS.OTIRISH_CHEGARA * 1.5) return "warn";
  return "bad";
}

export function uyquHolati(soat: number): Holat {
  if (soat >= NORMS.UYQU_MIN && soat <= NORMS.UYQU_MAX) return "ok";
  if (soat >= NORMS.UYQU_MIN - 1) return "warn";
  return "bad";
}

// Foizni hisoblash (me'yorga nisbatan), 0..100+ (0 dan past bo'lmaydi)
export function foiz(qiymat: number, meyor: number): number {
  if (meyor <= 0) return 0;
  return Math.round((qiymat / meyor) * 100);
}

// Holat -> Tailwind rang klassi
export const HOLAT_RANG: Record<Holat, { bg: string; text: string; border: string; hex: string }> = {
  ok: { bg: "bg-ok/10", text: "text-ok", border: "border-ok", hex: "#16a34a" },
  warn: { bg: "bg-warn/10", text: "text-warn", border: "border-warn", hex: "#eab308" },
  bad: { bg: "bg-bad/10", text: "text-bad", border: "border-bad", hex: "#dc2626" },
};

// YouTube (yoki boshqa) URL'ni embed ko'rinishiga keltirish
export function youtubeEmbed(url: string): string {
  if (!url) return "";
  const u = url.trim();
  // youtu.be/ID
  let m = u.match(/youtu\.be\/([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // youtube.com/watch?v=ID
  m = u.match(/[?&]v=([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // youtube.com/embed/ID (allaqachon embed)
  m = u.match(/youtube\.com\/embed\/([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // shorts
  m = u.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return u; // boshqa manba — o'zgarishsiz
}

// JSON massivni xavfsiz parse qilish
export function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
