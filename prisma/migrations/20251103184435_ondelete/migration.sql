-- DropForeignKey
ALTER TABLE "public"."user_funds" DROP CONSTRAINT "user_funds_fundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_funds" DROP CONSTRAINT "user_funds_userId_fkey";

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
