-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'talaba',
    "fio" TEXT NOT NULL,
    "muassasa" TEXT,
    "yonalish" TEXT,
    "kurs" INTEGER,
    "jins" TEXT,
    "yashashSharoiti" TEXT,
    "tibbiyGuruh" TEXT,
    "consentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "nomi" TEXT NOT NULL,
    "kurs" INTEGER NOT NULL,
    "tur" TEXT NOT NULL DEFAULT 'tajriba',
    "tyutorId" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sana" TIMESTAMP(3) NOT NULL,
    "qadam" INTEGER NOT NULL DEFAULT 0,
    "faolDaqiqa" INTEGER NOT NULL DEFAULT 0,
    "engUzunOtirish" INTEGER NOT NULL DEFAULT 0,
    "pauzaSoni" INTEGER NOT NULL DEFAULT 0,
    "uyquSoat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ekranSoat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kayfiyatBall" INTEGER NOT NULL DEFAULT 3,
    "refleksiyaMatn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hafta" TEXT NOT NULL,
    "maqsadTuri" TEXT NOT NULL,
    "joriyQiymat" DOUBLE PRECISION NOT NULL,
    "maqsadQiymat" DOUBLE PRECISION NOT NULL,
    "bajarildi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReflection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hafta" TEXT NOT NULL,
    "engFaolKun" TEXT,
    "engPastKun" TEXT,
    "uzunOtirishVaqt" TEXT,
    "keyingiMaqsad" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "kun" TEXT NOT NULL,
    "mashgulotSoatlari" TEXT NOT NULL,
    "tanaffuslar" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityGap" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "kun" TEXT NOT NULL,
    "boshlanish" TEXT NOT NULL,
    "tugash" TEXT NOT NULL,
    "davomiylikDaq" INTEGER NOT NULL,
    "taklifEtilganYechim" TEXT,

    CONSTRAINT "ActivityGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "raqam" INTEGER NOT NULL,
    "nomi" TEXT NOT NULL,
    "turi" TEXT NOT NULL,
    "davomiylik" TEXT NOT NULL,
    "joyJihoz" TEXT NOT NULL,
    "joyTuri" TEXT NOT NULL,
    "algoritm" TEXT NOT NULL,
    "metodikEslatma" TEXT NOT NULL,
    "mosFanlar" TEXT NOT NULL,
    "moslashtirilganVariant" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTopic" (
    "id" TEXT NOT NULL,
    "tartib" INTEGER NOT NULL,
    "nomi" TEXT NOT NULL,
    "maruzaSoat" INTEGER NOT NULL DEFAULT 0,
    "amaliySoat" INTEGER NOT NULL DEFAULT 0,
    "mustaqilSoat" INTEGER NOT NULL DEFAULT 0,
    "kontent" TEXT,

    CONSTRAINT "CourseTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "korilgan" BOOLEAN NOT NULL DEFAULT false,
    "testBall" INTEGER NOT NULL DEFAULT 0,
    "testMax" INTEGER NOT NULL DEFAULT 0,
    "topshiriqMatn" TEXT,
    "topshiriqTopshirildi" BOOLEAN NOT NULL DEFAULT false,
    "bajarildi" BOOLEAN NOT NULL DEFAULT false,
    "yangilangan" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nuqta" TEXT NOT NULL,
    "javoblar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nuqta" TEXT NOT NULL,
    "ball" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "javoblar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReflectiveEssay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nuqta" TEXT NOT NULL,
    "matn" TEXT NOT NULL,
    "ball" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReflectiveEssay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nuqta" TEXT NOT NULL,
    "motivatsionBall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kognitivBall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "faoliyatliBall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refleksivBall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "obyektivBall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "integralBall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daraja" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservationCard" (
    "id" TEXT NOT NULL,
    "oqituvchiId" TEXT NOT NULL,
    "lessonPlanId" TEXT,
    "pauzaTuri" TEXT,
    "otkazildi" BOOLEAN NOT NULL DEFAULT false,
    "ishtirokDarajasi" TEXT,
    "izoh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservationCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "oqituvchiId" TEXT NOT NULL,
    "nomi" TEXT NOT NULL,
    "kun" TEXT NOT NULL,
    "boshlanish" TEXT NOT NULL,
    "tugash" TEXT NOT NULL,
    "guruhNomi" TEXT,
    "cardIds" TEXT NOT NULL DEFAULT '[]',
    "pauzaIzoh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "nomi" TEXT NOT NULL,
    "shart" TEXT NOT NULL,
    "ikonka" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "berilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaolHaftaKun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sana" TIMESTAMP(3) NOT NULL,
    "qoidalar" TEXT NOT NULL DEFAULT '[false,false,false,false,false]',

    CONSTRAINT "FaolHaftaKun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "nomi" TEXT NOT NULL,
    "boshlanish" TIMESTAMP(3) NOT NULL,
    "tugash" TIMESTAMP(3) NOT NULL,
    "tur" TEXT NOT NULL DEFAULT 'guruh',
    "qoidalar" TEXT NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_userId_sana_key" ON "DailyEntry"("userId", "sana");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyGoal_userId_hafta_maqsadTuri_key" ON "WeeklyGoal"("userId", "hafta", "maqsadTuri");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReflection_userId_hafta_key" ON "WeeklyReflection"("userId", "hafta");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_groupId_kun_key" ON "Schedule"("groupId", "kun");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityGap_groupId_kun_boshlanish_key" ON "ActivityGap"("groupId", "kun", "boshlanish");

-- CreateIndex
CREATE UNIQUE INDEX "Card_raqam_key" ON "Card"("raqam");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_cardId_key" ON "Favorite"("userId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseTopic_tartib_key" ON "CourseTopic"("tartib");

-- CreateIndex
CREATE UNIQUE INDEX "TopicProgress_userId_topicId_key" ON "TopicProgress"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_userId_nuqta_key" ON "SurveyResponse"("userId", "nuqta");

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_userId_nuqta_key" ON "TestResult"("userId", "nuqta");

-- CreateIndex
CREATE UNIQUE INDEX "ReflectiveEssay_userId_nuqta_key" ON "ReflectiveEssay"("userId", "nuqta");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_userId_nuqta_key" ON "Assessment"("userId", "nuqta");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_kod_key" ON "Badge"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "FaolHaftaKun_userId_sana_key" ON "FaolHaftaKun"("userId", "sana");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_tyutorId_fkey" FOREIGN KEY ("tyutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyGoal" ADD CONSTRAINT "WeeklyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReflection" ADD CONSTRAINT "WeeklyReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityGap" ADD CONSTRAINT "ActivityGap_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CourseTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CourseTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReflectiveEssay" ADD CONSTRAINT "ReflectiveEssay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationCard" ADD CONSTRAINT "ObservationCard_oqituvchiId_fkey" FOREIGN KEY ("oqituvchiId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationCard" ADD CONSTRAINT "ObservationCard_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_oqituvchiId_fkey" FOREIGN KEY ("oqituvchiId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaolHaftaKun" ADD CONSTRAINT "FaolHaftaKun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
