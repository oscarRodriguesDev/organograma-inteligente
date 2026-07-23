-- AlterTable: Adiciona campos de promoção e ordenação ao modelo Plano
ALTER TABLE "Plano" ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plano" ADD COLUMN     "descontoPercentual" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Plano" ADD COLUMN     "promocaoAtiva" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plano" ADD COLUMN     "promocaoValidade" TIMESTAMP(3);
ALTER TABLE "Plano" ADD COLUMN     "promocaoDescricao" TEXT NOT NULL DEFAULT '';
