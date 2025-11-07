/*
  Warnings:

  - A unique constraint covering the columns `[userId,fundId]` on the table `user_funds` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_funds_userId_fundId_key" ON "user_funds"("userId", "fundId");
