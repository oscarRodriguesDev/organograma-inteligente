/**
 * Cria usuário ADMIN_PLATAFORMA
 * Uso: npx tsx scripts/criar-admin.ts
 */
import { criarAdminSistema } from '../src/lib/db'

async function main() {
  const ok = await criarAdminSistema({
    nome: 'admin',
    email: 'admin@sistema.com',
    senha: '123456',
  })

  if (ok) {
    console.log('✅ Admin criado com sucesso!')
    console.log('   Nome: admin')
    console.log('   Email: admin@sistema.com')
    console.log('   Senha: 123456')
    console.log('   Papel: ADMIN_PLATAFORMA')
  } else {
    console.log('⚠️  Admin já existe (email admin@sistema.com já cadastrado)')
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
