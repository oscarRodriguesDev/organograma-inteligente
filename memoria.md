# Memória do Projeto - Organograma Inteligente

## 📌 Sobre
Sistema gerenciador de organogramas de empresas. Permite cadastrar colaboradores, definir hierarquias e visualizar a estrutura organizacional.

## 🧱 Stack
- **Framework:** Next.js 16.2.6
- **React:** 19.2.4
- **Styling:** Tailwind CSS v4
- **Linguagem:** TypeScript
- **Linter:** ESLint (config next)

## 🎯 Escopo Inicial
1. Cadastro de colaboradores (nome, função, líder imediato)
2. Visualização do organograma hierárquico
3. CRUD completo de colaboradores
4. Interface simplificada e intuitiva

## 🧠 Decisões de Arquitetura
- **Armazenamento:** arquivo JSON (`src/data/colaboradores.json`) via Server Actions — sem banco externo para simplificar o protótipo
- **Server Actions:** ações de formulário no servidor com `'use server'`, seguidas de `revalidatePath` e `redirect`
- **Rotas:** `/colaboradores` (listagem), `/colaboradores/novo` (cadastro)
- **Navegação:** header global no layout raiz com links para Organograma, Colaboradores, Avaliações, Iniciativas, Métricas
- **Avaliações:** líder avalia liderado com 6 critérios (nota 1-5) + comentário geral. Armazenamento em JSON separado (`src/data/avaliacoes.json`)
- **Iniciativas:** registro de ideias/ações de colaboradores com descrição, resultado numérico mensurável e unidade. Conta como pontuação para crescimento na empresa. Armazenamento em `src/data/iniciativas.json`
- **Métricas Mensais:** acompanhamento de dias trabalhados, faltas injustificadas e horas de atraso por colaborador/mês. Indicador de perfil (Bom/Ruim) baseado em regras (>2 faltas ou >4h atraso = Ruim). Armazenamento em `src/data/metricas.json`
- **Seed data:** `npm run seed` gera 100 colaboradores com hierarquia realista (CEO → Diretores → Gerentes → Analistas), 2 meses de métricas e avaliações, ~33 iniciativas
- **Organograma interativo:** React Flow (@xyflow/react v12) com layout hierárquico automático. Nós customizados mostrando nome e cargo. Suporte a pan, zoom, minimapa. Rota `/organograma`
- **Organograma em árvore expansível (v0.8):**
  - Estado inicial: apenas o CEO (raiz) visível
  - **Clique** no nó → expande/recolhe seus subordinados diretos
  - **Duplo clique** → edição inline de nome e função
  - **Hover** → botões de ação: `+` adicionar subordinado (modal), `×` excluir (com confirmação)
  - Exclusão transfere subordinados para o líder imediato do excluído
  - Nós são **arrastáveis** livremente no canvas
  - Auto `fitView` ao expandir/recolher
  - Server actions: `atualizarColaboradorAction`, `excluirColaboradorComSubordinados`, `adicionarColaboradorRapido`
- **Modo Simulação de Impacto (v0.9):**
  - Toggle "Simular" no topo do organograma ativa modo de simulação
  - Em modo simulação, botões nos nós mudam para ↓ (simular demissão) e ↑ (simular promoção para cargo vago)
  - **Demissão:** marca o nó como VAGO (vermelho), subordinados transferidos para o líder do removido
  - **Promoção:** seleciona candidato entre subordinados do cargo vago, ordenados por score (avaliações + perfil + subordinados)
  - **Efeito cascata:** promoção gera novo cargo vago que pode ser preenchido
  - **Impactos automáticos:** sistema detecta impactos positivos/negativos baseado em regras (avaliações, perfil,etc.)
  - **Indicador de alerta:** botão flutuante colorido (vermelho se há impactos negativos) mostrando contagem
  - **Modal de impactos:** lista detalhada com todos os impactos, categorizados por tipo
  - **Impactos manuais:** campo para adicionar observações de impacto manualmente
  - **Regras de impacto:** página `/regras-impacto` para CRUD de regras que determinam a detecção automática
  - **Aplicar simulação:** confirma as alterações no JSON; **Descartar:** reverte tudo
  - Lógica em `src/lib/simulacao.ts`, dados em `src/data/regras-impacto.json`

## 📂 Estrutura de Diretórios
```
src/
  app/          # App Router do Next.js
```

## ⚠️ Observações
- Next.js 16 tem breaking changes — consultar `node_modules/next/dist/docs/` antes de implementar.
