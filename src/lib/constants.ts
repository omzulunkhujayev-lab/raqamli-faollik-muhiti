// Xalqaro me'yorlar va tizim konstantalari (glossariy va spec bo'yicha)

export const NORMS = {
  // Kuniga qadamlar soni
  QADAM_KUNLIK: 8000,
  // Haftasiga faol daqiqalar (o'rtacha jadallik)
  FAOL_DAQIQA_HAFTALIK_MIN: 150,
  FAOL_DAQIQA_HAFTALIK_MAX: 300,
  // Uzluksiz o'tirish chegarasi (daqiqa) — bundan oshsa "faollik uzilishi"
  OTIRISH_CHEGARA: 60,
  // Mikrofaollik pauzasi oralig'i (daqiqa)
  PAUZA_ORALIQ_MIN: 45,
  PAUZA_ORALIQ_MAX: 60,
  // Uyqu (soat)
  UYQU_MIN: 7,
  UYQU_MAX: 9,
} as const;

// Rollar
export const ROLLAR = {
  talaba: "Talaba",
  oqituvchi: "Fan o'qituvchisi",
  tyutor: "Tyutor",
  admin: "Kafedra / administrator",
} as const;

export type Rol = keyof typeof ROLLAR;

// Kartochka turlari
export const KARTOCHKA_TURLARI = {
  gigiyenik: { nomi: "Gigiyenik-tiklovchi", davomiylik: "2–3 daq.", rang: "brand" },
  kognitiv: { nomi: "Kognitiv-faollashtiruvchi", davomiylik: "3–5 daq.", rang: "ok" },
  kasbiy: { nomi: "Kasbiy-metodik", davomiylik: "3–5 daq.", rang: "warn" },
} as const;

// Kartochka joy turlari (filtr)
export const JOY_TURLARI = {
  urindan_turmasdan: "O'rindan turmasdan",
  auditoriya: "Auditoriya ichida ko'chish",
  tanaffus_ochiq_havo: "Tanaffus va ochiq havo",
} as const;

// Maqsad turlari
export const MAQSAD_TURLARI = {
  qadam: "Kunlik qadamlar",
  faolDaqiqa: "Haftalik faol daqiqalar",
  pauza: "Mikrofaollik pauzalari",
  otirish: "Uzluksiz o'tirishni qisqartirish",
} as const;

// «Faol hafta» 5 oddiy qoidasi (gamifikatsiya)
export const FAOL_HAFTA_QOIDALARI = [
  "Kuniga 6 000+ qadam",
  "Har 45 daqiqada pauza",
  "Liftdan voz kechish",
  "Kuniga 30 daqiqa ochiq havo",
  "Yotishdan 1 soat oldin ekranni qo'yish",
] as const;

// Yopiq halqa bo'g'inlari (infografika uchun)
export const YOPIQ_HALQA = [
  { kod: "monitoring", nomi: "Monitoring", tavsif: "Qadamlar, faol daqiqalar, o'tirish davomiyligi qayd etiladi" },
  { kod: "teskari_aloqa", nomi: "Teskari aloqa", tavsif: "Ma'lumot tushunarli shaklda bir hafta ichida qaytariladi" },
  { kod: "mikrofaollik", nomi: "Mikrofaollik", tavsif: "Tanqislik qisqa harakat pauzalari orqali to'ldiriladi" },
  { kod: "ragbat", nomi: "Rag'bat", tavsif: "Guruh chellenjlari, nishonlar, ijtimoiy e'tirof" },
  { kod: "refleksiya", nomi: "Refleksiya", tavsif: "Hafta yakunida profil tahlil qilinadi, yangi maqsad qo'yiladi" },
] as const;

// Talaba faolligining to'rt sathi
export const TORT_SATH = [
  "O'quv-jarayoniy mikrofaollik (mashg'ulot ichidagi harakat)",
  "Mustaqil ta'lim davridagi faollik",
  "Kampus va ko'chish (transport) faolligi",
  "Tiklanish faolligi (uyqu, dam olish)",
] as const;
