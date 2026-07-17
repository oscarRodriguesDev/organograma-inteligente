/*
  Migration: Multi-tenant SaaS
  - Cria enum Papel, modelo Empresa
  - Adiciona empresaId, email, senhaHash, papel às tabelas existentes
  - Cria "Empresa Default" e migra dados existentes
*/

-- 1. Criar o enum Papel
CREATE TYPE "Papel" AS ENUM ('ADMIN_PLATAFORMA', 'CEO', 'GESTOR', 'RH', 'COLABORADOR');

-- 2. Criar tabela Empresa
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Empresa_slug_key" ON "Empresa"("slug");

-- 3. Inserir Empresa Default (para os dados existentes)
INSERT INTO "Empresa" ("id", "nome", "slug") 
VALUES ('empresa_default', 'Empresa Default', 'empresa-default');

-- 4. Adicionar colunas como nullable primeiro (para dados existentes)
ALTER TABLE "Colaborador" ADD COLUMN "email" TEXT;
ALTER TABLE "Colaborador" ADD COLUMN "senhaHash" TEXT;
ALTER TABLE "Colaborador" ADD COLUMN "papel" "Papel" NOT NULL DEFAULT 'COLABORADOR';
ALTER TABLE "Colaborador" ADD COLUMN "empresaId" TEXT;

ALTER TABLE "RegraImpacto" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "Cargo" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "FitCulturalPergunta" ADD COLUMN "empresaId" TEXT;
ALTER TABLE "PerguntaDISC" ADD COLUMN "empresaId" TEXT;

-- 5. Popular empresaId nos registros existentes
UPDATE "Colaborador" SET "empresaId" = 'empresa_default';
UPDATE "RegraImpacto" SET "empresaId" = 'empresa_default';
UPDATE "Cargo" SET "empresaId" = 'empresa_default';
UPDATE "FitCulturalPergunta" SET "empresaId" = 'empresa_default';
UPDATE "PerguntaDISC" SET "empresaId" = 'empresa_default';

-- 6. Tornar colunas NOT NULL (agora que todos os registros têm valor)
ALTER TABLE "Colaborador" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "RegraImpacto" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "Cargo" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "FitCulturalPergunta" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "PerguntaDISC" ALTER COLUMN "empresaId" SET NOT NULL;

-- 7. Remover unique antigo de Cargo e criar novo composto
DROP INDEX IF EXISTS "Cargo_nome_key";
CREATE UNIQUE INDEX "Cargo_empresaId_nome_key" ON "Cargo"("empresaId", "nome");
CREATE UNIQUE INDEX "Colaborador_empresaId_email_key" ON "Colaborador"("empresaId", "email");

-- 8. Adicionar chaves estrangeiras
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RegraImpacto" ADD CONSTRAINT "RegraImpacto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FitCulturalPergunta" ADD CONSTRAINT "FitCulturalPergunta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PerguntaDISC" ADD CONSTRAINT "PerguntaDISC_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
