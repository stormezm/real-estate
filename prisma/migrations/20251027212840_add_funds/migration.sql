-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('MixedUse', 'Residential');

-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('Active', 'Closed');

-- CreateTable
CREATE TABLE "funds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "FundStatus" NOT NULL DEFAULT 'Active',
    "fundType" "FundType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);
