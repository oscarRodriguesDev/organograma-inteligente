-- DropForeignKey
ALTER TABLE "Colaborador" DROP CONSTRAINT "Colaborador_empresaId_fkey";

-- AlterTable
ALTER TABLE "Colaborador" ALTER COLUMN "empresaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "cnpj" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contatoEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contatoNome" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contatoTelefone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dataContratacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "precoMensal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precoAnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxColaboradores" INTEGER NOT NULL DEFAULT 10,
    "recursos" TEXT NOT NULL DEFAULT '[]',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataProximoPagamento" TIMESTAMP(3),
    "dataCancelamento" TIMESTAMP(3),
    "ciclo" TEXT NOT NULL DEFAULT 'mensal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "metodo" TEXT NOT NULL DEFAULT 'cartao_credito',
    "status" TEXT NOT NULL DEFAULT 'aprovado',
    "referenciaExterna" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastoSistema" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "fornecedor" TEXT NOT NULL DEFAULT '',
    "observacao" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GastoSistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plano_slug_key" ON "Plano"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Assinatura_empresaId_key" ON "Assinatura"("empresaId");

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
