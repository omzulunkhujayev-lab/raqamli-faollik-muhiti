import type { MetadataRoute } from "next";

// PWA manifesti — o'rnatiladigan ilova
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raqamli faollik muhiti",
    short_name: "RFM",
    description: "Talaba jismoniy faolligini monitoring qilish va rivojlantirish platformasi",
    start_url: "/boshqaruv",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0d9488",
    lang: "uz",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
