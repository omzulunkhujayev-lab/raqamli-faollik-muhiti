// Statistik hisob-kitob: o'rtacha, standart chetlanish, Styudent t-mezoni, Pirson χ²
// p-qiymatlar to'liq (incomplete gamma/beta funksiyalari orqali) hisoblanadi.

export function ortacha(a: number[]): number {
  if (a.length === 0) return 0;
  return a.reduce((s, x) => s + x, 0) / a.length;
}

// Tanlanma dispersiyasi (n-1) va standart chetlanish
export function dispersiya(a: number[]): number {
  if (a.length < 2) return 0;
  const m = ortacha(a);
  return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
}
export function standartChetlanish(a: number[]): number {
  return Math.sqrt(dispersiya(a));
}

// --- Maxsus funksiyalar (p-qiymat uchun) ---

// ln(Γ(x)) — Lanczos approksimatsiyasi
function logGamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Regulyarlangan to'liqsiz gamma P(a,x) (pastki dum)
function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    // Qator yoyilmasi
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 200; n++) {
      ap++;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  // Uzluksiz kasr (yuqori dumdan)
  let b = x + 1 - a;
  let c = 1e300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  const Q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
  return 1 - Q;
}

// Regulyarlangan to'liqsiz beta I_x(a,b)
function betaI(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  const cf = (xx: number, aa: number, bb: number) => {
    const qab = aa + bb, qap = aa + 1, qam = aa - 1;
    let c = 1, d = 1 - (qab * xx) / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d;
    let h = d;
    for (let m = 1; m < 200; m++) {
      const m2 = 2 * m;
      let aa2 = (m * (bb - m) * xx) / ((qam + m2) * (aa + m2));
      d = 1 + aa2 * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa2 / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; h *= d * c;
      aa2 = (-(aa + m) * (qab + m) * xx) / ((aa + m2) * (qap + m2));
      d = 1 + aa2 * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa2 / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-12) break;
    }
    return h;
  };
  if (x < (a + 1) / (a + b + 2)) return (bt * cf(x, a, b)) / a;
  return 1 - (bt * cf(1 - x, b, a)) / b;
}

export interface TNatija { t: number; df: number; p: number; ahamiyatli: boolean }

// Ikki mustaqil tanlanma uchun Styudent t-mezoni (birlashtirilgan dispersiya)
export function tMezoni(a: number[], b: number[]): TNatija | null {
  if (a.length < 2 || b.length < 2) return null;
  const n1 = a.length, n2 = b.length;
  const m1 = ortacha(a), m2 = ortacha(b);
  const s1 = dispersiya(a), s2 = dispersiya(b);
  const sp2 = ((n1 - 1) * s1 + (n2 - 1) * s2) / (n1 + n2 - 2);
  const se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
  if (se === 0) return { t: 0, df: n1 + n2 - 2, p: 1, ahamiyatli: false };
  const t = (m1 - m2) / se;
  const df = n1 + n2 - 2;
  // Ikki tomonlama p-qiymat
  const p = betaI(df / (df + t * t), df / 2, 0.5);
  return { t: Math.round(t * 1000) / 1000, df, p: Math.round(p * 10000) / 10000, ahamiyatli: p < 0.05 };
}

export interface ChiNatija { chi2: number; df: number; p: number; ahamiyatli: boolean; kutilgan: number[][] }

// Pirson χ²-mezoni (kutilmagan jadval / contingency table)
export function chiKvadrat(kuzatilgan: number[][]): ChiNatija | null {
  const r = kuzatilgan.length;
  const c = kuzatilgan[0]?.length ?? 0;
  if (r < 2 || c < 2) return null;
  const satrJami = kuzatilgan.map((row) => row.reduce((s, x) => s + x, 0));
  const ustunJami = Array.from({ length: c }, (_, j) => kuzatilgan.reduce((s, row) => s + row[j], 0));
  const jami = satrJami.reduce((s, x) => s + x, 0);
  if (jami === 0) return null;

  const kutilgan: number[][] = [];
  let chi2 = 0;
  for (let i = 0; i < r; i++) {
    kutilgan[i] = [];
    for (let j = 0; j < c; j++) {
      const e = (satrJami[i] * ustunJami[j]) / jami;
      kutilgan[i][j] = Math.round(e * 100) / 100;
      if (e > 0) chi2 += (kuzatilgan[i][j] - e) ** 2 / e;
    }
  }
  const df = (r - 1) * (c - 1);
  const p = 1 - gammaP(df / 2, chi2 / 2);
  return { chi2: Math.round(chi2 * 1000) / 1000, df, p: Math.round(p * 10000) / 10000, ahamiyatli: p < 0.05, kutilgan };
}
