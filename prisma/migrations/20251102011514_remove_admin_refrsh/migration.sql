/*
  Warnings:

  - You are about to drop the column `adminId` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_adminId_fkey";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "adminId";
