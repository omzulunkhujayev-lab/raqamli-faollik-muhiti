// Bir foydalanuvchi uchun ikki qatlamli baholashni hisoblab, saqlaydi (server-side).
import { prisma } from "./prisma";
import { parseJson } from "./utils";
import { motivatsionBall } from "./anketa";
import {
  obyektivBallHisobla, integralHisobla, darajaAniqla, triangulyatsiya,
  type Mezonlar,
} from "./baholash";

export async function baholaHisobla(userId: string, nuqta: string) {
  const now = new Date();
  const ikkiHaftaOldin = new Date(now); ikkiHaftaOldin.setDate(now.getDate() - 14);
  const bironHaftaOldin = new Date(now); bironHaftaOldin.setDate(now.getDate() - 7);

  const [entries14, entries7, testResult, survey, reflections, essay, goals, topicsAll, progresses] = await Promise.all([
    prisma.dailyEntry.findMany({ where: { userId, sana: { gte: ikkiHaftaOldin } } }),
    prisma.dailyEntry.findMany({ where: { userId, sana: { gte: bironHaftaOldin } } }),
    prisma.testResult.findUnique({ where: { userId_nuqta: { userId, nuqta } } }),
    prisma.surveyResponse.findUnique({ where: { userId_nuqta: { userId, nuqta } } }),
    prisma.weeklyReflection.findMany({ where: { userId } }),
    prisma.reflectiveEssay.findUnique({ where: { userId_nuqta: { userId, nuqta } } }),
    prisma.weeklyGoal.findMany({ where: { userId } }),
    prisma.courseTopic.count(),
    prisma.topicProgress.findMany({ where: { userId } }),
  ]);

  // --- Obyektiv qatlam (me'yorga moslik) ---
  const n = entries14.length || 1;
  const ortachaQadam = Math.round(entries14.reduce((s, e) => s + e.qadam, 0) / n);
  const haftalikFaolDaqiqa = entries7.reduce((s, e) => s + e.faolDaqiqa, 0);
  const ortachaEngUzunOtirish = entries14.length ? Math.round(entries14.reduce((s, e) => s + e.engUzunOtirish, 0) / n) : 0;
  const ortachaPauza = entries14.length ? entries14.reduce((s, e) => s + e.pauzaSoni, 0) / n : 0;
  const ortachaUyqu = entries14.length ? entries14.reduce((s, e) => s + e.uyquSoat, 0) / n : 0;
  const obyektiv = obyektivBallHisobla({ ortachaQadam, haftalikFaolDaqiqa, ortachaEngUzunOtirish, ortachaPauza, ortachaUyqu });

  // --- Pedagogik mezonlar ---
  const kognitiv = testResult ? Math.round((testResult.ball / testResult.max) * 100) : 0;
  const motivatsion = survey ? motivatsionBall(parseJson(survey.javoblar, {})) : 0;

  const muntazamlik = Math.min(1, entries14.length / 14);
  const pauzaAmaliyot = entries14.length ? entries14.filter((e) => e.pauzaSoni > 0).length / entries14.length : 0;
  const modulProgress = topicsAll ? progresses.filter((p) => p.bajarildi).length / topicsAll : 0;
  const faoliyatli = Math.round((muntazamlik * 0.5 + pauzaAmaliyot * 0.2 + modulProgress * 0.3) * 100);

  const toliqRefleksiya = reflections.filter((r) => r.engFaolKun && r.engPastKun && r.uzunOtirishVaqt && r.keyingiMaqsad).length;
  const refleksiyaBall = Math.min(1, toliqRefleksiya / 2);
  const refleksiv = Math.round((refleksiyaBall * 0.4 + (essay ? 0.3 : 0) + (goals.length > 0 ? 0.3 : 0)) * 100);

  const mezonlar: Mezonlar = { motivatsion, kognitiv, faoliyatli, refleksiv };
  const integral = integralHisobla(obyektiv, mezonlar);
  const daraja = darajaAniqla(integral);
  const triang = triangulyatsiya(mezonlar);

  await prisma.assessment.upsert({
    where: { userId_nuqta: { userId, nuqta } },
    create: {
      userId, nuqta,
      motivatsionBall: motivatsion, kognitivBall: kognitiv, faoliyatliBall: faoliyatli,
      refleksivBall: refleksiv, obyektivBall: obyektiv, integralBall: integral, daraja: daraja.kod,
    },
    update: {
      motivatsionBall: motivatsion, kognitivBall: kognitiv, faoliyatliBall: faoliyatli,
      refleksivBall: refleksiv, obyektivBall: obyektiv, integralBall: integral, daraja: daraja.kod,
    },
  });

  return {
    nuqta, obyektiv, mezonlar, integral, daraja, triangulyatsiya: triang,
    manbalar: {
      test: !!testResult, anketa: !!survey, esse: !!essay,
      monitoringKun: entries14.length, modulTugatildi: progresses.filter((p) => p.bajarildi).length, modulJami: topicsAll,
    },
    detallar: {
      ortachaQadam, haftalikFaolDaqiqa, ortachaEngUzunOtirish,
      ortachaPauza: Math.round(ortachaPauza * 10) / 10, ortachaUyqu: Math.round(ortachaUyqu * 10) / 10,
    },
  };
}
