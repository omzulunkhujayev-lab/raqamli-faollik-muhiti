import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AppNav from "@/components/AppNav";
import PWA from "@/components/PWA";
import type { Rol } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/kirish");

  return (
    <div className="min-h-screen">
      <AppNav fio={session.fio} role={session.role as Rol} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <PWA />
    </div>
  );
}
