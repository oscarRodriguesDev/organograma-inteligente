/**
 * Seed: Define email + senha para admin/CEO.
 * Usa Pool do pg diretamente para evitar dependência do adaptador Prisma.
 *
 * Uso: npx tsx scripts/seed-auth.ts
 */
import 'dotenv/config'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })

  console.log('🔄 Verificando dados existentes...')

  // Busca CEO existente
  const { rows: ceos } = await pool.query(
    `SELECT id, nome, email FROM "Colaborador" WHERE papel = 'CEO' LIMIT 1`
  )

  let adminId: string
  let adminNome: string

  if (ceos.length > 0) {
    adminId = ceos[0].id
    adminNome = ceos[0].nome
    console.log(`   CEO encontrado: ${adminNome}`)
  } else {
    // Busca primeiro colaborador
    const { rows: first } = await pool.query(
      `SELECT id, nome FROM "Colaborador" ORDER BY "createdAt" ASC LIMIT 1`
    )

    if (first.length > 0) {
      adminId = first[0].id
      adminNome = first[0].nome
      console.log(`   Primeiro colaborador: ${adminNome}`)
    } else {
      console.log('⚠️  Nenhum colaborador encontrado. Criando admin...')
      const { rows: emp } = await pool.query(
        `SELECT id FROM "Empresa" WHERE slug = 'empresa-default' LIMIT 1`
      )
      const empresaId = emp.length > 0 ? emp[0].id : 'empresa_default'
      const { rows: created } = await pool.query(
        `INSERT INTO "Colaborador" (id, "empresaId", nome, funcao, papel, status) 
         VALUES (gen_random_uuid()::text, $1, 'Admin', 'CEO', 'CEO', 'ativo')
         RETURNING id, nome`,
        [empresaId]
      )
      adminId = created[0].id
      adminNome = created[0].nome
    }
  }

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@empresa.com'
  const senha = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const senhaHash = await bcrypt.hash(senha, 10)

  await pool.query(
    `UPDATE "Colaborador" SET email = $1, "senhaHash" = $2, papel = 'CEO' WHERE id = $3`,
    [email, senhaHash, adminId]
  )

  console.log(`\n✅ Admin configurado:`)
  console.log(`   Nome: ${adminNome}`)
  console.log(`   Email: ${email}`)
  console.log(`   Senha: ${senha}`)
  console.log(`   Papel: CEO`)

  // Lista colaboradores sem email (até 10)
  const { rows: semEmail } = await pool.query(
    `SELECT nome, funcao FROM "Colaborador" WHERE email IS NULL LIMIT 10`
  )

  if (semEmail.length > 0) {
    console.log(`\n⚠️  ${semEmail.length}+ colaboradores sem email:`)
    semEmail.forEach((c: any) => console.log(`   - ${c.nome} (${c.funcao})`))
  }

  await pool.end()
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
