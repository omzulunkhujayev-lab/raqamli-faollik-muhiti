// «Faollik uzilishlari» tahlili logikasi (spec 4.4)
// Uzilish = uzluksiz o'tirish 60 daqiqadan oshadigan oraliq.
import { NORMS } from "./constants";

export interface Dars {
  nomi: string;
  boshlanish: string; // "HH:MM"
  tugash: string;
}

export interface Yechim {
  kod: string;
  nomi: string;
  izoh: string;
}

export interface Uzilish {
  boshlanish: string;
  tugash: string;
  boshlanishMin: number;
  tugashMin: number;
  davomiylikDaq: number;
  darslar: string[];
  tavsiyaPauza: number; // taklif etilgan mikrofaollik pauzalari soni
  yechimlar: Yechim[];
}

// Movement threshold — bu miqdordan qisqa tanaffus "harakat imkoni" bermaydi,
// shu sababli o'tirish uzluksiz davom etadi deb hisoblanadi.
const HARAKAT_TANAFFUS = 15; // daqiqa

export function hhmmMin(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}
export function minHhmm(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Bir kunlik darslardan faollik uzilishlarini aniqlash
export function uzilishlarniAniqla(darslar: Dars[]): Uzilish[] {
  if (!darslar.length) return [];
  const sorted = [...darslar].sort((a, b) => hhmmMin(a.boshlanish) - hhmmMin(b.boshlanish));

  // Ketma-ket darslarni bloklarga birlashtirish (qisqa tanaffus = o'tirish davom etadi)
  interface Blok { boshlanish: number; tugash: number; darslar: string[]; qisqaTanaffus: boolean }
  const bloklar: Blok[] = [];
  for (const d of sorted) {
    const b = hhmmMin(d.boshlanish);
    const t = hhmmMin(d.tugash);
    const oxirgi = bloklar[bloklar.length - 1];
    if (oxirgi && b - oxirgi.tugash < HARAKAT_TANAFFUS) {
      // Darslar orasida qisqa (harakatsiz) tanaffus bo'lsa belgilaymiz
      if (b - oxirgi.tugash > 0) oxirgi.qisqaTanaffus = true;
      oxirgi.tugash = t;
      oxirgi.darslar.push(d.nomi);
    } else {
      bloklar.push({ boshlanish: b, tugash: t, darslar: [d.nomi], qisqaTanaffus: false });
    }
  }

  // Davomiyligi 60 daqiqadan oshgan bloklar — uzilish
  const uzilishlar: Uzilish[] = [];
  for (const blok of bloklar) {
    const davomiylik = blok.tugash - blok.boshlanish;
    if (davomiylik <= NORMS.OTIRISH_CHEGARA) continue;

    const tavsiyaPauza = Math.max(1, Math.floor(davomiylik / 50));
    const mustaqil = blok.darslar.some((n) => /mustaqil|seminar/i.test(n));

    const yechimlar: Yechim[] = [
      {
        kod: "ichki_pauza",
        nomi: "Mashg'ulot ichidagi mikrofaollik pauzasi",
        izoh: `${davomiylik} daqiqalik blok uchun taxminan ${tavsiyaPauza} ta qisqa pauza (har 45–50 daqiqada bittadan).`,
      },
    ];
    if (blok.qisqaTanaffus) {
      yechimlar.push({
        kod: "tanaffus_harakat",
        nomi: "Tanaffusdagi faol harakat",
        izoh: "Qisqa tanaffuslarni o'tirib emas, yengil harakat bilan o'tkazish.",
      });
      yechimlar.push({
        kod: "binolar_piyoda",
        nomi: "Binolar orasidagi yo'lni piyoda bosib o'tish",
        izoh: "Keyingi auditoriyaga o'tishda faol qadam / zinapoyadan foydalanish.",
      });
    }
    if (mustaqil) {
      yechimlar.push({
        kod: "rejim_45_5",
        nomi: "Mustaqil ish davridagi «45+5» rejimi",
        izoh: "45 daqiqa ish — 5 daqiqa harakat tsikli.",
      });
    }

    uzilishlar.push({
      boshlanish: minHhmm(blok.boshlanish),
      tugash: minHhmm(blok.tugash),
      boshlanishMin: blok.boshlanish,
      tugashMin: blok.tugash,
      davomiylikDaq: davomiylik,
      darslar: blok.darslar,
      tavsiyaPauza,
      yechimlar,
    });
  }
  return uzilishlar;
}

// Timeline segmentlari (vizualizatsiya uchun): dars | tanaffus, uzilish belgisi bilan
export interface Segment {
  turi: "dars" | "tanaffus";
  nomi?: string;
  boshlanish: number;
  tugash: number;
  uzilishdami: boolean;
}

export function timelineSegmentlar(darslar: Dars[]): { segmentlar: Segment[]; min: number; max: number } {
  if (!darslar.length) return { segmentlar: [], min: 0, max: 0 };
  const sorted = [...darslar].sort((a, b) => hhmmMin(a.boshlanish) - hhmmMin(b.boshlanish));
  const uzilishlar = uzilishlarniAniqla(darslar);

  const uzilishOraliq = (b: number, t: number) =>
    uzilishlar.some((u) => b >= u.boshlanishMin && t <= u.tugashMin);

  const segmentlar: Segment[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const b = hhmmMin(sorted[i].boshlanish);
    const t = hhmmMin(sorted[i].tugash);
    segmentlar.push({ turi: "dars", nomi: sorted[i].nomi, boshlanish: b, tugash: t, uzilishdami: uzilishOraliq(b, t) });
    if (i < sorted.length - 1) {
      const nb = hhmmMin(sorted[i + 1].boshlanish);
      if (nb > t) {
        segmentlar.push({ turi: "tanaffus", boshlanish: t, tugash: nb, uzilishdami: uzilishOraliq(t, nb) });
      }
    }
  }
  const min = hhmmMin(sorted[0].boshlanish);
  const max = hhmmMin(sorted[sorted.length - 1].tugash);
  return { segmentlar, min, max };
}
