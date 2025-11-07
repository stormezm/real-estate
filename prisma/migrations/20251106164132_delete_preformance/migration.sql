/*
  Warnings:

  - You are about to drop the `performance_metrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."performance_metrics" DROP CONSTRAINT "performance_metrics_userFundId_fkey";

-- DropTable
DROP TABLE "public"."performance_metrics";
