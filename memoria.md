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
- **Navegação:** header global no layout raiz com links para Colaboradores e Avaliações
- **Avaliações:** líder avalia liderado com 6 critérios (nota 1-5) + comentário geral. Armazenamento em JSON separado (`src/data/avaliacoes.json`)
- **Iniciativas:** registro de ideias/ações de colaboradores com descrição, resultado numérico mensurável e unidade. Conta como pontuação para crescimento na empresa. Armazenamento em `src/data/iniciativas.json`
- **Métricas Mensais:** acompanhamento de dias trabalhados, faltas injustificadas e horas de atraso por colaborador/mês. Indicador de perfil (Bom/Ruim) baseado em regras (>2 faltas ou >4h atraso = Ruim). Armazenamento em `src/data/metricas.json`

## 📂 Estrutura de Diretórios
```
src/
  app/          # App Router do Next.js
```

## ⚠️ Observações
- Next.js 16 tem breaking changes — consultar `node_modules/next/dist/docs/` antes de implementar.
