# Deploy — Vercel + Serverless PostgreSQL (Neon yoki Supabase)

Loyiha deploy'ga tayyor: Prisma migratsiyalari (`prisma/migrations/`), Vercel binary target'i,
pooled/direct ulanish (`DATABASE_URL` / `DIRECT_URL`) va `build` skripti migratsiyani avtomatik qo'llaydi.

> ⚠️ Hisob yaratish, tizimga kirish va ulanish satrlari (parollar)ni **siz** kiritasiz —
> bu qadamlarni avtomatlashtirib bo'lmaydi.

---

## 1-qadam. GitHub'ga yuklash
Repozitoriy lokalda commit qilingan. Endi GitHub'da bo'sh repo yarating va yuklang:
```bash
git remote add origin https://github.com/<foydalanuvchi>/raqamli-faollik-muhiti.git
git branch -M main
git push -u origin main
```

## 2-qadam. Ma'lumotlar bazasi (Neon — tavsiya)
1. https://neon.tech — hisob oching, yangi **Project** yarating (region: Yevropaga yaqin).
2. Dashboard → **Connection string**. Ikki ko'rinish kerak:
   - **Pooled** (host'da `-pooler` bor) → `DATABASE_URL`
   - **Direct** (`-pooler`siz) → `DIRECT_URL`
   - Ikkalasida ham oxiriga `?sslmode=require` bo'lsin.

_Supabase muqobili:_ Project → Settings → Database → Connection string:
`DATABASE_URL` = **Transaction pooler** (port `6543`, `?pgbouncer=true`),
`DIRECT_URL` = **Direct** (port `5432`).

## 3-qadam. Vercel
1. https://vercel.com — hisob oching, **Add New → Project**, GitHub repo'ni **import** qiling.
2. Framework avtomatik **Next.js** deb aniqlanadi. Build sozlamasini o'zgartirmang
   (loyihaning `build` skripti `prisma generate && prisma migrate deploy && next build`).
3. **Environment Variables** bo'limiga qo'shing (Production + Preview):
   | Nom | Qiymat |
   |-----|--------|
   | `DATABASE_URL` | Neon **pooled** ulanish satri |
   | `DIRECT_URL` | Neon **direct** ulanish satri |
   | `JWT_SECRET` | kuchli tasodifiy satr (`openssl rand -base64 32`) |
4. **Deploy** bosing. Build paytida migratsiyalar avtomatik qo'llanadi (jadvallar yaratiladi).

## 4-qadam. Demo ma'lumotlarni bir marta yuklash (seed)
Deploy'dan keyin baza bo'sh. Lokal terminalda **production** bazaga bir marta seed qiling:
```bash
# PowerShell (Windows):
$env:DATABASE_URL="<neon-direct-url>"; $env:DIRECT_URL="<neon-direct-url>"; npm run db:seed

# bash:
DATABASE_URL="<neon-direct-url>" DIRECT_URL="<neon-direct-url>" npm run db:seed
```
> `seed` avval barcha ma'lumotni tozalaydi — shuning uchun uni faqat **bir marta** ishlating.

## 5-qadam. Tekshirish
Vercel URL'ni oching → `talaba@demo.uz` / `demo1234` bilan kiring. Tayyor. 🎉

---

## Eslatmalar
- **Migratsiya o'zgarishi:** sxemani o'zgartirsangiz — lokalda `npm run db:migrate -- --name < nom>`,
  keyin commit + push. Vercel keyingi build'da `migrate deploy` orqali avtomatik qo'llaydi.
- **JWT_SECRET** ni albatta production uchun o'zgartiring.
- **Ulanish limiti:** serverless funksiyalar ko'p ulanish ochadi — shuning uchun runtime'da
  **pooled** `DATABASE_URL` ishlatiladi; migratsiyalar esa `DIRECT_URL` orqali.
