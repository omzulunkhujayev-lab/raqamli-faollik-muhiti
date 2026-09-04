"use client";

import { useEffect, useState } from "react";

// Yorug'/qorong'i rejim almashtirgichi
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const yangi = !dark;
    setDark(yangi);
    document.documentElement.classList.toggle("dark", yangi);
    try {
      localStorage.setItem("rfm-theme", yangi ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      className="btn-ikkinchi !px-2.5 !py-2"
      aria-label="Mavzuni almashtirish"
      title={dark ? "Yorug' rejim" : "Qorong'i rejim"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
