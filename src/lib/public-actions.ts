'use server'

import { criarEmpresaComCEO } from './db'
import { redirect } from 'next/navigation'

export async function processarPagamentoMock(_formData: FormData) {
  // Simula delay de 2 segundos de processamento
  await new Promise((r) => setTimeout(r, 2000))
  // Retorna sucesso — a página faz o redirect via query params
  return { success: true }
}

export async function criarContaAction(formData: FormData) {
  const nome = formData.get('nome')?.toString() ?? ''
  const slug = formData.get('slug')?.toString() ?? ''
  const cnpj = formData.get('cnpj')?.toString() ?? ''
  const contatoNome = formData.get('contatoNome')?.toString() ?? ''
  const contatoEmail = formData.get('contatoEmail')?.toString() ?? ''
  const ceoNome = formData.get('ceoNome')?.toString() ?? ''
  const ceoEmail = formData.get('ceoEmail')?.toString() ?? ''
  const ceoSenha = formData.get('ceoSenha')?.toString() ?? ''
  const planoId = formData.get('planoId')?.toString() ?? ''
  const ciclo = formData.get('ciclo')?.toString() ?? 'mensal'

  if (!nome || !slug || !ceoNome || !ceoEmail || !ceoSenha || !planoId) {
    throw new Error('Campos obrigatórios não preenchidos')
  }

  await criarEmpresaComCEO({
    nome,
    slug,
    cnpj,
    contatoNome,
    contatoEmail,
    ceoNome,
    ceoEmail,
    ceoSenha,
    planoId,
    ciclo,
  })

  redirect('/login?sucesso=1')
}
