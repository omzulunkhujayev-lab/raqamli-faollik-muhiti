# Raqamli faollik muhiti

Pedagogika yo'nalishi talabalarining jismoniy faolligini **monitoring qilish, rivojlantirish va baholash** platformasi. Ilmiy-pedagogik metodikaning raqamli ta'minoti.

Platformaning o'zagi — uzluksiz takrorlanuvchi **yopiq halqa**:
`Monitoring → Teskari aloqa → Mikrofaollik → Rag'bat → Refleksiya → (yana monitoring)`

## Texnologiyalar
- **Frontend/Backend:** Next.js 15 (App Router) + TypeScript
- **Uslub:** Tailwind CSS (mobile-first, yorug'/qorong'i rejim)
- **Grafiklar:** Recharts
- **Ma'lumotlar bazasi:** PostgreSQL (Prisma ORM) — Docker orqali
- **Autentifikatsiya:** JWT (httpOnly cookie) + rolga asoslangan kirish (RBAC)

## Ishga tushirish (PostgreSQL)

```bash
docker compose up -d   # PostgreSQL 16 konteynerini ishga tushirish
npm install
npm run db:push        # sxemani bazaga qo'llash
npm run db:seed        # demo ma'lumotlar
npm run dev            # http://localhost:3000
```

`.env` dagi `DATABASE_URL` docker-compose bilan mos: `postgresql://rfm:rfm_parol@localhost:5432/rfm`.

Foydali buyruqlar:
```bash
npm run db:studio    # Prisma Studio (bazani ko'rish)
npm run db:reset     # bazani tozalab qayta seed qilish
docker compose down  # PostgreSQL konteynerini to'xtatish
```

### SQLite'ga qaytish (Docker'siz lokal ishlash uchun)
`prisma/schema.prisma` da `provider = "sqlite"`, `.env` da `DATABASE_URL="file:./dev.db"` qiling, so'ng `npm run db:push && npm run db:seed`. (Sxema massiv/enum ishlatmagani uchun ikkala baza ham mos.)

## Demo hisoblar (parol hammasi uchun: `demo1234`)
| Rol | Email |
|-----|-------|
| Talaba | `talaba@demo.uz` |
| Fan o'qituvchisi | `oqituvchi@demo.uz` |
| Tyutor | `tyutor@demo.uz` |
| Kafedra / administrator | `admin@demo.uz` |

## Bosqichlar holati
- ✅ **1-bosqich (MVP):** autentifikatsiya + rollar · Faollik kundaligi · haftalik profil va grafik · maqsad qo'yish · kartochkalar banki (10 ta)
- ✅ **2-bosqich:** Faollik uzilishlari tahlili (5-qadamli algoritm, timeline, yechimlar) · o'qituvchi paneli (reja + kuzatuv kartasi) · tyutor hisoboti (anonim)
- ✅ **3-bosqich:** LMS moduli (9 mavzu: video/taqdimot/kartochka/test/topshiriq/forum) · diagnostika (anketa + 25 savolli test + esse) · baholash va darajalar (ikki qatlamli tizim, 4 mezon, triangulyatsiya)
- ✅ **4-bosqich:** gamifikatsiya (guruh chellenji, «Faol hafta», nishonlar) · kafedra statistikasi (Styudent t, Pirson χ², dinamika) va Excel/PDF eksport · PWA/offline
- ✅ **Qo'shimcha:** real video-ma'ruzalar (YouTube embed) · admin kontent boshqaruvi (`/kontent` — kartochka va mavzu/video/test tahrirlash) · PostgreSQL

## Loyiha tuzilmasi
```
prisma/
  schema.prisma      # ma'lumotlar modeli (section 5 bo'yicha)
  seed.ts            # demo foydalanuvchilar, kartochkalar, yozuvlar
src/
  app/
    page.tsx         # ochiq sahifa (infografika)
    kirish, royxat   # auth sahifalari (rozilik ekrani bilan)
    (app)/           # himoyalangan sahifalar (kundalik, profil, maqsad, kartochkalar)
    api/             # REST endpointlar
  components/        # AppNav, YopiqHalqa, ThemeToggle
  lib/               # auth, jwt, prisma, constants (me'yorlar), utils
  middleware.ts      # RBAC yo'l himoyasi
```

## Etik-metodik kafolatlar (arxitektura darajasida)
- Mutlaq jismoniy ko'rsatkichlar **baholanmaydi** — muntazamlik va tahlil sifati baholanadi.
- Ishtirok **ixtiyoriy**: rozilik ekrani + ma'lumotni o'chirib chiqib ketish imkoniyati.
- Platforma tibbiy tashxis qo'ymaydi, dori/parhez tavsiya qilmaydi.
- Har bir kartochkada sog'liq cheklovi uchun **moslashtirilgan variant**.
