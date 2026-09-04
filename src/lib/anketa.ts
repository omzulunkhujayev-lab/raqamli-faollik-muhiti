// Anketa «Talabaning jismoniy faolligi va harakat rejimi» — 4 qism (anonim)
// Likert javoblari 1..5 (motivatsion-qadriyatli mezon uchun ball asosi)

export interface AnketaSavol {
  id: string;
  savol: string;
  tur: "likert" | "tanlov";
  variantlar?: string[];
  motivatsion?: boolean; // motivatsion-qadriyatli mezonga hissa qo'shadimi
}
export interface AnketaQism {
  nomi: string;
  savollar: AnketaSavol[];
}

export const LIKERT = ["Umuman qo'shilmayman", "Qo'shilmayman", "Qisman", "Qo'shilaman", "To'liq qo'shilaman"];

export const ANKETA: AnketaQism[] = [
  {
    nomi: "1. Umumiy ma'lumotlar",
    savollar: [
      { id: "u1", savol: "Yashash sharoitingiz", tur: "tanlov", variantlar: ["Yotoqxona", "Ijara", "Oila bilan"] },
      { id: "u2", savol: "Universitetga qanday yetib borasiz?", tur: "tanlov", variantlar: ["Piyoda", "Jamoat transporti", "Shaxsiy transport", "Aralash"] },
      { id: "u3", savol: "Kuniga taxminan necha soat o'tirasiz (darslar + mustaqil ish)?", tur: "tanlov", variantlar: ["4 soatdan kam", "4–6 soat", "6–8 soat", "8 soatdan ko'p"] },
    ],
  },
  {
    nomi: "2. Harakat rejimi",
    savollar: [
      { id: "h1", savol: "Kuniga muntazam piyoda yuraman", tur: "likert" },
      { id: "h2", savol: "Har 45–60 daqiqada o'rnimdan turib harakat qilaman", tur: "likert" },
      { id: "h3", savol: "Liftdan ko'ra zinapoyadan foydalanaman", tur: "likert" },
      { id: "h4", savol: "Haftada kamida 150 daqiqa faol harakat qilaman", tur: "likert" },
    ],
  },
  {
    nomi: "3. Raqamli vositalar va monitoring",
    savollar: [
      { id: "r1", savol: "Faolligimni (qadam va h.k.) kuzatib boraman", tur: "likert" },
      { id: "r2", savol: "Raqamli vosita ma'lumotlariga ishonaman", tur: "likert" },
      { id: "r3", savol: "Shaxsiy ma'lumotlar maxfiyligi men uchun muhim", tur: "likert" },
    ],
  },
  {
    nomi: "4. Munosabat va kasbiy tayyorgarlik",
    savollar: [
      { id: "m1", savol: "Jismoniy faollik salomatlik uchun muhim deb bilaman", tur: "likert", motivatsion: true },
      { id: "m2", savol: "Faol turmush tarziga barqaror ehtiyoj sezaman", tur: "likert", motivatsion: true },
      { id: "m3", savol: "Bo'lajak o'qituvchi sifatida o'quvchilar harakat rejimiga mas'ulman", tur: "likert", motivatsion: true },
      { id: "m4", savol: "Mikrofaollik pauzalarini mashg'ulotga singdira olaman", tur: "likert", motivatsion: true },
    ],
  },
];

// Anketadan motivatsion-qadriyatli ballni hisoblash (0..100)
export function motivatsionBall(javoblar: Record<string, number | string>): number {
  const motivIds = ANKETA.flatMap((q) => q.savollar.filter((s) => s.motivatsion).map((s) => s.id));
  const ballar = motivIds.map((id) => Number(javoblar[id]) || 0).filter((v) => v > 0);
  if (ballar.length === 0) return 0;
  const ortacha = ballar.reduce((s, v) => s + v, 0) / ballar.length; // 1..5
  return Math.round((ortacha / 5) * 100);
}
