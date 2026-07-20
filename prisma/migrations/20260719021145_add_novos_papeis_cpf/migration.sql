-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Papel" ADD VALUE 'DIRETOR';
ALTER TYPE "Papel" ADD VALUE 'GERENTE';
ALTER TYPE "Papel" ADD VALUE 'SUPERVISOR';
ALTER TYPE "Papel" ADD VALUE 'LIDER';
ALTER TYPE "Papel" ADD VALUE 'OPERACIONAL';

-- AlterTable
ALTER TABLE "Colaborador" ADD COLUMN     "cpf" TEXT;
