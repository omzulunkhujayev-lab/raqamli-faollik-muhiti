import { YOPIQ_HALQA } from "@/lib/constants";

const IKONKA = ["📊", "🔁", "🤸", "🏅", "🧭"];
const RANG = ["#0d9488", "#2563eb", "#16a34a", "#eab308", "#7c3aed"];

// Yopiq halqa sxemasi (SVG) — monitoring → teskari aloqa → mikrofaollik → rag'bat → refleksiya
export default function YopiqHalqa({ compact = false }: { compact?: boolean }) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const R = compact ? 118 : 128;
  const n = YOPIQ_HALQA.length;

  const nuqtalar = YOPIQ_HALQA.map((b, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { ...b, x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), rang: RANG[i], ikonka: IKONKA[i] };
  });

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] shrink-0">
        {/* Bog'lovchi aylana */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--chegara)" strokeWidth={2} strokeDasharray="4 6" />
        {/* Yo'nalish o'qlari */}
        {nuqtalar.map((p, i) => {
          const next = nuqtalar[(i + 1) % n];
          const mx = (p.x + next.x) / 2;
          const my = (p.y + next.y) / 2;
          return (
            <text key={`a${i}`} x={mx} y={my} fontSize={16} textAnchor="middle" dominantBaseline="middle" fill="var(--matn-yumshoq)">
              ➤
            </text>
          );
        })}
        {/* Markaz */}
        <text x={cx} y={cy - 8} fontSize={15} fontWeight={700} textAnchor="middle" fill="var(--matn)">
          Yopiq
        </text>
        <text x={cx} y={cy + 12} fontSize={15} fontWeight={700} textAnchor="middle" fill="var(--matn)">
          halqa
        </text>
        {/* Bo'g'inlar */}
        {nuqtalar.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={30} fill={p.rang} />
            <text x={p.x} y={p.y} fontSize={24} textAnchor="middle" dominantBaseline="central">
              {p.ikonka}
            </text>
            <text x={p.x} y={p.y + 46} fontSize={11.5} fontWeight={600} textAnchor="middle" fill="var(--matn)">
              {p.nomi}
            </text>
          </g>
        ))}
      </svg>

      {!compact && (
        <ol className="flex-1 space-y-3">
          {YOPIQ_HALQA.map((b, i) => (
            <li key={b.kod} className="flex gap-3">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: RANG[i] }}
              >
                {i + 1}
              </span>
              <div>
                <div className="font-semibold">{b.nomi}</div>
                <div className="text-sm yumshoq">{b.tavsif}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
