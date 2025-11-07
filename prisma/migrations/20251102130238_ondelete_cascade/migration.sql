-- DropForeignKey
ALTER TABLE "public"."capital_calls" DROP CONSTRAINT "capital_calls_userFundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."distributions" DROP CONSTRAINT "distributions_userFundId_fkey";

-- DropForeignKey
ALTER TABLE "public"."performance_metrics" DROP CONSTRAINT "performance_metrics_userFundId_fkey";

-- AddForeignKey
ALTER TABLE "capital_calls" ADD CONSTRAINT "capital_calls_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
