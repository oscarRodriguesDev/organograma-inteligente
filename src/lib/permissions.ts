import { Papel, HIERARQUIA_PAPEIS } from './types'
import type { Colaborador } from './types'

/**
 * Sistema de permissões baseado em papéis.
 * Define o que cada papel pode fazer no sistema.
 */

// ─── Helpers ───────────────────────────────────────

function indiceHierarquia(papel: Papel): number {
  const idx = HIERARQUIA_PAPEIS.indexOf(papel)
  return idx === -1 ? Infinity : idx
}

function papelAbaixoDe(papel: Papel, limite: Papel): boolean {
  return indiceHierarquia(papel) < indiceHierarquia(limite)
}

// ─── Verificações de edição do organograma ─────────

/**
 * Um usuário pode editar um colaborador se o colaborador estiver
 * abaixo dele na hierarquia (ou for ele mesmo, para foto/senha).
 */
export function podeEditarColaborador(
  sessionPapel: Papel,
  sessionEmpresaId: string,
  alvo: Colaborador
): boolean {
  // Admin da plataforma pode editar qualquer um
  if (sessionPapel === Papel.ADMIN_PLATAFORMA || sessionPapel === Papel.ADMIN_SUPORTE || sessionPapel === Papel.ADMIN_PSICH) return true

  // CEO pode editar todo o organograma da empresa
  if (sessionPapel === Papel.CEO) return alvo.empresaId === sessionEmpresaId

  // Diretores, Gerentes, Supervisores, Gestores, Lideres podem editar
  // quem está abaixo deles na hierarquia
  if (indiceHierarquia(sessionPapel) >= indiceHierarquia(Papel.LIDER)) {
    return (
      alvo.empresaId === sessionEmpresaId &&
      indiceHierarquia(alvo.papel) < indiceHierarquia(sessionPapel)
    )
  }

  return false
}

// ─── Contratação ───────────────────────────────────

export function podeContratar(sessionPapel: Papel, papelContratado: Papel): boolean {
  switch (sessionPapel) {
    case Papel.ADMIN_PLATAFORMA:
    case Papel.ADMIN_SUPORTE:
      return true
    case Papel.ADMIN_PSICH:
      return false
    case Papel.CEO:
      return papelContratado === Papel.DIRETOR
    case Papel.DIRETOR:
      return papelContratado === Papel.SUPERVISOR
    case Papel.GERENTE:
      return papelContratado === Papel.SUPERVISOR
    case Papel.SUPERVISOR:
      return papelContratado === Papel.GESTOR
    case Papel.GESTOR:
      return papelContratado === Papel.LIDER
    case Papel.LIDER:
      return papelContratado === Papel.OPERACIONAL
    default:
      return false
  }
}

// ─── Demissão ─────────────────────────────────────

export function podeDemitir(sessionPapel: Papel, papelAlvo: Papel): boolean {
  switch (sessionPapel) {
    case Papel.ADMIN_PLATAFORMA:
    case Papel.ADMIN_SUPORTE:
      return true
    case Papel.ADMIN_PSICH:
      return false
    case Papel.CEO:
      return papelAlvo === Papel.DIRETOR
    case Papel.DIRETOR:
      return papelAlvo === Papel.GERENTE
    case Papel.GERENTE:
      return papelAlvo === Papel.SUPERVISOR
    case Papel.SUPERVISOR:
      return papelAlvo === Papel.GESTOR
    case Papel.GESTOR:
      return papelAlvo === Papel.LIDER
    case Papel.LIDER:
      return papelAlvo === Papel.OPERACIONAL
    default:
      return false
  }
}

// ─── Promoção ─────────────────────────────────────

export function podePromoverPara(sessionPapel: Papel, papelAlvo: Papel): boolean {
  switch (sessionPapel) {
    case Papel.ADMIN_PLATAFORMA:
    case Papel.ADMIN_SUPORTE:
      return true
    case Papel.ADMIN_PSICH:
      return false
    case Papel.CEO:
      // CEO pode promover Gerentes a Diretores (decisão em conselho)
      return papelAlvo === Papel.GERENTE
    case Papel.DIRETOR:
      return papelAlvo === Papel.SUPERVISOR
    case Papel.GERENTE:
      return papelAlvo === Papel.GESTOR
    case Papel.SUPERVISOR:
      return papelAlvo === Papel.LIDER
    case Papel.GESTOR:
      return papelAlvo === Papel.OPERACIONAL
    default:
      return false
  }
}

// ─── Regras de Promoção ────────────────────────────

export function podeCriarRegrasPromocao(sessionPapel: Papel): boolean {
  switch (sessionPapel) {
    case Papel.ADMIN_PLATAFORMA:
    case Papel.ADMIN_SUPORTE:
    case Papel.CEO:
      return true
    case Papel.ADMIN_PSICH:
      return false
      return true
    default:
      return false
  }
}

/** Retorna para qual papel o usuário pode criar regras de promoção */
export function papelAlvoRegrasPromocao(sessionPapel: Papel): Papel | null {
  switch (sessionPapel) {
    case Papel.CEO:
      return Papel.GERENTE // CEO cria regras para promoção de Gerentes a Diretores
    case Papel.DIRETOR:
      return Papel.GERENTE
    case Papel.GERENTE:
      return Papel.GESTOR
    case Papel.SUPERVISOR:
      return Papel.LIDER
    case Papel.GESTOR:
      return Papel.OPERACIONAL
    default:
      return null
  }
}

// ─── Ações do colaborador ──────────────────────────

export type AcoesColaborador = {
  podeAlterarFoto: boolean
  podeAlterarSenha: boolean
  podeFazerTestes: boolean
  podeVerOrganograma: boolean
  podeSolicitarTestes: boolean
  podeReuniao1a1: boolean
  podeReuniao1aTodos: boolean
  podeAvaliarDesempenho: boolean
  podeDarFeedback: boolean
}

export function obterAcoesColaborador(papel: Papel): AcoesColaborador {
  const base: AcoesColaborador = {
    podeAlterarFoto: true,
    podeAlterarSenha: true,
    podeFazerTestes: true,
    podeVerOrganograma: true,
    podeSolicitarTestes: false,
    podeReuniao1a1: false,
    podeReuniao1aTodos: false,
    podeAvaliarDesempenho: false,
    podeDarFeedback: false,
  }

  switch (papel) {
    case Papel.ADMIN_PLATAFORMA:
    case Papel.ADMIN_SUPORTE:
    case Papel.ADMIN_PSICH:
      return { ...base, podeSolicitarTestes: true, podeDarFeedback: true }

    case Papel.CEO:
      return {
        ...base,
        podeSolicitarTestes: true,
        podeReuniao1a1: true,
        podeReuniao1aTodos: true,
        podeAvaliarDesempenho: true,
        podeDarFeedback: true,
      }

    case Papel.DIRETOR:
      return {
        ...base,
        podeSolicitarTestes: true,
        podeReuniao1a1: true,
        podeReuniao1aTodos: true,
        podeAvaliarDesempenho: true,
        podeDarFeedback: true,
      }

    case Papel.GERENTE:
      return {
        ...base,
        podeSolicitarTestes: true,
        podeReuniao1a1: true,
        podeReuniao1aTodos: true,
        podeAvaliarDesempenho: true,
        podeDarFeedback: true,
      }

    case Papel.SUPERVISOR:
      return {
        ...base,
        podeSolicitarTestes: true,
        podeDarFeedback: true,
      }

    case Papel.GESTOR:
      return {
        ...base,
        podeSolicitarTestes: true,
        podeDarFeedback: true,
      }

    case Papel.LIDER:
      return {
        ...base,
        podeDarFeedback: true,
      }

    case Papel.OPERACIONAL:
    case Papel.RH:
    case Papel.COLABORADOR:
      return base

    default:
      return base
  }
}
