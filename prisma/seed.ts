import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sana yordamchi (mahalliy kun boshiga)
function kun(offsetDays: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

async function main() {
  console.log("🌱 Seed boshlandi...");

  // Eski ma'lumotlarni tozalash (bog'liqlik tartibida)
  await prisma.forumPost.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.courseTopic.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.reflectiveEssay.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.dailyEntry.deleteMany();
  await prisma.weeklyGoal.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.observationCard.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.activityGap.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.card.deleteMany();
  await prisma.faolHaftaKun.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();
  await prisma.badge.deleteMany();

  const parol = await bcrypt.hash("demo1234", 10);

  // --- Tyutor ---
  const tyutor = await prisma.user.create({
    data: {
      email: "tyutor@demo.uz",
      passwordHash: parol,
      role: "tyutor",
      fio: "Nodira Karimova",
      muassasa: "Pedagogika instituti",
      consentAt: new Date(),
    },
  });

  // --- Guruhlar ---
  const guruhTajriba = await prisma.group.create({
    data: { nomi: "PT-21-01 (tajriba)", kurs: 3, tur: "tajriba", tyutorId: tyutor.id },
  });
  const guruhNazorat = await prisma.group.create({
    data: { nomi: "PT-21-02 (nazorat)", kurs: 3, tur: "nazorat", tyutorId: tyutor.id },
  });

  // --- O'qituvchi ---
  await prisma.user.create({
    data: {
      email: "oqituvchi@demo.uz",
      passwordHash: parol,
      role: "oqituvchi",
      fio: "Bobur Rahimov",
      muassasa: "Pedagogika instituti",
      consentAt: new Date(),
    },
  });

  // --- Administrator (kafedra) ---
  await prisma.user.create({
    data: {
      email: "admin@demo.uz",
      passwordHash: parol,
      role: "admin",
      fio: "Kafedra administratori",
      muassasa: "Pedagogika instituti",
      consentAt: new Date(),
    },
  });

  // --- Asosiy talaba (demo) ---
  const talaba = await prisma.user.create({
    data: {
      email: "talaba@demo.uz",
      passwordHash: parol,
      role: "talaba",
      fio: "Aziza Yusupova",
      muassasa: "Pedagogika instituti",
      yonalish: "Boshlang'ich ta'lim",
      kurs: 3,
      jins: "ayol",
      yashashSharoiti: "yotoqxona",
      tibbiyGuruh: "asosiy",
      groupId: guruhTajriba.id,
      consentAt: new Date(),
    },
  });

  // --- Guruhdagi boshqa talabalar (guruh statistikasi uchun) ---
  const ismlar = [
    "Jasur Toshmatov", "Malika Sobirova", "Diyor Alimov", "Kamola Ergasheva",
    "Sardor Nazarov", "Feruza Qodirova", "Otabek Yo'ldoshev", "Sevara Islomova",
  ];
  const talabalar = [talaba];
  for (let i = 0; i < ismlar.length; i++) {
    const t = await prisma.user.create({
      data: {
        email: `talaba${i + 1}@demo.uz`,
        passwordHash: parol,
        role: "talaba",
        fio: ismlar[i],
        yonalish: "Boshlang'ich ta'lim",
        kurs: 3,
        jins: i % 2 === 0 ? "erkak" : "ayol",
        groupId: i < 5 ? guruhTajriba.id : guruhNazorat.id,
        tibbiyGuruh: "asosiy",
        consentAt: new Date(),
      },
    });
    talabalar.push(t);
  }

  // --- Kunlik yozuvlar (oxirgi 14 kun) — asosiy talaba uchun realistik dinamika ---
  const namunaQadam = [5200, 6100, 4800, 7300, 8600, 9100, 5400, 6800, 7500, 8200, 9400, 6300, 7900, 8800];
  for (let i = 13; i >= 0; i--) {
    const idx = 13 - i;
    const qadam = namunaQadam[idx];
    await prisma.dailyEntry.create({
      data: {
        userId: talaba.id,
        sana: kun(-i),
        qadam,
        faolDaqiqa: Math.round(qadam / 130),
        engUzunOtirish: 50 + ((idx * 13) % 70), // 50..120
        pauzaSoni: 2 + (idx % 4),
        uyquSoat: 6.5 + (idx % 3) * 0.8,
        ekranSoat: 5 + (idx % 4),
        kayfiyatBall: 3 + (idx % 3),
        refleksiyaMatn: idx === 13 ? "Bugun binolar orasida ko'p yurdim, o'zimni yaxshi his qildim." : null,
      },
    });
  }

  // --- Boshqa talabalar uchun oxirgi 7 kun (guruh o'rtachasi uchun) ---
  for (const t of talabalar.slice(1)) {
    for (let i = 6; i >= 0; i--) {
      const base = 4000 + Math.floor(Math.random() * 6000);
      await prisma.dailyEntry.create({
        data: {
          userId: t.id,
          sana: kun(-i),
          qadam: base,
          faolDaqiqa: Math.round(base / 140),
          engUzunOtirish: 40 + Math.floor(Math.random() * 80),
          pauzaSoni: Math.floor(Math.random() * 5),
          uyquSoat: 6 + Math.random() * 3,
          ekranSoat: 4 + Math.random() * 4,
          kayfiyatBall: 2 + Math.floor(Math.random() * 4),
        },
      });
    }
  }

  // --- 10 ta namunaviy faollik kartochkasi ---
  const cards = [
    {
      raqam: 1, nomi: "Bo'yin va yelka aylanishi", turi: "gigiyenik", davomiylik: "2–3 daq.",
      joyJihoz: "Jihozsiz, o'rindan turmasdan", joyTuri: "urindan_turmasdan",
      algoritm: ["Yelkalarni 5 marta orqaga aylantiring", "Boshni sekin o'ngga va chapga buring", "Bo'yinni oldinga egib 10 soniya ushlang", "Chuqur nafas oling va bo'shashing"],
      metodikEslatma: "Uzoq yozuv yoki o'qishdan keyin bo'yin zo'riqishini yumshatadi.",
      mosFanlar: ["Pedagogika", "Psixologiya", "Tilshunoslik"],
      moslashtirilganVariant: "Cheklov bo'lsa faqat nafas mashqi va yelka harakati bilan cheklaning.",
    },
    {
      raqam: 2, nomi: "Stul yonida cho'kkalash", turi: "gigiyenik", davomiylik: "2–3 daq.",
      joyJihoz: "Stul, auditoriya", joyTuri: "auditoriya",
      algoritm: ["O'rningizdan turing", "Stulga tegquday cho'kkalang", "10 marta takrorlang", "Tempni sekinlashtirib yakunlang"],
      metodikEslatma: "Qon aylanishini tiklaydi, uzoq o'tirishdan keyin ayniqsa foydali.",
      mosFanlar: ["Jismoniy tarbiya nazariyasi", "Pedagogika"],
      moslashtirilganVariant: "Tizza muammosi bo'lsa yarim amplitudada bajaring yoki o'rnida oyoq ko'tarish bilan almashtiring.",
    },
    {
      raqam: 3, nomi: "Kognitiv sanoq estafetasi", turi: "kognitiv", davomiylik: "3–5 daq.",
      joyJihoz: "Auditoriya ichida ko'chish", joyTuri: "auditoriya",
      algoritm: ["Talabalar aylana bo'lib turishadi", "Har biri harakat bilan raqamni aytadi", "Har uchinchi raqamda cho'kkalash", "Xato qilgan qayta boshlaydi"],
      metodikEslatma: "Diqqat va harakatni birlashtiradi, mavzuga oid savollar bilan boyitish mumkin.",
      mosFanlar: ["Matematika o'qitish metodikasi", "Pedagogika"],
      moslashtirilganVariant: "Ko'chishsiz, o'rinda qo'l harakatlari bilan bajarish mumkin.",
    },
    {
      raqam: 4, nomi: "Terminlar bo'yicha yurish", turi: "kognitiv", davomiylik: "3–5 daq.",
      joyJihoz: "Auditoriya burchaklari", joyTuri: "auditoriya",
      algoritm: ["Burchaklarga javob variantlari joylashtiriladi", "O'qituvchi savol beradi", "Talaba to'g'ri burchakka yuradi", "Muhokama qilinadi"],
      metodikEslatma: "Nazariy materialni harakat bilan mustahkamlaydi.",
      mosFanlar: ["Pedagogika", "Psixologiya", "Metodika"],
      moslashtirilganVariant: "Yura olmaydiganlar qo'l bilan yo'nalish ko'rsatadi.",
    },
    {
      raqam: 5, nomi: "Pozitsiyalar (kasbiy namoyish)", turi: "kasbiy", davomiylik: "3–5 daq.",
      joyJihoz: "Auditoriya markazi", joyTuri: "auditoriya",
      algoritm: ["Talaba o'qituvchi pozitsiyasini namoyish etadi", "To'g'ri turish va imo-ishorani ko'rsatadi", "Guruh baholaydi", "Almashtiriladi"],
      metodikEslatma: "Bo'lajak o'qituvchining tana tili ko'nikmasini shakllantiradi.",
      mosFanlar: ["Pedagogik mahorat", "Nutq madaniyati"],
      moslashtirilganVariant: "O'tirgan holda yuqori tana va imo-ishora bilan namoyish.",
    },
    {
      raqam: 6, nomi: "Doskagacha faol yo'l", turi: "kasbiy", davomiylik: "2–3 daq.",
      joyJihoz: "Auditoriya", joyTuri: "auditoriya",
      algoritm: ["Talaba doskaga yozish uchun chaqiriladi", "Yo'lda 3 ta cho'kkalash bajaradi", "Vazifani yozadi", "Joyiga faol qadam bilan qaytadi"],
      metodikEslatma: "Odatiy doska ishini mikrofaollik pauzasiga aylantiradi.",
      mosFanlar: ["Matematika", "Ona tili", "Tabiiy fanlar"],
      moslashtirilganVariant: "Cho'kkalashsiz, shunchaki faol tez yurish.",
    },
    {
      raqam: 7, nomi: "Ko'z gimnastikasi", turi: "gigiyenik", davomiylik: "2–3 daq.",
      joyJihoz: "Jihozsiz, o'rinda", joyTuri: "urindan_turmasdan",
      algoritm: ["20 soniya uzoqqa qarang", "Ko'zni 10 marta pirpiratng", "Ko'zni yumib doira chizing", "Kaftni isitib ko'zga bosing"],
      metodikEslatma: "Ekran vaqti ko'p bo'lgan mashg'ulotlarda ko'z charchog'ini kamaytiradi.",
      mosFanlar: ["Informatika", "Barcha fanlar"],
      moslashtirilganVariant: "Barcha uchun mos, cheklovsiz.",
    },
    {
      raqam: 8, nomi: "Guruhli cho'zilish zanjiri", turi: "gigiyenik", davomiylik: "3–5 daq.",
      joyJihoz: "Auditoriya, ochiq joy", joyTuri: "auditoriya",
      algoritm: ["Talabalar qatorga turadi", "Birinchi cho'zilish harakatini boshlaydi", "Keyingisi takrorlab yangisini qo'shadi", "Zanjir davom etadi"],
      metodikEslatma: "Jamoaviy hamkorlik va yengil cho'zilishni birlashtiradi.",
      mosFanlar: ["Jismoniy tarbiya", "Pedagogika"],
      moslashtirilganVariant: "O'tirgan holda qo'l va yuqori tana cho'zilishi bilan.",
    },
    {
      raqam: 9, nomi: "45+5 mustaqil ish rejimi", turi: "kognitiv", davomiylik: "5 daq.",
      joyJihoz: "Kutubxona, uy", joyTuri: "urindan_turmasdan",
      algoritm: ["45 daqiqa diqqat bilan ishlang", "Taymer signalida turing", "5 daqiqa yuring yoki cho'z(iling)", "Yangi 45 daqiqani boshlang"],
      metodikEslatma: "Mustaqil ta'lim davridagi uzluksiz o'tirishni bo'g'adi (faollik uzilishining oldini oladi).",
      mosFanlar: ["Barcha fanlar (mustaqil ta'lim)"],
      moslashtirilganVariant: "Harakat o'rniga o'rinda cho'zilish va nafas mashqi.",
    },
    {
      raqam: 10, nomi: "Zinapoya do'sti", turi: "kasbiy", davomiylik: "3 daq.",
      joyJihoz: "Bino zinapoyasi", joyTuri: "tanaffus_ochiq_havo",
      algoritm: ["Liftdan voz keching", "Zinadan bir qavat ko'tariling", "Nafasni kuzating", "Tanaffusda takrorlang"],
      metodikEslatma: "Binolar orasidagi ko'chishni kunlik faollikka qo'shadi.",
      mosFanlar: ["Barcha fanlar", "Amaliyot"],
      moslashtirilganVariant: "Cheklov bo'lsa tekis yo'lda faol yurish bilan almashtiring.",
    },
  ];

  for (const c of cards) {
    await prisma.card.create({
      data: {
        raqam: c.raqam,
        nomi: c.nomi,
        turi: c.turi,
        davomiylik: c.davomiylik,
        joyJihoz: c.joyJihoz,
        joyTuri: c.joyTuri,
        algoritm: JSON.stringify(c.algoritm),
        metodikEslatma: c.metodikEslatma,
        mosFanlar: JSON.stringify(c.mosFanlar),
        moslashtirilganVariant: c.moslashtirilganVariant,
      },
    });
  }

  // --- Dars jadvali (tajriba guruhi) — ketma-ket mashg'ulotlar uzilish hosil qiladi ---
  const jadval: Record<string, { nomi: string; boshlanish: string; tugash: string }[]> = {
    Dushanba: [
      { nomi: "Pedagogika", boshlanish: "08:30", tugash: "09:50" },
      { nomi: "Psixologiya", boshlanish: "10:00", tugash: "11:20" },
      { nomi: "Matematika o'qitish metodikasi", boshlanish: "11:30", tugash: "12:50" },
      { nomi: "Informatika", boshlanish: "14:00", tugash: "15:20" },
    ],
    Seshanba: [
      { nomi: "Ona tili o'qitish metodikasi", boshlanish: "08:30", tugash: "09:50" },
      { nomi: "Tarbiyaviy ish metodikasi", boshlanish: "10:00", tugash: "11:20" },
      { nomi: "Pedagogik mahorat", boshlanish: "11:30", tugash: "12:50" },
    ],
    Chorshanba: [
      { nomi: "Falsafa", boshlanish: "08:30", tugash: "09:50" },
      { nomi: "Tabiatshunoslik asoslari", boshlanish: "10:00", tugash: "11:20" },
      { nomi: "Jismoniy tarbiya nazariyasi", boshlanish: "11:30", tugash: "12:50" },
      { nomi: "Nutq madaniyati", boshlanish: "13:00", tugash: "14:20" },
    ],
    Payshanba: [
      { nomi: "Chet tili", boshlanish: "08:30", tugash: "09:50" },
      { nomi: "Pedagogika tarixi", boshlanish: "10:00", tugash: "11:20" },
    ],
    Juma: [
      { nomi: "Yosh fiziologiyasi va gigiyena", boshlanish: "08:30", tugash: "09:50" },
      { nomi: "Ta'lim texnologiyalari", boshlanish: "10:00", tugash: "11:20" },
      { nomi: "Mustaqil ta'lim (seminar)", boshlanish: "11:30", tugash: "12:50" },
    ],
  };
  for (const [kun, darslar] of Object.entries(jadval)) {
    // Tanaffuslarni darslar orasidagi bo'shliqdan hosil qilish
    const tanaffuslar: { boshlanish: string; tugash: string }[] = [];
    for (let i = 0; i < darslar.length - 1; i++) {
      tanaffuslar.push({ boshlanish: darslar[i].tugash, tugash: darslar[i + 1].boshlanish });
    }
    await prisma.schedule.create({
      data: {
        groupId: guruhTajriba.id,
        kun,
        mashgulotSoatlari: JSON.stringify(darslar),
        tanaffuslar: JSON.stringify(tanaffuslar),
      },
    });
  }

  // --- O'quv moduli: 9 mavzu (2 kredit, 60 soat: 16 ma'ruza + 24 amaliy + 20 mustaqil) ---
  // Real video-ma'ruzalar (tekshirilgan YouTube manbalari) — qolganlarini admin qo'shadi
  const mavzuVideo: Record<number, string> = {
    1: "https://www.youtube.com/watch?v=aUaInS6HIGo", // Dr. Mike Evans — 23 1/2 hours (jismoniy faollik)
    2: "https://www.youtube.com/watch?v=wUEl8KrMz14", // TED-Ed — Why sitting is bad for you
    8: "https://www.youtube.com/watch?v=dqONk48l5vY", // TED-Ed — What would happen if you didn't sleep?
  };
  const mavzular = [
    {
      nomi: "Jismoniy faollik: tushuncha, turlari, me'yorlari va salomatlikka ta'siri",
      kartochkaRaqamlar: [1, 7],
      selfCheck: [
        { savol: "Jismoniy faollik me'yori (hafta) qancha?", variantlar: ["50 daq.", "150–300 daq.", "1000 daq."], togri: 1 },
        { savol: "Kunlik qadam mo'ljali?", variantlar: ["8000+", "2000", "500"], togri: 0 },
      ],
      topshiriq: "Bir hafta davomida o'z faolligingizni kuzatib, xalqaro me'yorlar bilan taqqoslang.",
    },
    {
      nomi: "O'tirg'ich xulq-atvor va uning ta'lim jarayonidagi ko'rinishlari",
      kartochkaRaqamlar: [2, 9],
      selfCheck: [
        { savol: "O'tirg'ich xulq MET chegarasi?", variantlar: ["1,5 MET", "5 MET", "10 MET"], togri: 0 },
        { savol: "Faollik uzilishi chegarasi?", variantlar: ["60 daqiqa", "10 daqiqa", "3 soat"], togri: 0 },
      ],
      topshiriq: "Dars jadvalingizdagi eng uzun uzluksiz o'tirish oralig'ini aniqlang.",
    },
    {
      nomi: "Talabaning kundalik harakat profili: monitoring usullari",
      kartochkaRaqamlar: [10],
      selfCheck: [{ savol: "Monitoringdan keyingi bo'g'in?", variantlar: ["Teskari aloqa", "Rag'bat"], togri: 0 }],
      topshiriq: "Kundalikni 5 kun to'ldiring va haftalik profilni tahlil qiling.",
    },
    {
      nomi: "Raqamli vositalar: imkoniyatlari, cheklovlari va maxfiylik masalalari",
      kartochkaRaqamlar: [7],
      selfCheck: [{ savol: "Guruh hisoboti qanday bo'ladi?", variantlar: ["Anonim/umumlashgan", "Ism bilan"], togri: 0 }],
      topshiriq: "Raqamli vositalar maxfiyligi bo'yicha qisqa esse yozing.",
    },
    {
      nomi: "Maqsad qo'yish, teskari aloqa va xulq-atvorni o'zgartirish texnikalari",
      kartochkaRaqamlar: [],
      selfCheck: [{ savol: "Tavsiya etilgan o'sish?", variantlar: ["10–15%", "100%"], togri: 0 }],
      topshiriq: "O'zingizga bosqichli (10–15%) haftalik maqsad qo'ying va asoslang.",
    },
    {
      nomi: "Mikrofaollik texnologiyasi: pauzalar turlari va o'tkazish metodikasi",
      kartochkaRaqamlar: [3, 4, 5, 6, 8],
      selfCheck: [{ savol: "Pauza qanchalik tez-tez?", variantlar: ["Har 45–60 daq.", "Kuniga 1 marta"], togri: 0 }],
      topshiriq: "Uch turdagi (gigiyenik/kognitiv/kasbiy) pauzadan bittadan tanlab, algoritmini yozing.",
    },
    {
      nomi: "Maktabda o'quvchilar harakat rejimini tashkil etish metodikasi",
      kartochkaRaqamlar: [3, 6],
      selfCheck: [{ savol: "Bo'lajak o'qituvchi mas'uliyati?", variantlar: ["O'quvchilar harakat rejimi", "Faqat baho"], togri: 0 }],
      topshiriq: "Boshlang'ich sinf darsi uchun mikrofaollik pauzasi rejasini tuzing.",
    },
    {
      nomi: "Faollik, uyqu va ekran vaqti: kundalik rejim yaxlitligi",
      kartochkaRaqamlar: [7],
      selfCheck: [{ savol: "Uyqu me'yori?", variantlar: ["7–9 soat", "4–5 soat"], togri: 0 }],
      topshiriq: "Bir haftalik uyqu va ekran vaqtingizni tahlil qilib, xulosa yozing.",
    },
    {
      nomi: "Individual harakat rejasini loyihalash va refleksiya",
      kartochkaRaqamlar: [9, 10],
      selfCheck: [{ savol: "Refleksiya vazifasi?", variantlar: ["Tahlil + maqsad", "Faqat ball"], togri: 0 }],
      topshiriq: "O'zingiz uchun 4 haftalik individual harakat rejasini loyihalang.",
    },
  ];
  const soatlar = [
    { m: 2, a: 3, mus: 2 }, { m: 2, a: 3, mus: 2 }, { m: 2, a: 3, mus: 3 },
    { m: 2, a: 2, mus: 2 }, { m: 2, a: 3, mus: 2 }, { m: 2, a: 4, mus: 3 },
    { m: 2, a: 2, mus: 2 }, { m: 1, a: 2, mus: 2 }, { m: 1, a: 2, mus: 2 },
  ];
  for (let i = 0; i < mavzular.length; i++) {
    const mv = mavzular[i];
    await prisma.courseTopic.create({
      data: {
        tartib: i + 1,
        nomi: mv.nomi,
        maruzaSoat: soatlar[i].m,
        amaliySoat: soatlar[i].a,
        mustaqilSoat: soatlar[i].mus,
        kontent: JSON.stringify({
          video: mavzuVideo[i + 1] ?? "",
          taqdimot: "",
          kartochkaRaqamlar: mv.kartochkaRaqamlar,
          selfCheck: mv.selfCheck,
          topshiriq: mv.topshiriq,
        }),
      },
    });
  }

  // --- Nishonlar ---
  await prisma.badge.createMany({
    data: [
      { kod: "muntazam_kuzatuvchi", nomi: "Muntazam kuzatuvchi", shart: "4 hafta uzluksiz monitoring", ikonka: "📅" },
      { kod: "zinapoya_dosti", nomi: "Zinapoya do'sti", shart: "Liftdan voz kechish odati", ikonka: "🪜" },
      { kod: "faol_tanaffus", nomi: "Faol tanaffus tashkilotchisi", shart: "Tanaffusda faol harakat", ikonka: "🤸" },
      { kod: "pauza_ustasi", nomi: "Pauza ustasi", shart: "Eng ko'p va sifatli mikrofaollik pauzasi", ikonka: "⏱️" },
    ],
  });

  // --- Chellenj: «Guruh qadami» (2 hafta, guruhiy) ---
  const chBosh = kun(-3);
  const chTug = kun(11); // ~2 hafta
  await prisma.challenge.create({
    data: {
      nomi: "Guruh qadami",
      boshlanish: chBosh,
      tugash: chTug,
      tur: "guruh",
      qoidalar: JSON.stringify([
        "2 hafta davomida guruhlarning o'rtacha kunlik qadamlar soni taqqoslanadi",
        "Individual emas — guruhiy format (kuchsiz ishtirokchi chetlashtirilmaydi)",
        "Natija shaxsiy va guruh dinamikasi bo'yicha baholanadi",
        "Rag'bat moddiy emas — ijtimoiy e'tirof",
      ]),
    },
  });

  console.log("✅ Seed tugadi.");
  console.log("Demo hisoblar (parol hammasi uchun: demo1234):");
  console.log("  talaba@demo.uz | oqituvchi@demo.uz | tyutor@demo.uz | admin@demo.uz");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
