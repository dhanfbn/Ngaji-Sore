-- AlterTable
ALTER TABLE "LessonPlanMingguan" DROP CONSTRAINT "LessonPlanMingguan_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "id_lesson_plan" DROP NOT NULL,
ADD CONSTRAINT "LessonPlanMingguan_pkey" PRIMARY KEY ("id");

