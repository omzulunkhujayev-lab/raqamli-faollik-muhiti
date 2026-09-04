import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import YopiqHalqa from "@/components/YopiqHalqa";
import { NORMS, TORT_SATH } from "@/lib/constants";
import { son } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Sarlavha paneli */}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: "var(--chegara)", backgroundColor: "color-mix(in srgb, var(--fon) 85%, transparent)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">◎</span>
            <span className="font-bold leading-tight">Raqamli faollik<br className="hidden sm:block" /> muhiti</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/kirish" className="btn-ikkinchi">Kirish</Link>
            <Link href="/royxat" className="btn-asosiy hidden sm:inline-flex">Ro'yxatdan o'tish</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
              Ilmiy-pedagogik metodikaning raqamli ta'minoti
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              Talaba faolligini <span className="text-brand-600">o'lchash, anglatish va o'quv jarayoniga singdirish</span>
            </h1>
            <p className="mt-4 text-lg yumshoq">
              Pedagogika yo'nalishi talabalarining ta'lim jarayonidagi jismoniy faolligini
              monitoring qilish, rivojlantirish va baholash uchun yaxlit muhit. Bu shunchaki
              fitness-treker emas — o'quv jarayoniga singdirilgan pedagogik tizim.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kirish?demo=1" className="btn-asosiy text-base">Demo-rejimga kirish →</Link>
              <Link href="#halqa" className="btn-ikkinchi text-base">Ilmiy asos bilan tanishish</Link>
            </div>
            <p className="mt-3 text-sm yumshoq">
              Demo hisob: <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">talaba@demo.uz</code> / <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">demo1234</code>
            </p>
          </div>
          <div className="karta p-6">
            <YopiqHalqa compact />
            <p className="mt-2 text-center text-sm yumshoq">
              Platformaning o'zagi — uzluksiz takrorlanuvchi <b>yopiq halqa</b>
            </p>
          </div>
        </div>
      </section>

      {/* Xalqaro me'yorlar infografikasi */}
      <section className="border-y" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold">Xalqaro me'yorlar</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center yumshoq">
            Platforma quyidagi tavsiya etilgan ko'rsatkichlarga tayanadi
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MeyorKarta rang="ok" katta={`${NORMS.FAOL_DAQIQA_HAFTALIK_MIN}–${NORMS.FAOL_DAQIQA_HAFTALIK_MAX}`} birlik="daqiqa / hafta" tavsif="O'rtacha jadallikdagi jismoniy faollik" />
            <MeyorKarta rang="brand" katta={`${son(NORMS.QADAM_KUNLIK)}+`} birlik="qadam / kun" tavsif="Kunlik harakat hajmi mo'ljali" />
            <MeyorKarta rang="warn" katta={`< ${NORMS.OTIRISH_CHEGARA}`} birlik="daqiqa" tavsif="Uzluksiz o'tirishning yuqori chegarasi" />
          </div>
        </div>
      </section>

      {/* Nima uchun kechqurungi mashg'ulot yetarli emas */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="karta p-6 sm:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">
            Nima uchun kechqurungi bir soatlik mashg'ulot kunlik sakkiz soatlik o'tirishni qoplamaydi?
          </h2>
          <p className="mt-4 yumshoq">
            Uzoq davom etadigan uzluksiz o'tirish (<b>o'tirg'ich xulq-atvor</b>) organizmga alohida
            salbiy ta'sir ko'rsatadi va bu ta'sir kun oxiridagi bitta mashg'ulot bilan to'liq
            yo'qolmaydi. Muhimi — harakatsizlikni <b>bo'lib turish</b>: har 45–60 daqiqada qisqa
            faollik pauzasi qilish. Shuning uchun platforma nafaqat umumiy faollikni, balki
            <b> faollik uzilishlarini</b> (uzluksiz o'tirish 60 daqiqadan oshgan oraliqlar) ham
            kuzatadi va ularni <b>mikrofaollik</b> orqali to'ldirishni taklif qiladi.
          </p>
        </div>
      </section>

      {/* Yopiq halqa to'liq */}
      <section id="halqa" className="border-y" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold">Yopiq halqa: tizimning o'zagi</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center yumshoq">
            Har bir bo'g'in keyingisini ta'minlaydi. Biror bo'g'in ishlamasa, butun tizim samarasiz bo'ladi.
          </p>
          <div className="mt-8">
            <YopiqHalqa />
          </div>
        </div>
      </section>

      {/* To'rt sath */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">Faollikning to'rt sathi</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center yumshoq">Ma'lumotlar shu kesimda tahlil qilinadi</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TORT_SATH.map((s, i) => (
            <div key={i} className="karta p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {["🎓", "📚", "🚶", "🌙"][i]}
              </div>
              <p className="mt-3 font-medium">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Muallif / etika */}
      <section className="border-t" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-bold">Loyiha haqida</h3>
              <p className="mt-2 text-sm yumshoq">
                Dissertatsiya tadqiqoti doirasidagi ilmiy-amaliy platforma. Muallif va ilmiy rahbar
                ma'lumotlari sozlamalar bo'limida ko'rsatiladi.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Etik kafolat</h3>
              <p className="mt-2 text-sm yumshoq">
                Ishtirok ixtiyoriy. Mutlaq jismoniy ko'rsatkichlar baholanmaydi — baholanadigan narsa
                monitoringning muntazamligi va tahlil sifatidir. Platforma tibbiy tashxis qo'ymaydi.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm yumshoq" style={{ borderColor: "var(--chegara)" }}>
            © 2026 Raqamli faollik muhiti · Ta'limiy maqsadlarda
          </div>
        </div>
      </section>
    </div>
  );
}

function MeyorKarta({ rang, katta, birlik, tavsif }: { rang: string; katta: string; birlik: string; tavsif: string }) {
  const rangKlass: Record<string, string> = {
    ok: "text-ok",
    warn: "text-warn",
    brand: "text-brand-600",
  };
  return (
    <div className="karta p-6 text-center">
      <div className={`text-4xl font-extrabold ${rangKlass[rang]}`}>{katta}</div>
      <div className="mt-1 font-medium">{birlik}</div>
      <div className="mt-2 text-sm yumshoq">{tavsif}</div>
    </div>
  );
}
