-- Drop old unique constraint (testeId + colaboradorId)
ALTER TABLE "TesteAtribuido" DROP CONSTRAINT "TesteAtribuido_testeId_colaboradorId_key";

-- Add token column with unique constraint
ALTER TABLE "TesteAtribuido" ADD COLUMN "token" TEXT;

-- Generate tokens for existing rows
UPDATE "TesteAtribuido" SET "token" = gen_random_uuid()::text WHERE "token" IS NULL;

-- Make token NOT NULL and UNIQUE
ALTER TABLE "TesteAtribuido" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "TesteAtribuido" ADD CONSTRAINT "TesteAtribuido_token_key" UNIQUE ("token");
