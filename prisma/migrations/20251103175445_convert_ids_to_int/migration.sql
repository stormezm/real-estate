/*
  Warnings:

  - The primary key for the `admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `capital_calls` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `capital_calls` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `distributions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `distributions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `funds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `funds` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `performance_metrics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `performance_metrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `refresh_tokens` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_funds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user_funds` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userFundId` on the `capital_calls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userFundId` on the `distributions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userFundId` on the `performance_metrics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `refresh_tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_funds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fundId` on the `user_funds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."capital_calls" DROP CONSTRAINT "capital_calls_userFundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."distributions" DROP CONSTRAINT "distributions_userFundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."performance_metrics" DROP CONSTRAINT "performance_metrics_userFundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_funds" DROP CONSTRAINT "user_funds_fundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_funds" DROP CONSTRAINT "user_funds_userId_fkey";

-- AlterTable
ALTER TABLE "admins" DROP CONSTRAINT "admins_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "capital_calls" DROP CONSTRAINT "capital_calls_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userFundId",
ADD COLUMN     "userFundId" INTEGER NOT NULL,
ADD CONSTRAINT "capital_calls_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "distributions" DROP CONSTRAINT "distributions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userFundId",
ADD COLUMN     "userFundId" INTEGER NOT NULL,
ADD CONSTRAINT "distributions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "funds" DROP CONSTRAINT "funds_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "funds_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "performance_metrics" DROP CONSTRAINT "performance_metrics_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userFundId",
ADD COLUMN     "userFundId" INTEGER NOT NULL,
ADD CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_funds" DROP CONSTRAINT "user_funds_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "fundId",
ADD COLUMN     "fundId" INTEGER NOT NULL,
ADD CONSTRAINT "user_funds_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_userFundId_key" ON "performance_metrics"("userFundId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_calls" ADD CONSTRAINT "capital_calls_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
