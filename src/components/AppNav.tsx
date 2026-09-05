"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import TilSwitcher from "./TilSwitcher";
import { useT } from "./LangProvider";
import { type Rol } from "@/lib/constants";

interface NavItem {
  href: string;
  kalit: string;
  ikonka: string;
  rollar: Rol[];
}

const ITEMS: NavItem[] = [
  { href: "/boshqaruv", kalit: "nav.boshqaruv", ikonka: "🏠", rollar: ["talaba", "oqituvchi", "tyutor", "admin"] },
  { href: "/kundalik", kalit: "nav.kundalik", ikonka: "📝", rollar: ["talaba"] },
  { href: "/profil", kalit: "nav.profil", ikonka: "📈", rollar: ["talaba"] },
  { href: "/maqsad", kalit: "nav.maqsad", ikonka: "🎯", rollar: ["talaba"] },
  { href: "/uzilishlar", kalit: "nav.uzilishlar", ikonka: "⏱️", rollar: ["talaba", "tyutor", "admin"] },
  { href: "/modul", kalit: "nav.modul", ikonka: "📚", rollar: ["talaba", "admin"] },
  { href: "/diagnostika", kalit: "nav.diagnostika", ikonka: "🧪", rollar: ["talaba"] },
  { href: "/baholash", kalit: "nav.baholash", ikonka: "🏅", rollar: ["talaba", "tyutor", "admin"] },
  { href: "/gamifikatsiya", kalit: "nav.ragbat", ikonka: "🏆", rollar: ["talaba"] },
  { href: "/panel", kalit: "nav.panel", ikonka: "📋", rollar: ["oqituvchi", "admin"] },
  { href: "/hisobot", kalit: "nav.hisobot", ikonka: "📊", rollar: ["tyutor", "admin"] },
  { href: "/kafedra", kalit: "nav.kafedra", ikonka: "🏛️", rollar: ["admin"] },
  { href: "/kontent", kalit: "nav.kontent", ikonka: "✏️", rollar: ["admin"] },
  { href: "/kartochkalar", kalit: "nav.kartochka", ikonka: "🃏", rollar: ["talaba", "oqituvchi", "tyutor", "admin"] },
];

export default function AppNav({ fio, role }: { fio: string; role: Rol }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useT();
  const items = ITEMS.filter((i) => i.rollar.includes(role));

  async function chiqish() {
    await fetch("/api/auth/chiqish", { method: "POST" });
    router.push("/kirish");
    router.refresh();
  }

  const faol = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
      {/* Yuqori qator */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
        <Link href="/boshqaruv" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">◎</span>
          <span className="font-bold leading-tight">Raqamli faollik muhiti</span>
        </Link>
        <div className="flex items-center gap-2">
          <TilSwitcher />
          <ThemeToggle />
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight">{fio}</div>
            <div className="text-xs yumshoq">{t(`role.${role}`)}</div>
          </div>
          <button onClick={chiqish} className="btn-ikkinchi !px-3 !py-2 text-sm" title={t("common.chiqish")}>{t("common.chiqish")}</button>
        </div>
      </div>

      {/* Navigatsiya (gorizontal aylanadigan) */}
      <nav className="mx-auto max-w-6xl overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-center gap-1">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                faol(i.href) ? "bg-brand-600 text-white" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span>{i.ikonka}</span>
              {t(i.kalit)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
