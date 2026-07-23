'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'

async function verificarAdmin() {
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PLATAFORMA) {
    redirect('/login')
  }
  return session
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Listar ────────────────────────────────────────────────

export async function listarPlanosAdmin() {
  await verificarAdmin()
  const data = await prisma.plano.findMany({
    orderBy: [{ ordem: 'asc' }, { precoMensal: 'asc' }],
    include: {
      _count: { select: { assinaturas: true } },
    },
  })
  return data.map((p) => ({
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    descricao: p.descricao,
    precoMensal: p.precoMensal,
    precoAnual: p.precoAnual,
    maxColaboradores: p.maxColaboradores,
    recursos: JSON.parse(p.recursos),
    destaque: p.destaque,
    ativo: p.ativo,
    ordem: p.ordem,
    descontoPercentual: p.descontoPercentual,
    promocaoAtiva: p.promocaoAtiva,
    promocaoValidade: p.promocaoValidade?.toISOString() ?? null,
    promocaoDescricao: p.promocaoDescricao,
    totalAssinaturas: p._count.assinaturas,
    createdAt: p.createdAt.toISOString(),
  }))
}

// ─── Criar ─────────────────────────────────────────────────

export async function criarPlanoAction(formData: FormData) {
  await verificarAdmin()

  const nome = formData.get('nome')?.toString()?.trim() ?? ''
  const slugManual = formData.get('slug')?.toString()?.trim() ?? ''
  const descricao = formData.get('descricao')?.toString()?.trim() ?? ''
  const precoMensal = parseFloat(formData.get('precoMensal')?.toString() ?? '0')
  const precoAnual = parseFloat(formData.get('precoAnual')?.toString() ?? '0')
  const maxColaboradores = parseInt(formData.get('maxColaboradores')?.toString() ?? '10')
  const recursosRaw = formData.get('recursos')?.toString() ?? ''
  const destaque = formData.get('destaque') === 'on'
  const ativo = formData.get('ativo') !== 'off' // default true
  const ordem = parseInt(formData.get('ordem')?.toString() ?? '0')
  const descontoPercentual = parseFloat(formData.get('descontoPercentual')?.toString() ?? '0')
  const promocaoAtiva = formData.get('promocaoAtiva') === 'on'
  const promocaoValidadeRaw = formData.get('promocaoValidade')?.toString() ?? ''
  const promocaoDescricao = formData.get('promocaoDescricao')?.toString()?.trim() ?? ''

  if (!nome) {
    return { ok: false, erro: 'Nome do plano é obrigatório' }
  }

  if (precoMensal < 0 || precoAnual < 0) {
    return { ok: false, erro: 'Preço não pode ser negativo' }
  }

  // Gera slug automático se não foi informado
  const slug = slugManual || slugify(nome)
  if (!slug) {
    return { ok: false, erro: 'Slug inválido' }
  }

  // Verifica se slug já existe
  const existente = await prisma.plano.findUnique({ where: { slug } })
  if (existente) {
    return { ok: false, erro: `Já existe um plano com o slug "${slug}"` }
  }

  // Processa recursos: um por linha ou separado por vírgula
  const recursos = recursosRaw
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r.length > 0)

  const promocaoValidade = promocaoValidadeRaw ? new Date(promocaoValidadeRaw) : null

  await prisma.plano.create({
    data: {
      nome,
      slug,
      descricao,
      precoMensal,
      precoAnual,
      maxColaboradores,
      recursos: JSON.stringify(recursos),
      destaque,
      ativo,
      ordem,
      descontoPercentual,
      promocaoAtiva,
      promocaoValidade,
      promocaoDescricao,
    },
  })

  revalidatePath('/admin/planos')
  revalidatePath('/')
  return { ok: true }
}

// ─── Atualizar ─────────────────────────────────────────────

export async function atualizarPlanoAction(planoId: string, formData: FormData) {
  await verificarAdmin()

  const nome = formData.get('nome')?.toString()?.trim()
  const slug = formData.get('slug')?.toString()?.trim()
  const descricao = formData.get('descricao')?.toString()?.trim()
  const precoMensal = formData.get('precoMensal') ? parseFloat(formData.get('precoMensal')!.toString()) : undefined
  const precoAnual = formData.get('precoAnual') ? parseFloat(formData.get('precoAnual')!.toString()) : undefined
  const maxColaboradores = formData.get('maxColaboradores') ? parseInt(formData.get('maxColaboradores')!.toString()) : undefined
  const recursosRaw = formData.get('recursos')?.toString()
  const destaque = formData.get('destaque') === 'on'
  const ativo = formData.get('ativo') !== 'off'
  const ordem = formData.get('ordem') ? parseInt(formData.get('ordem')!.toString()) : undefined
  const descontoPercentual = formData.get('descontoPercentual') ? parseFloat(formData.get('descontoPercentual')!.toString()) : undefined
  const promocaoAtiva = formData.get('promocaoAtiva') === 'on'
  const promocaoValidadeRaw = formData.get('promocaoValidade')?.toString()
  const promocaoDescricao = formData.get('promocaoDescricao')?.toString()?.trim()

  if (!nome) {
    return { ok: false, erro: 'Nome do plano é obrigatório' }
  }

  // Verifica slug único (se mudou)
  if (slug) {
    const existente = await prisma.plano.findFirst({
      where: { slug, id: { not: planoId } },
    })
    if (existente) {
      return { ok: false, erro: `Já existe outro plano com o slug "${slug}"` }
    }
  }

  // Processa recursos
  let recursosJson: string | undefined
  if (recursosRaw !== undefined) {
    const recursos = recursosRaw
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
    recursosJson = JSON.stringify(recursos)
  }

  const promocaoValidade = promocaoValidadeRaw ? new Date(promocaoValidadeRaw) : null

  const data: any = {}
  if (nome !== undefined) data.nome = nome
  if (slug !== undefined) data.slug = slug
  if (descricao !== undefined) data.descricao = descricao
  if (precoMensal !== undefined) data.precoMensal = precoMensal
  if (precoAnual !== undefined) data.precoAnual = precoAnual
  if (maxColaboradores !== undefined) data.maxColaboradores = maxColaboradores
  if (recursosJson !== undefined) data.recursos = recursosJson
  data.destaque = destaque
  data.ativo = ativo
  if (ordem !== undefined) data.ordem = ordem
  if (descontoPercentual !== undefined) data.descontoPercentual = descontoPercentual
  data.promocaoAtiva = promocaoAtiva
  data.promocaoValidade = promocaoValidade
  if (promocaoDescricao !== undefined) data.promocaoDescricao = promocaoDescricao

  await prisma.plano.update({
    where: { id: planoId },
    data,
  })

  revalidatePath('/admin/planos')
  revalidatePath('/')
  return { ok: true }
}

// ─── Excluir ───────────────────────────────────────────────

export async function excluirPlanoAction(planoId: string) {
  await verificarAdmin()

  // Verifica se há assinaturas ativas usando este plano
  const assinaturas = await prisma.assinatura.count({
    where: { planoId, status: { not: 'cancelada' } },
  })

  if (assinaturas > 0) {
    return {
      ok: false,
      erro: `Não é possível excluir este plano: ${assinaturas} assinatura(s) ativa(s) dependem dele. Desative o plano primeiro.`,
    }
  }

  // Remove assinaturas canceladas e pagamentos relacionados
  const assinaturasCanceladas = await prisma.assinatura.findMany({
    where: { planoId, status: 'cancelada' },
    select: { id: true },
  })

  for (const a of assinaturasCanceladas) {
    await prisma.pagamento.deleteMany({ where: { assinaturaId: a.id } })
  }
  await prisma.assinatura.deleteMany({ where: { planoId, status: 'cancelada' } })

  await prisma.plano.delete({ where: { id: planoId } })

  revalidatePath('/admin/planos')
  revalidatePath('/')
  return { ok: true }
}

// ─── Alternar Status (Ativar/Desativar) ────────────────────

export async function alternarStatusPlanoAction(planoId: string, ativo: boolean) {
  await verificarAdmin()

  await prisma.plano.update({
    where: { id: planoId },
    data: { ativo },
  })

  revalidatePath('/admin/planos')
  revalidatePath('/')
  return { ok: true }
}

// ─── Alternar Destaque ─────────────────────────────────────

export async function alternarDestaquePlanoAction(planoId: string, destaque: boolean) {
  await verificarAdmin()

  await prisma.plano.update({
    where: { id: planoId },
    data: { destaque },
  })

  revalidatePath('/admin/planos')
  revalidatePath('/')
  return { ok: true }
}
