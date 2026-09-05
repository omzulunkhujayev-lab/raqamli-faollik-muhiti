"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";

export default function RoyxatPage() {
  const router = useRouter();
  const { t } = useT();
  const [form, setForm] = useState({
    fio: "", email: "", parol: "", role: "talaba",
    yonalish: "", kurs: "", jins: "", yashashSharoiti: "", tibbiyGuruh: "asosiy",
  });
  const [rozilik, setRozilik] = useState(false);
  const [xato, setXato] = useState("");
  const [yuk, setYuk] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setXato("");
    if (!rozilik) { setXato("Ishtirokka rozilik berilishi shart"); return; }
    setYuk(true);
    try {
      const res = await fetch("/api/auth/royxat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kurs: form.kurs || undefined, rozilik }),
      });
      const data = await res.json();
      if (!res.ok) { setXato(data.xato ?? "Xatolik"); return; }
      router.push("/boshqaruv");
      router.refresh();
    } catch {
      setXato("Tarmoq xatosi");
    } finally {
      setYuk(false);
    }
  }

  const talaba = form.role === "talaba";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="karta p-6 sm:p-8">
          <h1 className="text-2xl font-bold">{t("auth.royxat.sarlavha")}</h1>
          <p className="mt-1 text-sm yumshoq">{t("auth.royxat.tavsif")}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="yorliq">{t("auth.fio")}</label>
              <input className="input" value={form.fio} onChange={(e) => set("fio", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="yorliq">{t("auth.email")}</label>
                <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </div>
              <div>
                <label className="yorliq">{t("auth.parol")}</label>
                <input className="input" type="password" value={form.parol} onChange={(e) => set("parol", e.target.value)} required minLength={6} />
              </div>
            </div>
            <div>
              <label className="yorliq">{t("auth.rol")}</label>
              <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="talaba">{t("role.talaba")}</option>
                <option value="oqituvchi">{t("role.oqituvchi")}</option>
                <option value="tyutor">{t("role.tyutor")}</option>
                <option value="admin">{t("role.admin")}</option>
              </select>
            </div>

            {talaba && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="yorliq">{t("auth.yonalish")}</label>
                  <input className="input" value={form.yonalish} onChange={(e) => set("yonalish", e.target.value)} placeholder="Boshlang'ich ta'lim" />
                </div>
                <div>
                  <label className="yorliq">{t("auth.kurs")}</label>
                  <input className="input" type="number" min={1} max={6} value={form.kurs} onChange={(e) => set("kurs", e.target.value)} />
                </div>
                <div>
                  <label className="yorliq">{t("auth.jins")}</label>
                  <select className="input" value={form.jins} onChange={(e) => set("jins", e.target.value)}>
                    <option value="">—</option>
                    <option value="erkak">{t("auth.jins.erkak")}</option>
                    <option value="ayol">{t("auth.jins.ayol")}</option>
                  </select>
                </div>
                <div>
                  <label className="yorliq">{t("auth.tibbiyGuruh")}</label>
                  <select className="input" value={form.tibbiyGuruh} onChange={(e) => set("tibbiyGuruh", e.target.value)}>
                    <option value="asosiy">Asosiy</option>
                    <option value="tayyorlov">Tayyorlov</option>
                    <option value="maxsus">Maxsus</option>
                  </select>
                </div>
              </div>
            )}

            {/* Aniq rozilik ekrani (maxfiylik sharti) */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3" style={{ borderColor: "var(--chegara)" }}>
              <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-600" checked={rozilik} onChange={(e) => setRozilik(e.target.checked)} />
              <span className="text-sm yumshoq">{t("auth.rozilik")}</span>
            </label>

            {xato && <div className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
            <button className="btn-asosiy w-full" disabled={yuk}>
              {yuk ? t("auth.yaratilmoqda") : t("common.royxat")}
            </button>
          </form>

          <p className="mt-4 text-center text-sm yumshoq">
            {t("auth.hisobBor")}{" "}
            <Link href="/kirish" className="font-medium text-brand-600 hover:underline">{t("common.kirish")}</Link>
          </p>
        </div>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm yumshoq hover:underline">← {t("common.boshSahifa")}</Link>
        </p>
      </div>
    </main>
  );
}
