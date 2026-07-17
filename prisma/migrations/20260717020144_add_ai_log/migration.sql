-- CreateTable
CREATE TABLE "AILog" (
    "id" TEXT NOT NULL,
    "casoUso" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'nvidia',
    "model" TEXT NOT NULL DEFAULT '',
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "resposta" TEXT,
    "cacheKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AILog_pkey" PRIMARY KEY ("id")
);
