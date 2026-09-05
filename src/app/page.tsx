import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import TilSwitcher from "@/components/TilSwitcher";
import YopiqHalqa from "@/components/YopiqHalqa";
import { NORMS, TORT_SATH } from "@/lib/constants";
import { son } from "@/lib/utils";
import { getT } from "@/lib/til-server";

export default async function LandingPage() {
  const { t } = await getT();
  return (
    <div className="min-h-screen">
      {/* Sarlavha paneli */}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: "var(--chegara)", backgroundColor: "color-mix(in srgb, var(--fon) 85%, transparent)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">◎</span>
            <span className="font-bold leading-tight">{t("app.nom")}</span>
          </div>
          <div className="flex items-center gap-2">
            <TilSwitcher />
            <ThemeToggle />
            <Link href="/kirish" className="btn-ikkinchi">{t("common.kirish")}</Link>
            <Link href="/royxat" className="btn-asosiy hidden sm:inline-flex">{t("common.royxat")}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
              {t("landing.badge")}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              {t("landing.hero.oldi")}<span className="text-brand-600">{t("landing.hero.brand")}</span>
            </h1>
            <p className="mt-4 text-lg yumshoq">{t("landing.hero.matn")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kirish?demo=1" className="btn-asosiy text-base">{t("landing.hero.demo")}</Link>
              <Link href="#halqa" className="btn-ikkinchi text-base">{t("landing.hero.ilmiy")}</Link>
            </div>
            <p className="mt-3 text-sm yumshoq">
              {t("landing.hero.demoHisob")} <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">talaba@demo.uz</code> / <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">demo1234</code>
            </p>
          </div>
          <div className="karta p-6">
            <YopiqHalqa compact />
            <p className="mt-2 text-center text-sm yumshoq">{t("landing.hero.halqa")}</p>
          </div>
        </div>
      </section>

      {/* Xalqaro me'yorlar */}
      <section className="border-y" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold">{t("landing.meyor.sarlavha")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center yumshoq">{t("landing.meyor.matn")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MeyorKarta rang="ok" katta={`${NORMS.FAOL_DAQIQA_HAFTALIK_MIN}–${NORMS.FAOL_DAQIQA_HAFTALIK_MAX}`} birlik={t("landing.meyor.faolBirlik")} tavsif={t("landing.meyor.faol")} />
            <MeyorKarta rang="brand" katta={`${son(NORMS.QADAM_KUNLIK)}+`} birlik={t("landing.meyor.qadamBirlik")} tavsif={t("landing.meyor.qadam")} />
            <MeyorKarta rang="warn" katta={`< ${NORMS.OTIRISH_CHEGARA}`} birlik={t("landing.meyor.otirishBirlik")} tavsif={t("landing.meyor.otirish")} />
          </div>
        </div>
      </section>

      {/* Nega */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="karta p-6 sm:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">{t("landing.nega.sarlavha")}</h2>
          <p className="mt-4 yumshoq">{t("landing.nega.matn")}</p>
        </div>
      </section>

      {/* Yopiq halqa */}
      <section id="halqa" className="border-y" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold">{t("landing.halqa.sarlavha")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center yumshoq">{t("landing.halqa.matn")}</p>
          <div className="mt-8"><YopiqHalqa /></div>
        </div>
      </section>

      {/* To'rt sath */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">{t("landing.sath.sarlavha")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center yumshoq">{t("landing.sath.matn")}</p>
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
          {/* Loyiha muallifi */}
          <div className="karta mb-6 border-l-4 border-l-brand-500 p-5">
            <h3 className="font-bold">{t("muallif.sarlavha")}</h3>
            <p className="mt-1 yumshoq">{t("muallif.matn")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-bold">{t("landing.loyiha.sarlavha")}</h3>
              <p className="mt-2 text-sm yumshoq">{t("landing.loyiha.matn")}</p>
            </div>
            <div>
              <h3 className="font-bold">{t("landing.etika.sarlavha")}</h3>
              <p className="mt-2 text-sm yumshoq">{t("landing.etika.matn")}</p>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm yumshoq" style={{ borderColor: "var(--chegara)" }}>
            {t("landing.footer")}
          </div>
        </div>
      </section>
    </div>
  );
}

function MeyorKarta({ rang, katta, birlik, tavsif }: { rang: string; katta: string; birlik: string; tavsif: string }) {
  const rangKlass: Record<string, string> = { ok: "text-ok", warn: "text-warn", brand: "text-brand-600" };
  return (
    <div className="karta p-6 text-center">
      <div className={`text-4xl font-extrabold ${rangKlass[rang]}`}>{katta}</div>
      <div className="mt-1 font-medium">{birlik}</div>
      <div className="mt-2 text-sm yumshoq">{tavsif}</div>
    </div>
  );
}
