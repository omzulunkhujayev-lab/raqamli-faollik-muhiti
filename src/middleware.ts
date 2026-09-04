import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NOMI } from "@/lib/jwt";

// Himoyalangan yo'llar (kirish talab qilinadi)
const HIMOYALANGAN = ["/boshqaruv", "/kundalik", "/profil", "/maqsad", "/kartochkalar", "/panel", "/uzilishlar", "/hisobot", "/modul", "/diagnostika", "/baholash", "/gamifikatsiya", "/kafedra", "/kontent"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const himoyalangan = HIMOYALANGAN.some((p) => pathname.startsWith(p));
  if (!himoyalangan) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NOMI)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/kirish";
    url.searchParams.set("qayt", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/boshqaruv/:path*", "/kundalik/:path*", "/profil/:path*", "/maqsad/:path*", "/kartochkalar/:path*", "/panel/:path*", "/uzilishlar/:path*", "/hisobot/:path*", "/modul/:path*", "/diagnostika/:path*", "/baholash/:path*", "/gamifikatsiya/:path*", "/kafedra/:path*", "/kontent/:path*"],
};
