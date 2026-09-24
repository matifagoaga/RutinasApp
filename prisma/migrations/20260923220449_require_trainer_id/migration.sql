/*
  Warnings:

  - Made the column `trainerId` on table `ExerciseTemplate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trainerId` on table `RoutineTemplate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trainerId` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trainerId` on table `Team` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ExerciseTemplate" ALTER COLUMN "trainerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RoutineTemplate" ALTER COLUMN "trainerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "trainerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "trainerId" SET NOT NULL;
