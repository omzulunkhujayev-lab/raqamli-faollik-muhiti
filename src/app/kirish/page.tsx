"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function KirishForm() {
  const router = useRouter();
  const params = useSearchParams();
  const demo = params.get("demo") === "1";

  const [email, setEmail] = useState(demo ? "talaba@demo.uz" : "");
  const [parol, setParol] = useState(demo ? "demo1234" : "");
  const [xato, setXato] = useState("");
  const [yuk, setYuk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setXato("");
    setYuk(true);
    try {
      const res = await fetch("/api/auth/kirish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, parol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setXato(data.xato ?? "Xatolik yuz berdi");
        return;
      }
      router.push(params.get("qayt") ?? "/boshqaruv");
      router.refresh();
    } catch {
      setXato("Tarmoq xatosi");
    } finally {
      setYuk(false);
    }
  }

  const demolar = [
    ["Talaba", "talaba@demo.uz"],
    ["O'qituvchi", "oqituvchi@demo.uz"],
    ["Tyutor", "tyutor@demo.uz"],
    ["Administrator", "admin@demo.uz"],
  ];

  return (
    <div className="w-full max-w-md">
      <div className="karta p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Tizimga kirish</h1>
        <p className="mt-1 text-sm yumshoq">Raqamli faollik muhiti</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="yorliq">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="yorliq">Parol</label>
            <input className="input" type="password" value={parol} onChange={(e) => setParol(e.target.value)} required autoComplete="current-password" />
          </div>
          {xato && <div className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{xato}</div>}
          <button className="btn-asosiy w-full" disabled={yuk}>
            {yuk ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm yumshoq">
          Hisobingiz yo'qmi?{" "}
          <Link href="/royxat" className="font-medium text-brand-600 hover:underline">Ro'yxatdan o'ting</Link>
        </p>
      </div>

      <div className="karta mt-4 p-4">
        <p className="text-sm font-medium">Demo hisoblar (parol: <code>demo1234</code>)</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {demolar.map(([rol, em]) => (
            <button
              key={em}
              onClick={() => { setEmail(em); setParol("demo1234"); }}
              className="btn-ikkinchi !justify-start !px-3 !py-2 text-left text-sm"
            >
              <span className="truncate"><b>{rol}</b><br />{em}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center">
        <Link href="/" className="text-sm yumshoq hover:underline">← Bosh sahifa</Link>
      </p>
    </div>
  );
}

export default function KirishPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="yumshoq">Yuklanmoqda...</div>}>
        <KirishForm />
      </Suspense>
    </main>
  );
}
