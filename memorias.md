# Memória do Projeto - Organograma Inteligente

## 📌 Sobre
Sistema gerenciador de organogramas empresariais. Permite cadastrar colaboradores, definir hierarquias, visualizar organograma interativo, realizar avaliações, simulações de impacto, testes comportamentais (Fit Cultural, DISC), pesquisa de sentimento, registro de conversas e score consolidado com IA generativa.

## 🧱 Stack
- **Framework:** Next.js 16.2.6
- **React:** 19.2.4
- **Styling:** Tailwind CSS v4
- **Linguagem:** TypeScript
- **Linter:** ESLint (config next)
- **ORM:** Prisma 7.8.0 + PostgreSQL (Supabase)
- **Auth:** JWT (jose) + bcryptjs
- **Organograma:** @xyflow/react (React Flow)
- **IA:** NVIDIA API (meta/llama-3.1-8b-instruct)

## 📐 Arquitetura (Multi-tenant SaaS)
- **Empresa (Tenant):** modelo `Empresa` com slug único
- **Colaborador como usuário:** cada colaborador tem `email`, `senhaHash`, `papel` (ADMIN_PLATAFORMA, CEO, GESTOR, RH, COLABORADOR)
- **Escopo:** todas as queries filtradas por `empresaId`
- **Dados existentes:** migrados para "Empresa Default" (`empresa_default`)

## ✅ Funcionalidades Implementadas

### Core
- CRUD de colaboradores com hierarquia (auto-referência)
- Avaliações de desempenho (6 critérios, 1-5)
- Iniciativas com resultado numérico mensurável
- Métricas mensais (dias trabalhados, faltas, atrasos)
- Seed de 100 colaboradores com hierarquia realista

### Organograma (React Flow)
- Árvore expansível (clique para expandir/recolher)
- Nós arrastáveis e editáveis (duplo clique inline)
- Adicionar/excluir com transferência de subordinados
- Modo simulação: demissão, promoção com cascata
- Relocar hierarquia (botão ⟷ ou clique na edge)
- Proteção contra ciclos
- Impactos automáticos baseados em regras customizáveis

### Testes Comportamentais
- **Fit Cultural:** 10 perguntas, 5 dimensões
- **Teste DISC:** 16 perguntas, 4 dimensões (D/I/S/C)
- **Pesquisa de Sentimento:** emoji + nota + engajamento

### Gestão de Pessoas
- Registro de Conversas (6 tipos: 1:1, feedback, avaliação, etc.)
- Score Consolidado (7 sub-scores com pesos)
- Score → Simulação integrado

### IA (Fase 1 - NVIDIA API)
- Sugestão inteligente de candidatos a promoção
- Geração de feedback em avaliações
- Redação assistida de iniciativas
- Análise de sentimento em comentários
- Cache, feature flags, fallbacks determinísticos

### Autenticação Multi-tenant
- Login por email+senha com bcrypt
- JWT com claims: colaboradorId, empresaId, empresaNome, nome, email, papel
- RBAC básico via Papel (ADMIN_PLATAFORMA, CEO, GESTOR, RH, COLABORADOR)

## 📂 Estrutura
```
src/
  app/           # App Router (26 rotas)
  components/    # UI components (OrganogramaFlow, etc.)
  lib/
    auth.ts      # JWT, login, sessão
    auth-actions.ts  # Server Actions de login/logout
    db.ts        # Acesso a dados
    types.ts     # Tipos compartilhados
    simulacao.ts # Lógica de simulação
    actions.ts   # Server Actions do sistema
    prisma.ts    # Cliente Prisma
    ai/          # Módulo de IA (NVIDIA)
scripts/
  seed-auth.ts   # Seed de admin
  seed-testes.ts # Seed de perguntas
prisma/
  schema.prisma  # Schema multi-tenant
  seed.ts        # Seed de 100 colaboradores
```

## 🚧 Próximos Passos
1. Refatorar db.ts: filtrar TODAS as queries por empresaId da sessão
2. Importação CSV de colaboradores
3. Convite para testes via link
4. Páginas de admin: gestão de empresas, cadastro de novos tenants
5. Middleware de RBAC (proteção de rotas por papel)
