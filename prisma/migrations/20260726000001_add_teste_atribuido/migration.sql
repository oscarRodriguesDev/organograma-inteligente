-- CreateTable: TesteAtribuido
CREATE TABLE "TesteAtribuido" (
    "id" TEXT NOT NULL,
    "testeId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "atribuidoPorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "atribuidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),

    CONSTRAINT "TesteAtribuido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TesteAtribuido_testeId_colaboradorId_key" ON "TesteAtribuido"("testeId", "colaboradorId");

-- AddForeignKey
ALTER TABLE "TesteAtribuido" ADD CONSTRAINT "TesteAtribuido_testeId_fkey" FOREIGN KEY ("testeId") REFERENCES "TestePsicologico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesteAtribuido" ADD CONSTRAINT "TesteAtribuido_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesteAtribuido" ADD CONSTRAINT "TesteAtribuido_atribuidoPorId_fkey" FOREIGN KEY ("atribuidoPorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
