-- CreateTable
CREATE TABLE "ProjetoParticipante" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "responsabilidade" TEXT NOT NULL,
    "peso" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjetoParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjetoParticipante_projetoId_colaboradorId_key" ON "ProjetoParticipante"("projetoId", "colaboradorId");

-- AddForeignKey
ALTER TABLE "ProjetoParticipante" ADD CONSTRAINT "ProjetoParticipante_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoParticipante" ADD CONSTRAINT "ProjetoParticipante_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
