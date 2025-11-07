/*
  Warnings:

  - The primary key for the `reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "reports" DROP CONSTRAINT "reports_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");
