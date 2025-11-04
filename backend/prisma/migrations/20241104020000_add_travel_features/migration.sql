-- CreateTable
CREATE TABLE "api_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openrouterKey" TEXT,
    "xfyunAppId" TEXT,
    "xfyunApiKey" TEXT,
    "xfyunApiSecret" TEXT,
    "amapKey" TEXT,
    "baiduMapKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "travelers" INTEGER NOT NULL DEFAULT 1,
    "preferences" JSONB,
    "itinerary" JSONB,
    "suggestions" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "travelPlanId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "voiceRecorded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_configs_userId_key" ON "api_configs"("userId");

-- CreateIndex
CREATE INDEX "travel_plans_userId_idx" ON "travel_plans"("userId");

-- CreateIndex
CREATE INDEX "expenses_travelPlanId_idx" ON "expenses"("travelPlanId");

-- AddForeignKey
ALTER TABLE "api_configs" ADD CONSTRAINT "api_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_plans" ADD CONSTRAINT "travel_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "travel_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

