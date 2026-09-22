-- CreateTable
CREATE TABLE "RoutineTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTemplateDay" (
    "id" TEXT NOT NULL,
    "routineTemplateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoutineTemplateDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTemplateBlock" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoutineTemplateBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTemplateExercise" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "weight" TEXT,
    "restSeconds" INTEGER,
    "notes" TEXT,
    "videoUrl" TEXT,
    "imageData" TEXT,

    CONSTRAINT "RoutineTemplateExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutineTemplateDay_routineTemplateId_idx" ON "RoutineTemplateDay"("routineTemplateId");

-- CreateIndex
CREATE INDEX "RoutineTemplateBlock_dayId_idx" ON "RoutineTemplateBlock"("dayId");

-- CreateIndex
CREATE INDEX "RoutineTemplateExercise_blockId_idx" ON "RoutineTemplateExercise"("blockId");

-- AddForeignKey
ALTER TABLE "RoutineTemplateDay" ADD CONSTRAINT "RoutineTemplateDay_routineTemplateId_fkey" FOREIGN KEY ("routineTemplateId") REFERENCES "RoutineTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplateBlock" ADD CONSTRAINT "RoutineTemplateBlock_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "RoutineTemplateDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplateExercise" ADD CONSTRAINT "RoutineTemplateExercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "RoutineTemplateBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
