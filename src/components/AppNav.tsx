"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { ROLLAR, type Rol } from "@/lib/constants";

interface NavItem {
  href: string;
  nomi: string;
  ikonka: string;
  rollar: Rol[];
}

const ITEMS: NavItem[] = [
  { href: "/boshqaruv", nomi: "Boshqaruv", ikonka: "🏠", rollar: ["talaba", "oqituvchi", "tyutor", "admin"] },
  { href: "/kundalik", nomi: "Kundalik", ikonka: "📝", rollar: ["talaba"] },
  { href: "/profil", nomi: "Profil", ikonka: "📈", rollar: ["talaba"] },
  { href: "/maqsad", nomi: "Maqsad", ikonka: "🎯", rollar: ["talaba"] },
  { href: "/uzilishlar", nomi: "Uzilishlar", ikonka: "⏱️", rollar: ["talaba", "tyutor", "admin"] },
  { href: "/modul", nomi: "Modul", ikonka: "📚", rollar: ["talaba", "admin"] },
  { href: "/diagnostika", nomi: "Diagnostika", ikonka: "🧪", rollar: ["talaba"] },
  { href: "/baholash", nomi: "Baholash", ikonka: "🏅", rollar: ["talaba", "tyutor", "admin"] },
  { href: "/gamifikatsiya", nomi: "Rag'bat", ikonka: "🏆", rollar: ["talaba"] },
  { href: "/panel", nomi: "Panel", ikonka: "📋", rollar: ["oqituvchi", "admin"] },
  { href: "/hisobot", nomi: "Hisobot", ikonka: "📊", rollar: ["tyutor", "admin"] },
  { href: "/kafedra", nomi: "Kafedra", ikonka: "🏛️", rollar: ["admin"] },
  { href: "/kontent", nomi: "Kontent", ikonka: "✏️", rollar: ["admin"] },
  { href: "/kartochkalar", nomi: "Kartochka", ikonka: "🃏", rollar: ["talaba", "oqituvchi", "tyutor", "admin"] },
];

export default function AppNav({ fio, role }: { fio: string; role: Rol }) {
  const pathname = usePathname();
  const router = useRouter();
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
          <ThemeToggle />
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight">{fio}</div>
            <div className="text-xs yumshoq">{ROLLAR[role]}</div>
          </div>
          <button onClick={chiqish} className="btn-ikkinchi !px-3 !py-2 text-sm" title="Chiqish">Chiqish</button>
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
              {i.nomi}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
