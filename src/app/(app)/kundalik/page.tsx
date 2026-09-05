"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NORMS } from "@/lib/constants";
import { qadamHolati, otirishHolati, uyquHolati, HOLAT_RANG, sanaUzbek, son, type Holat } from "@/lib/utils";
import { useT } from "@/components/LangProvider";

const KAYFIYAT = ["😞", "😐", "🙂", "😊", "🤩"];

interface FormState {
  qadam: number;
  faolDaqiqa: number;
  engUzunOtirish: number;
  pauzaSoni: number;
  uyquSoat: number;
  ekranSoat: number;
  kayfiyatBall: number;
  refleksiyaMatn: string;
}

const BOSHLANGICH: FormState = {
  qadam: 6000, faolDaqiqa: 30, engUzunOtirish: 60, pauzaSoni: 2,
  uyquSoat: 7.5, ekranSoat: 5, kayfiyatBall: 3, refleksiyaMatn: "",
};

export default function KundalikPage() {
  const { t } = useT();
  const [f, setF] = useState<FormState>(BOSHLANGICH);
  const [yuk, setYuk] = useState(true);
  const [saqlash, setSaqlash] = useState(false);
  const [saqlandi, setSaqlandi] = useState(false);
  const [mavjud, setMavjud] = useState(false);

  const bugun = sanaUzbek(new Date());

  useEffect(() => {
    const sana = new Date().toISOString().slice(0, 10);
    fetch(`/api/kundalik?sana=${sana}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.entry) {
          setF({
            qadam: d.entry.qadam, faolDaqiqa: d.entry.faolDaqiqa, engUzunOtirish: d.entry.engUzunOtirish,
            pauzaSoni: d.entry.pauzaSoni, uyquSoat: d.entry.uyquSoat, ekranSoat: d.entry.ekranSoat,
            kayfiyatBall: d.entry.kayfiyatBall, refleksiyaMatn: d.entry.refleksiyaMatn ?? "",
          });
          setMavjud(true);
        }
      })
      .finally(() => setYuk(false));
  }, []);

  // Offline navbatni sinxronlash (mount va qayta ulanishda)
  useEffect(() => {
    async function sinxronla() {
      let q: unknown[] = [];
      try { q = JSON.parse(localStorage.getItem("rfm-offline-queue") || "[]"); } catch { return; }
      if (!Array.isArray(q) || q.length === 0) return;
      const qolgan: unknown[] = [];
      for (const item of q) {
        try {
          const res = await fetch("/api/kundalik", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
          if (!res.ok) qolgan.push(item);
        } catch { qolgan.push(item); }
      }
      try { localStorage.setItem("rfm-offline-queue", JSON.stringify(qolgan)); } catch {}
    }
    sinxronla();
    window.addEventListener("online", sinxronla);
    return () => window.removeEventListener("online", sinxronla);
  }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((s) => ({ ...s, [k]: v }));
    setSaqlandi(false);
  }

  // Offline navbatga qo'yish (PWA — keyin sinxronlash)
  function navbatgaQoy() {
    try {
      const sana = new Date().toISOString().slice(0, 10);
      const q = JSON.parse(localStorage.getItem("rfm-offline-queue") || "[]");
      const filtered = q.filter((x: { sana?: string }) => x.sana !== sana);
      filtered.push({ ...f, sana });
      localStorage.setItem("rfm-offline-queue", JSON.stringify(filtered));
    } catch {}
  }

  async function saqla() {
    setSaqlash(true);
    setSaqlandi(false);
    try {
      const res = await fetch("/api/kundalik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (res.ok) {
        setSaqlandi(true);
        setMavjud(true);
      } else {
        navbatgaQoy();
        setSaqlandi(true);
        setMavjud(true);
      }
    } catch {
      // Tarmoq yo'q — offline navbatga saqlaymiz
      navbatgaQoy();
      setSaqlandi(true);
      setMavjud(true);
    } finally {
      setSaqlash(false);
    }
  }

  if (yuk) return <div className="yumshoq">{t("common.yuklanmoqda")}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold">{t("kundalik.sarlavha")}</h1>
        <p className="yumshoq">{bugun}</p>
        {mavjud && (
          <div className="mt-2 inline-block rounded-full bg-ok/10 px-3 py-1 text-sm text-ok">
            ✓ {t("kundalik.bugunToldirilgan")}
          </div>
        )}
      </div>

      {/* Qadamlar */}
      <Slayder
        sarlavha={t("kundalik.qadam")}
        qiymat={f.qadam}
        min={0} max={20000} step={500}
        onChange={(v) => set("qadam", v)}
        format={(v) => son(v)}
        holat={qadamHolati(f.qadam)}
        meyor={`${t("common.meyor")}: ${son(NORMS.QADAM_KUNLIK)}+`}
      />

      {/* Faol daqiqalar */}
      <Slayder
        sarlavha={t("kundalik.faolDaqiqa")}
        qiymat={f.faolDaqiqa}
        min={0} max={180} step={5}
        onChange={(v) => set("faolDaqiqa", v)}
        format={(v) => `${v} ${t("unit.daq")}`}
        holat={f.faolDaqiqa >= 21 ? "ok" : f.faolDaqiqa >= 10 ? "warn" : "bad"}
        meyor={t("kundalik.faolMeyor")}
      />

      {/* Eng uzun uzluksiz o'tirish */}
      <Slayder
        sarlavha={t("kundalik.otirish")}
        qiymat={f.engUzunOtirish}
        min={0} max={180} step={5}
        onChange={(v) => set("engUzunOtirish", v)}
        format={(v) => `${v} ${t("unit.daq")}`}
        holat={otirishHolati(f.engUzunOtirish)}
        meyor={t("kundalik.otirishMeyor", { n: NORMS.OTIRISH_CHEGARA })}
        teskari
      />

      {/* Pauzalar sanagichi */}
      <div className="karta p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{t("kundalik.pauza")}</div>
            <div className="text-sm yumshoq">{t("kundalik.pauzaTavsif")}</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ikkinchi !h-12 !w-12 !rounded-full !p-0 text-2xl" onClick={() => set("pauzaSoni", Math.max(0, f.pauzaSoni - 1))} aria-label="Kamaytirish">−</button>
            <span className="w-8 text-center text-2xl font-bold">{f.pauzaSoni}</span>
            <button className="btn-asosiy !h-12 !w-12 !rounded-full !p-0 text-2xl" onClick={() => set("pauzaSoni", Math.min(20, f.pauzaSoni + 1))} aria-label="Ko'paytirish">+</button>
          </div>
        </div>
      </div>

      {/* Uyqu */}
      <Slayder
        sarlavha={t("kundalik.uyqu")}
        qiymat={f.uyquSoat}
        min={3} max={12} step={0.5}
        onChange={(v) => set("uyquSoat", v)}
        format={(v) => `${v} ${t("unit.soat")}`}
        holat={uyquHolati(f.uyquSoat)}
        meyor={t("kundalik.uyquMeyor")}
      />

      {/* Ekran vaqti */}
      <Slayder
        sarlavha={t("kundalik.ekran")}
        qiymat={f.ekranSoat}
        min={0} max={16} step={0.5}
        onChange={(v) => set("ekranSoat", v)}
        format={(v) => `${v} ${t("unit.soat")}`}
      />

      {/* Kayfiyat */}
      <div className="karta p-5">
        <div className="font-semibold">{t("kundalik.kayfiyat")}</div>
        <div className="mt-3 flex justify-between gap-2">
          {KAYFIYAT.map((emoji, i) => (
            <button
              key={i}
              onClick={() => set("kayfiyatBall", i + 1)}
              className={`flex-1 rounded-2xl border-2 py-3 text-3xl transition ${
                f.kayfiyatBall === i + 1 ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30 scale-105" : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={f.kayfiyatBall !== i + 1 ? { borderColor: "var(--chegara)" } : {}}
              aria-label={`Kayfiyat ${i + 1}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Refleksiya */}
      <div className="karta p-5">
        <div className="font-semibold">{t("kundalik.refleksiya")} <span className="yumshoq font-normal">{t("kundalik.ixtiyoriy")}</span></div>
        <textarea
          className="input mt-2 resize-none"
          rows={2}
          maxLength={1000}
          placeholder={t("kundalik.refleksiyaPlace")}
          value={f.refleksiyaMatn}
          onChange={(e) => set("refleksiyaMatn", e.target.value)}
        />
      </div>

      <p className="text-center text-sm yumshoq">
        <Link href="/profil" className="text-brand-600 hover:underline">{t("kundalik.teskari")}</Link>
      </p>

      {/* Saqlash paneli (mobil uchun pastda yopishgan) */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t p-3 md:static md:border-0 md:p-0" style={{ borderColor: "var(--chegara)", backgroundColor: "var(--sirt)" }}>
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {saqlandi && <span className="text-sm text-ok">✓ {t("common.saqlandi")}</span>}
          <button onClick={saqla} disabled={saqlash} className="btn-asosiy ml-auto w-full md:w-auto">
            {saqlash ? t("common.saqlanmoqda") : mavjud ? t("common.yangilash") : t("common.saqlash")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Slayder({
  sarlavha, qiymat, min, max, step, onChange, format, holat, meyor, teskari,
}: {
  sarlavha: string; qiymat: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
  holat?: Holat; meyor?: string; teskari?: boolean;
}) {
  return (
    <div className="karta p-5">
      <div className="flex items-baseline justify-between">
        <div className="font-semibold">{sarlavha}</div>
        <div className={`text-xl font-bold ${holat ? HOLAT_RANG[holat].text : ""}`}>{format(qiymat)}</div>
      </div>
      <input
        type="range"
        className="mt-3 w-full"
        min={min} max={max} step={step} value={qiymat}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between text-xs yumshoq">
        <span>{format(min)}</span>
        {meyor && <span className={holat ? HOLAT_RANG[holat].text : ""}>{meyor}{teskari ? " ↓" : ""}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
