"use client";

import { useEffect, useState } from "react";

// Xizmat ishchisini ro'yxatdan o'tkazadi va offline holatni ko'rsatadi
export default function PWA() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const yangila = () => setOffline(!navigator.onLine);
    yangila();
    window.addEventListener("online", yangila);
    window.addEventListener("offline", yangila);
    return () => {
      window.removeEventListener("online", yangila);
      window.removeEventListener("offline", yangila);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-warn px-4 py-2 text-sm font-medium text-white shadow-lg">
      📴 Offline rejim — kiritilgan ma'lumot keyin sinxronlanadi
    </div>
  );
}
