// Bilim testi banki (25 topshiriq × 4 ball = 100). SERVER-ONLY —
// bu fayl mijozga yuborilmaydi; javob kalitlari faqat serverda (administratorda).
import "server-only";

export interface TestSavol {
  savol: string;
  variantlar: string[];
  togri: number; // to'g'ri variant indeksi (0..3)
}

export const HAR_SAVOL_BALL = 4;

export const TEST_BANK: TestSavol[] = [
  {
    savol: "Jismoniy faollik deganda nima tushuniladi?",
    variantlar: [
      "Faqat sport bilan shug'ullanish",
      "Skelet mushaklari qisqarishi natijasida energiya sarfini oshiradigan har qanday tana harakati",
      "Ovqatlanish rejimini nazorat qilish",
      "Uyquni tartibga solish",
    ],
    togri: 1,
  },
  {
    savol: "O'tirg'ich xulq-atvor (sedentary behavior) qanday holat?",
    variantlar: [
      "Uyqu holati",
      "Yugurish paytidagi holat",
      "Uyg'oq holatda energiya sarfi 1,5 MET dan oshmaydigan xulq",
      "Og'ir jismoniy mehnat",
    ],
    togri: 2,
  },
  {
    savol: "Kattalar uchun haftalik o'rtacha jadallikdagi faollik me'yori qancha?",
    variantlar: ["30–60 daqiqa", "150–300 daqiqa", "500–700 daqiqa", "10–20 daqiqa"],
    togri: 1,
  },
  {
    savol: "Kunlik tavsiya etilgan qadamlar soni odatda qancha?",
    variantlar: ["2 000 dan kam", "8 000 va undan ko'p", "20 000 dan kam bo'lmasin", "Ahamiyati yo'q"],
    togri: 1,
  },
  {
    savol: "«Faollik uzilishi» qanday oraliq deb belgilanadi?",
    variantlar: [
      "Uzluksiz o'tirish 60 daqiqadan oshgan oraliq",
      "10 daqiqalik tanaffus",
      "Ovqatlanish vaqti",
      "Uyqu davri",
    ],
    togri: 0,
  },
  {
    savol: "Mikrofaollik pauzalari qanchalik tez-tez tavsiya etiladi?",
    variantlar: ["Kuniga bir marta", "Har 45–60 daqiqada", "Har 5 daqiqada", "Haftada bir marta"],
    togri: 1,
  },
  {
    savol: "Nima uchun kechqurungi bir soatlik mashg'ulot kunlik uzoq o'tirishni to'liq qoplamaydi?",
    variantlar: [
      "Chunki mashg'ulot juda qisqa",
      "Uzoq uzluksiz o'tirishning salbiy ta'siri alohida bo'lib, harakatsizlikni bo'lib turish muhim",
      "Chunki kechqurun mashq foydasiz",
      "Qoplaydi, farqi yo'q",
    ],
    togri: 1,
  },
  {
    savol: "Mikrofaollik texnologiyasining asosiy belgisi qaysi?",
    variantlar: [
      "Uzoq davomli mashg'ulot",
      "Mashg'ulot tuzilmasiga singdirilgan, qisqa va aniq didaktik vazifaga ega harakat pauzalari",
      "Faqat tanaffusdagi o'yinlar",
      "Uy vazifasi",
    ],
    togri: 1,
  },
  {
    savol: "Tavsiya etilgan kunlik uyqu davomiyligi (kattalar uchun) qancha?",
    variantlar: ["4–5 soat", "7–9 soat", "10–12 soat", "Ahamiyati yo'q"],
    togri: 1,
  },
  {
    savol: "Faol daqiqalar deganda nima nazarda tutiladi?",
    variantlar: [
      "O'tirib o'tkazilgan vaqt",
      "O'rtacha yoki yuqori jadallikdagi harakat bilan o'tgan vaqt",
      "Uyqu vaqti",
      "Ekran oldidagi vaqt",
    ],
    togri: 1,
  },
  {
    savol: "«45+5» rejimi nimani anglatadi?",
    variantlar: [
      "45 daqiqa dam — 5 daqiqa ish",
      "45 daqiqa ish — 5 daqiqa harakat/dam",
      "45 soniya mashq",
      "Kuniga 45 daqiqa yugurish",
    ],
    togri: 1,
  },
  {
    savol: "Bo'lajak o'qituvchi uchun harakat rejimini bilishning kasbiy ahamiyati nimada?",
    variantlar: [
      "Ahamiyati yo'q",
      "Kelajakda o'quvchilar harakat rejimini to'g'ri tashkil eta olishi uchun",
      "Faqat shaxsiy salomatlik uchun",
      "Faqat imtihon uchun",
    ],
    togri: 1,
  },
  {
    savol: "Monitoring bo'g'inidan keyin yopiq halqada qaysi bo'g'in keladi?",
    variantlar: ["Rag'bat", "Teskari aloqa", "Refleksiya", "Mikrofaollik"],
    togri: 1,
  },
  {
    savol: "Maqsad qo'yishda tavsiya etilgan bosqichli o'sish qancha?",
    variantlar: ["50–100%", "10–15%", "0%", "2 barobar"],
    togri: 1,
  },
  {
    savol: "Ekran vaqti ortishi bilan bog'liq eng keng tarqalgan xavf qaysi?",
    variantlar: [
      "Ko'z charchog'i va harakatsizlikning ortishi",
      "Ovqat hazmi yaxshilanishi",
      "Uyqu sifatining oshishi",
      "Jismoniy faollikning ortishi",
    ],
    togri: 0,
  },
  {
    savol: "Guruh chellenji (masalan «Guruh qadami») nima uchun individual emas, guruhiy formatda o'tkaziladi?",
    variantlar: [
      "Hisoblash oson bo'lishi uchun",
      "Kuchsiz ishtirokchini chetlashtirmaslik va hamkorlikni rag'batlantirish uchun",
      "G'olibni aniqlash oson bo'lishi uchun",
      "Sovrin uchun",
    ],
    togri: 1,
  },
  {
    savol: "Platformada rag'bat qanday shaklda beriladi?",
    variantlar: ["Pul mukofoti", "Ijtimoiy e'tirof (nishon, e'tirof)", "Baho oshirish", "Imtiyoz"],
    togri: 1,
  },
  {
    savol: "Refleksiya bo'g'inining asosiy vazifasi nima?",
    variantlar: [
      "Ma'lumot yig'ish",
      "Profilni tahlil qilib, sabab aniqlash va keyingi maqsad qo'yish",
      "Faqat ball qo'yish",
      "Kartochka tanlash",
    ],
    togri: 1,
  },
  {
    savol: "Auditoriyada o'tkaziladigan kognitiv-faollashtiruvchi pauza qanday xususiyatga ega?",
    variantlar: [
      "Faqat jismoniy yuklama",
      "Harakatni o'quv mazmuni bilan birlashtiradi",
      "Dam olishga mo'ljallangan",
      "Faqat nafas mashqi",
    ],
    togri: 1,
  },
  {
    savol: "Sog'liq cheklovi bo'lgan talaba uchun kartochkadan qanday foydalaniladi?",
    variantlar: [
      "U mashg'ulotdan ozod qilinadi",
      "Kartochkaning moslashtirilgan variantidan foydalaniladi, hech kim ajratilmaydi",
      "U alohida o'tiradi",
      "Umuman qatnashmaydi",
    ],
    togri: 1,
  },
  {
    savol: "Triangulyatsiya baholashda nimani anglatadi?",
    variantlar: [
      "Uchta talabani taqqoslash",
      "Talaba yozuvi, qurilma ma'lumoti va kuzatuv/ekspert bahosini taqqoslash",
      "Uch marta imtihon",
      "Uchburchak chizish",
    ],
    togri: 1,
  },
  {
    savol: "Platformada asosan nima baholanadi?",
    variantlar: [
      "Mutlaq qadamlar soni",
      "Monitoringning muntazamligi, tahlil sifati va metodik ko'nikma",
      "Faqat test natijasi",
      "Jismoniy tayyorgarlik darajasi",
    ],
    togri: 1,
  },
  {
    savol: "Liftdan voz kechib zinapoyadan foydalanish qaysi faollik sathiga tegishli?",
    variantlar: [
      "Tiklanish faolligi",
      "Kampus va ko'chish (transport) faolligi",
      "Uyqu",
      "Ekran vaqti",
    ],
    togri: 1,
  },
  {
    savol: "O'qituvchining kuzatuv kartasi nima uchun kerak?",
    variantlar: [
      "Talabalarni jazolash uchun",
      "Mashg'ulotdagi pauzani (o'tkazildi/turi/ishtirok) qayd etib, tahlil uchun asos yaratish",
      "Baho qo'yish uchun",
      "Davomat uchun",
    ],
    togri: 1,
  },
  {
    savol: "Maxfiylik nuqtai nazaridan guruh hisoboti qanday ko'rsatkichlarni chiqaradi?",
    variantlar: [
      "Har bir talabaning ismi va natijasi",
      "Faqat umumlashtirilgan va shaxssizlashtirilgan ko'rsatkichlar",
      "Reyting jadvali (ism bilan)",
      "Shaxsiy tibbiy ma'lumot",
    ],
    togri: 1,
  },
];
