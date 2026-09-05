import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { getTil } from "@/lib/til-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Raqamli faollik muhiti PhD dissertatsiyasi",
  description:
    "Pedagogika yo'nalishi talabalarining jismoniy faolligini monitoring qilish, rivojlantirish va baholash platformasi — PhD dissertatsiya loyihasi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

// Sahifa ochilishida mavzuni (yorug'/qorong'i) tiklash — miltillashning oldini oladi
const themeScript = `
  try {
    var t = localStorage.getItem('rfm-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const til = await getTil();
  return (
    <html lang={til} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LangProvider initialTil={til}>{children}</LangProvider>
      </body>
    </html>
  );
}
