-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "liderImediatoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ativo',

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criterios" TEXT NOT NULL,
    "comentarioGeral" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricaMensal" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "diasTrabalhados" INTEGER NOT NULL,
    "faltasInjustificadas" INTEGER NOT NULL,
    "horasAtraso" INTEGER NOT NULL,
    "observacao" TEXT NOT NULL DEFAULT '',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricaMensal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Iniciativa" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "resultado" TEXT NOT NULL DEFAULT '',
    "valorResultado" DOUBLE PRECISION NOT NULL,
    "unidadeMedida" TEXT NOT NULL DEFAULT '',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Iniciativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegraImpacto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL,
    "condicao" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RegraImpacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Impacto" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "colaboradorId" TEXT,
    "colaboradorNome" TEXT,
    "regraId" TEXT,

    CONSTRAINT "Impacto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_liderImediatoId_fkey" FOREIGN KEY ("liderImediatoId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricaMensal" ADD CONSTRAINT "MetricaMensal_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Iniciativa" ADD CONSTRAINT "Iniciativa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
