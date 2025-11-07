/*
  Warnings:

  - Changed the type of `status` on the `capital_calls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CapitalCallStatus" AS ENUM ('Pending', 'Paid', 'LatePayment');

-- AlterTable
ALTER TABLE "capital_calls" DROP COLUMN "status",
ADD COLUMN     "status" "CapitalCallStatus" NOT NULL;
