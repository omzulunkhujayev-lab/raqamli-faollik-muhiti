// Baholash mantiqi: ikki qatlamli tizim + darajalar (spec 4.8)
// Muhim etik qoida: mutlaq jismoniy ko'rsatkich TO'G'RIDAN-TO'G'RI reyting bo'lmaydi.
// Obyektiv qatlam — me'yorga MOSLIK (muntazamlik), integral bahoda atigi 30% ulush.
// Asosiy 70% — pedagogik mezonlar (tahlil, metodik ko'nikma, refleksiya).

export const OBYEKTIV_ULUSH = 0.3;
export const PEDAGOGIK_ULUSH = 0.7;

export interface Mezonlar {
  motivatsion: number; // 0..100
  kognitiv: number;
  faoliyatli: number;
  refleksiv: number;
}

export const MEZON_NOMLARI: Record<keyof Mezonlar, { nomi: string; vosita: string }> = {
  motivatsion: { nomi: "Motivatsion-qadriyatli", vosita: "Anketa, suhbat" },
  kognitiv: { nomi: "Kognitiv-metodik", vosita: "Test, keys tahlili" },
  faoliyatli: { nomi: "Faoliyatli-monitoring", vosita: "Kundalik tahlili, kuzatuv kartasi" },
  refleksiv: { nomi: "Refleksiv-korreksion", vosita: "Refleksiv esse, individual reja" },
};

export function pedagogikOrtacha(m: Mezonlar): number {
  return (m.motivatsion + m.kognitiv + m.faoliyatli + m.refleksiv) / 4;
}

export function integralHisobla(obyektiv: number, m: Mezonlar): number {
  return Math.round(obyektiv * OBYEKTIV_ULUSH + pedagogikOrtacha(m) * PEDAGOGIK_ULUSH);
}

export interface Daraja {
  kod: "yuqori" | "orta" | "quyi";
  nomi: string;
  oraliq: string;
  tavsif: string;
  rang: string;
}

export function darajaAniqla(integral: number): Daraja {
  if (integral >= 86)
    return {
      kod: "yuqori", nomi: "Yuqori", oraliq: "86–100",
      tavsif: "Barqaror ehtiyoj va kasbiy mas'uliyat shakllangan; monitoring muntazam; profilni mustaqil tahlil qiladi va asosli maqsad qo'yadi; mikrofaollikni mashg'ulotga singdira oladi.",
      rang: "ok",
    };
  if (integral >= 71)
    return {
      kod: "orta", nomi: "O'rta", oraliq: "71–85",
      tavsif: "Bilim va ko'nikma yetarli, lekin muntazamlik yoki tahlil chuqurligi to'liq barqaror emas; qo'llab-quvvatlash bilan mustaqil rejalashtiradi.",
      rang: "warn",
    };
  return {
    kod: "quyi", nomi: "Quyi", oraliq: "70 va past",
    tavsif: "Monitoring nomuntazam, tahlil yuzaki; motivatsion va metodik jihatdan qo'shimcha yordam va hamrohlik zarur.",
    rang: "bad",
  };
}

// Obyektiv ball (0..100) — me'yorga moslik (magnitudaga emas, muntazamlikka yo'naltirilgan)
export function obyektivBallHisobla(input: {
  ortachaQadam: number;
  haftalikFaolDaqiqa: number;
  ortachaEngUzunOtirish: number;
  ortachaPauza: number;
  ortachaUyqu: number;
}): number {
  const qadam = Math.min(1, input.ortachaQadam / 8000);
  const faol = Math.min(1, input.haftalikFaolDaqiqa / 150);
  const otirish = input.ortachaEngUzunOtirish <= 60 ? 1 : Math.max(0, 60 / input.ortachaEngUzunOtirish);
  const pauza = Math.min(1, input.ortachaPauza / 3);
  const uyqu = input.ortachaUyqu >= 7 && input.ortachaUyqu <= 9 ? 1 : Math.max(0, 1 - Math.abs(8 - input.ortachaUyqu) / 4);
  const ortacha = (qadam + faol + otirish + pauza + uyqu) / 5;
  return Math.round(ortacha * 100);
}

// Triangulyatsiya: manbalar orasidagi nomuvofiqlikni aniqlash (jazo emas — signal)
export function triangulyatsiya(m: Mezonlar): { nomuvofiq: boolean; farq: number; izoh: string } {
  const qiymatlar = [m.motivatsion, m.kognitiv, m.faoliyatli, m.refleksiv].filter((v) => v > 0);
  if (qiymatlar.length < 2) return { nomuvofiq: false, farq: 0, izoh: "Taqqoslash uchun ma'lumot yetarli emas." };
  const farq = Math.max(...qiymatlar) - Math.min(...qiymatlar);
  if (farq >= 30) {
    return {
      nomuvofiq: true, farq,
      izoh: "Manbalar orasida sezilarli farq bor (masalan, bilim yuqori — amaliyot past). Bu jazo emas, muhokama uchun signal.",
    };
  }
  return { nomuvofiq: false, farq, izoh: "Manbalar o'zaro muvofiq." };
}
