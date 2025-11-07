-- CreateTable
CREATE TABLE "user_funds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "investmentDate" TIMESTAMP(3) NOT NULL,
    "commitmentAmount" DOUBLE PRECISION NOT NULL,
    "status" "FundStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_calls" (
    "id" TEXT NOT NULL,
    "userFundId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amountCalled" DOUBLE PRECISION NOT NULL,
    "callDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capital_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributions" (
    "id" TEXT NOT NULL,
    "userFundId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "distributionDate" TIMESTAMP(3) NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "statementUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "userFundId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "irr" DOUBLE PRECISION,
    "moic" DOUBLE PRECISION,
    "nav" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_userFundId_key" ON "performance_metrics"("userFundId");

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_calls" ADD CONSTRAINT "capital_calls_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_userFundId_fkey" FOREIGN KEY ("userFundId") REFERENCES "user_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
