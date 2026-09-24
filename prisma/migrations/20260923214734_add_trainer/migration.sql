-- AlterTable
ALTER TABLE "ExerciseTemplate" ADD COLUMN     "trainerId" TEXT;

-- AlterTable
ALTER TABLE "RoutineTemplate" ADD COLUMN     "trainerId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "trainerId" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "trainerId" TEXT;

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE INDEX "ExerciseTemplate_trainerId_idx" ON "ExerciseTemplate"("trainerId");

-- CreateIndex
CREATE INDEX "RoutineTemplate_trainerId_idx" ON "RoutineTemplate"("trainerId");

-- CreateIndex
CREATE INDEX "Student_trainerId_idx" ON "Student"("trainerId");

-- CreateIndex
CREATE INDEX "Team_trainerId_idx" ON "Team"("trainerId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplate" ADD CONSTRAINT "RoutineTemplate_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
