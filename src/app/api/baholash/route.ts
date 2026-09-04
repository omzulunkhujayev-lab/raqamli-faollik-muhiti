import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { baholaHisobla } from "@/lib/baholashHisobla";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ xato: "Avtorizatsiya yo'q" }, { status: 401 });

  const url = new URL(req.url);
  const nuqta = url.searchParams.get("nuqta") ?? "yakuniy";
  const soralganUser = url.searchParams.get("userId");

  // Boshqa foydalanuvchi baholashini faqat tyutor/admin ko'ra oladi
  let targetUserId = session.userId;
  if (soralganUser && soralganUser !== session.userId) {
    if (session.role !== "tyutor" && session.role !== "admin") {
      return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 403 });
    }
    targetUserId = soralganUser;
  }

  const natija = await baholaHisobla(targetUserId, nuqta);
  return NextResponse.json(natija);
}
