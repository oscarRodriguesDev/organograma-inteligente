/*
  Warnings:

  - You are about to drop the column `colaboradorId` on the `Impacto` table. All the data in the column will be lost.
  - You are about to drop the column `colaboradorNome` on the `Impacto` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `Impacto` table. All the data in the column will be lost.
  - You are about to drop the column `regraId` on the `Impacto` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Impacto` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `Impacto` table. All the data in the column will be lost.
  - You are about to drop the `AILog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `casoUso` to the `Impacto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Impacto" DROP COLUMN "colaboradorId",
DROP COLUMN "colaboradorNome",
DROP COLUMN "descricao",
DROP COLUMN "regraId",
DROP COLUMN "tipo",
DROP COLUMN "titulo",
ADD COLUMN     "cacheKey" TEXT,
ADD COLUMN     "casoUso" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "erro" TEXT,
ADD COLUMN     "latencyMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'nvidia',
ADD COLUMN     "resposta" TEXT,
ADD COLUMN     "tokensIn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokensOut" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "AILog";

-- CreateTable
CREATE TABLE "FitCulturalPergunta" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "dimensao" TEXT NOT NULL,
    "peso" INTEGER NOT NULL DEFAULT 1,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitCulturalPergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitCulturalResposta" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitCulturalResposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerguntaDISC" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "dimensao" TEXT NOT NULL,
    "peso" INTEGER NOT NULL DEFAULT 1,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerguntaDISC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespostaDISC" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RespostaDISC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoDISC" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "pontuacaoD" INTEGER NOT NULL DEFAULT 0,
    "pontuacaoI" INTEGER NOT NULL DEFAULT 0,
    "pontuacaoS" INTEGER NOT NULL DEFAULT 0,
    "pontuacaoC" INTEGER NOT NULL DEFAULT 0,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultadoDISC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesquisaSentimento" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "sentimento" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "engajamento" INTEGER,
    "motivacao" INTEGER,
    "pertencimento" INTEGER,
    "comentario" TEXT NOT NULL DEFAULT '',
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PesquisaSentimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "assunto" TEXT NOT NULL DEFAULT '',
    "resumo" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "pontosPositivos" TEXT NOT NULL DEFAULT '',
    "pontosMelhoria" TEXT NOT NULL DEFAULT '',
    "realizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoPorId" TEXT,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreColaborador" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "scoreGeral" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreFitCultural" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreDISC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreSentimento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreConversas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreAvaliacoes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreMetricas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreIniciativas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ultimaAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreColaborador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoDISC_colaboradorId_key" ON "ResultadoDISC"("colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreColaborador_colaboradorId_key" ON "ScoreColaborador"("colaboradorId");

-- AddForeignKey
ALTER TABLE "FitCulturalResposta" ADD CONSTRAINT "FitCulturalResposta_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitCulturalResposta" ADD CONSTRAINT "FitCulturalResposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "FitCulturalPergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaDISC" ADD CONSTRAINT "RespostaDISC_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaDISC" ADD CONSTRAINT "RespostaDISC_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "PerguntaDISC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoDISC" ADD CONSTRAINT "ResultadoDISC_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesquisaSentimento" ADD CONSTRAINT "PesquisaSentimento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreColaborador" ADD CONSTRAINT "ScoreColaborador_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
