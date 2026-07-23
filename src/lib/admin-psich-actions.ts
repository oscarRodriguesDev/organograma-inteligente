'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import {
  listarTestesPsicologicos,
  buscarTestePsicologico,
  criarTestePsicologico,
  atualizarTestePsicologico,
  alternarStatusTestePsicologico,
  removerTestePsicologico,
  listarEmpresasDisponiveisParaTeste,
  alternarDisponibilidadeEmpresa,
  listarEmpresasAdmin,
} from '@/lib/db'
import type { TipoPerguntaTeste } from '@/lib/types'

// ─── Guard ─────────────────────────────────────────────
async function verificarPsich() {
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PSICH) {
    redirect('/login')
  }
  return session
}

// ─── Listar Testes ────────────────────────────────────

export async function listarTestesAction() {
  const session = await verificarPsich()
  const testes = await listarTestesPsicologicos()
  return testes
}

// ─── Buscar Teste ─────────────────────────────────────

export async function buscarTesteAction(id: string) {
  const session = await verificarPsich()
  return buscarTestePsicologico(id)
}

// ─── Criar Teste ──────────────────────────────────────

export async function criarTesteAction(formData: FormData): Promise<{ ok: boolean; erro?: string; id?: string }> {
  const session = await verificarPsich()

  const titulo = formData.get('titulo')?.toString().trim() ?? ''
  const descricao = formData.get('descricao')?.toString().trim() ?? ''
  const instrucoes = formData.get('instrucoes')?.toString().trim() ?? ''
  const tipo = formData.get('tipo')?.toString().trim() ?? 'personalidade'

  if (!titulo) return { ok: false, erro: 'O título é obrigatório' }
  if (titulo.length > 200) return { ok: false, erro: 'O título deve ter no máximo 200 caracteres' }

  // Parse perguntas do JSON
  const perguntasJson = formData.get('perguntas')?.toString() ?? '[]'
  let perguntas: {
    pergunta: string
    tipo: TipoPerguntaTeste
    opcoes: string[]
    peso: number
    ordem: number
    obrigatoria: boolean
  }[] = []
  try {
    perguntas = JSON.parse(perguntasJson)
  } catch {
    return { ok: false, erro: 'Formato de perguntas inválido' }
  }

  if (perguntas.length === 0) return { ok: false, erro: 'Adicione pelo menos uma pergunta' }

  // Parse empresas selecionadas
  const empresasJson = formData.get('empresas')?.toString() ?? '[]'
  let empresasDisponiveis: string[] = []
  try {
    empresasDisponiveis = JSON.parse(empresasJson)
  } catch {
    return { ok: false, erro: 'Formato de empresas inválido' }
  }

  try {
    const teste = await criarTestePsicologico({
      titulo,
      descricao,
      instrucoes,
      tipo,
      criadoPorId: session.colaboradorId,
      perguntas,
      empresasDisponiveis: empresasDisponiveis.length > 0 ? empresasDisponiveis : undefined,
    })

    revalidatePath('/admin/testes-psicologicos')
    return { ok: true, id: teste.id }
  } catch (e) {
    console.error('Erro ao criar teste:', e)
    return { ok: false, erro: 'Erro ao criar teste psicológico' }
  }
}

// ─── Atualizar Teste ──────────────────────────────────

export async function atualizarTesteAction(id: string, formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  const session = await verificarPsich()

  const titulo = formData.get('titulo')?.toString().trim() ?? ''
  const descricao = formData.get('descricao')?.toString().trim() ?? ''
  const instrucoes = formData.get('instrucoes')?.toString().trim() ?? ''
  const tipo = formData.get('tipo')?.toString().trim() ?? 'personalidade'
  const ativo = formData.get('ativo') === 'on'

  if (!titulo) return { ok: false, erro: 'O título é obrigatório' }

  const perguntasJson = formData.get('perguntas')?.toString() ?? '[]'
  let perguntas: {
    pergunta: string
    tipo: TipoPerguntaTeste
    opcoes: string[]
    peso: number
    ordem: number
    obrigatoria: boolean
  }[] = []
  try {
    perguntas = JSON.parse(perguntasJson)
  } catch {
    return { ok: false, erro: 'Formato de perguntas inválido' }
  }

  if (perguntas.length === 0) return { ok: false, erro: 'Adicione pelo menos uma pergunta' }

  const empresasJson = formData.get('empresas')?.toString() ?? '[]'
  let empresasDisponiveis: string[] = []
  try {
    empresasDisponiveis = JSON.parse(empresasJson)
  } catch {
    return { ok: false, erro: 'Formato de empresas inválido' }
  }

  try {
    await atualizarTestePsicologico(id, {
      titulo,
      descricao,
      instrucoes,
      tipo,
      ativo,
      perguntas,
      empresasDisponiveis,
    })

    revalidatePath('/admin/testes-psicologicos')
    revalidatePath(`/admin/testes-psicologicos/${id}`)
    return { ok: true }
  } catch (e) {
    console.error('Erro ao atualizar teste:', e)
    return { ok: false, erro: 'Erro ao atualizar teste psicológico' }
  }
}

// ─── Alternar Status ─────────────────────────────────

export async function alternarStatusTesteAction(id: string, ativo: boolean): Promise<boolean> {
  await verificarPsich()
  const ok = await alternarStatusTestePsicologico(id, ativo)
  if (ok) {
    revalidatePath('/admin/testes-psicologicos')
  }
  return ok
}

// ─── Remover Teste ───────────────────────────────────

export async function removerTesteAction(id: string): Promise<{ ok: boolean; erro?: string }> {
  await verificarPsich()
  const removido = await removerTestePsicologico(id)
  if (removido) {
    revalidatePath('/admin/testes-psicologicos')
    return { ok: true }
  }
  return { ok: false, erro: 'Erro ao remover teste' }
}

// ─── Empresas Disponíveis ────────────────────────────

export async function listarEmpresasAction() {
  await verificarPsich()
  return listarEmpresasAdmin()
}

export async function alternarDisponibilidadeAction(
  testeId: string,
  empresaId: string,
  ativo: boolean
): Promise<boolean> {
  await verificarPsich()
  return alternarDisponibilidadeEmpresa(testeId, empresaId, ativo)
}
