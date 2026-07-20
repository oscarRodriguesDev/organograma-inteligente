-- AlterTable
ALTER TABLE "Colaborador" ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "tema" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "username" TEXT;
