/*
  Warnings:

  - Changed the type of `amountPaid` on the `distributions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "distributions" DROP COLUMN "amountPaid",
ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL;
