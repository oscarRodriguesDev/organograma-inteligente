'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession, nivelMinimo } from '@/lib/auth'
import { Papel } from '@/lib/types'
import {
  listarTestesAtivosParaEmpresa,
  atribuirTesteParaMultiplosColaboradores,
  listarAtribuicoesDaEmpresa,
  listarColaboradoresParaAtribuicao,
  salvarRespostasTestePorToken,
} from '@/lib/db'

// ─── Guard ─────────────────────────────────────────────
async function verificarGestor() {
  const session = await getSession()
  if (!session || !session.empresaId) {
    redirect('/login')
  }
  if (!nivelMinimo(session, Papel.GESTOR) &&
      session.papel !== Papel.RH &&
      session.papel !== Papel.ADMIN_PLATAFORMA &&
      session.papel !== Papel.ADMIN_SUPORTE) {
    redirect('/')
  }
  return session
}

// ─── Listar Testes Disponíveis ─────────────────────────

export async function listarTestesDisponiveisAction() {
  const session = await verificarGestor()
  const testes = await listarTestesAtivosParaEmpresa(session.empresaId)
  return { testes, empresaId: session.empresaId }
}

// ─── Listar Colaboradores ──────────────────────────────

export async function listarColaboradoresAction() {
  const session = await verificarGestor()
  return listarColaboradoresParaAtribuicao(session.empresaId)
}

// ─── Listar Atribuições ────────────────────────────────

export async function listarAtribuicoesAction() {
  const session = await verificarGestor()
  return listarAtribuicoesDaEmpresa(session.empresaId)
}

// ─── Atribuir Teste (gera tokens) ──────────────────────

export async function atribuirTesteAction(
  testeId: string,
  colaboradorIds: string[]
): Promise<{
  ok: boolean
  sucessos: number
  resultados?: { colaboradorId: string; nome: string; token: string; link: string }[]
  erro?: string
}> {
  const session = await verificarGestor()

  if (!testeId) return { ok: false, sucessos: 0, erro: 'ID do teste é obrigatório' }
  if (!colaboradorIds || colaboradorIds.length === 0) {
    return { ok: false, sucessos: 0, erro: 'Selecione pelo menos um colaborador' }
  }

  const result = await atribuirTesteParaMultiplosColaboradores(
    testeId,
    colaboradorIds,
    session.colaboradorId
  )

  if (result.ok) {
    revalidatePath('/gestao/testes')
    return {
      ok: true,
      sucessos: result.sucessos,
      resultados: result.resultados,
    }
  }

  return { ok: false, sucessos: 0, erro: 'Erro ao atribuir teste' }
}

// ─── Responder Teste via Token (público, sem login) ───

export async function responderTestePorTokenAction(
  token: string,
  respostas: { perguntaId: string; resposta: string }[]
): Promise<{ ok: boolean; erro?: string }> {
  if (!token) return { ok: false, erro: 'Token inválido' }
  if (!respostas || respostas.length === 0) {
    return { ok: false, erro: 'Nenhuma resposta enviada' }
  }

  return salvarRespostasTestePorToken(token, respostas)
}
