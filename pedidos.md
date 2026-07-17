# 📋 Pedidos — Organograma Inteligente

| # | Data | Pedido | Commit | Status |
|---|------|--------|--------|--------|
| 1 | 16/07/2026 | "Nosso sistema já está usando IA?" — Análise de uso atual + "Antes de fazer, me mostre onde cabe o uso" — Mapeamento de oportunidades de IA | — | ✅ Análise entregue (ideias.md + memoria.md) |
| 2 | 16/07/2026 | "Quero a fase um, use a nvidia_api_key" — Implementar Fase 1 (4 casos de uso) usando NVIDIA API | — | ✅ Implementado (build passou, FF ativas) |
| 3 | 16/07/2026 | Criar funções de acesso a dados complementares (Fit Cultural, DISC, Sentimento, Conversas, Score) em `src/lib/db.ts` + script de seed `scripts/seed-testes.ts` | — | ✅ Implementado (build passou) |
| 4 | 16/07/2026 | Criar páginas: /fit-cultural, /teste-disc, /teste-disc/resultados, /pesquisa-sentimento, /conversas, /conversas/nova, /conversas/[id] + actions + links no layout | — | ✅ Páginas já existiam (v0.12). Ajustes: redirect DISC para /resultados, emojis da pesquisa de sentimento |
| 5 | 17/07/2026 | "siga" — Implementar multi-tenant: schema Empresa + Colaborador como usuário + auth email/senha + seed admin | `adicionar` | ✅ Implementado. Schema: Empresa, Papel enum, empresaId nas tabelas. Auth: JWT com bcryptjs, login por email. Seed: admin@empresa.com / admin123. Build passou (26 rotas). |
