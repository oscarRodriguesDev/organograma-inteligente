# Plano de Testes Funcionais — OxyGen AI

> **Versão:** 1.0  
> **Data:** 19/07/2026  
> **Sistema:** Plataforma SaaS de gestão de organograma e desempenho  
> **Tipo de documento:** Plano de Testes Funcionais para Execução Manual

---

## Índice

1. [Módulo 1 — Autenticação e Sessão](#módulo-1--autenticação-e-sessão)
2. [Módulo 2 — Home / Landing Page](#módulo-2--home--landing-page)
3. [Módulo 3 — Perfil do Usuário](#módulo-3--perfil-do-usuário)
4. [Módulo 4 — Organograma](#módulo-4--organograma)
5. [Módulo 5 — Colaboradores (CRUD)](#módulo-5--colaboradores-crud)
6. [Módulo 6 — Avaliações de Desempenho](#módulo-6--avaliações-de-desempenho)
7. [Módulo 7 — Métricas Mensais](#módulo-7--métricas-mensais)
8. [Módulo 8 — Iniciativas](#módulo-8--iniciativas)
9. [Módulo 9 — Conversas / Reuniões](#módulo-9--conversas--reuniões)
10. [Módulo 10 — Fit Cultural](#módulo-10--fit-cultural)
11. [Módulo 11 — Teste DISC](#módulo-11--teste-disc)
12. [Módulo 12 — Pesquisa de Sentimento](#módulo-12--pesquisa-de-sentimento)
13. [Módulo 13 — Regras de Impacto](#módulo-13--regras-de-impacto)
14. [Módulo 14 — Admin: Dashboard](#módulo-14--admin-dashboard)
15. [Módulo 15 — Admin: Empresas](#módulo-15--admin-empresas)
16. [Módulo 16 — Admin: Gastos do Sistema](#módulo-16--admin-gastos-do-sistema)
17. [Módulo 17 — Admin: Investimentos](#módulo-17--admin-investimentos)
18. [Módulo 18 — Admin: Financeiro](#módulo-18--admin-financeiro)
19. [Módulo 19 — Admin: Usuários do Sistema](#módulo-19--admin-usuários-do-sistema)
20. [Módulo 20 — Admin: Perfil](#módulo-20--admin-perfil)
21. [Módulo 21 — Público: Onboarding](#módulo-21--público-onboarding)
22. [Módulo 22 — Público: Checkout](#módulo-22--público-checkout)
23. [Módulo 23 — APIs de IA](#módulo-23--apis-de-ia)
24. [Módulo 24 — API de Upload de Foto](#módulo-24--api-de-upload-de-foto)
25. [Módulo 25 — Permissões e RBAC (Testes Transversais)](#módulo-25--permissões-e-rbac-testes-transversais)
26. [Módulo 26 — Segurança (Testes Transversais)](#módulo-26--segurança-testes-transversais)
27. [Módulo 27 — Interface e Experiência do Usuário (Testes Transversais)](#módulo-27--interface-e-experiência-do-usuário-testes-transversais)

---

# Módulo 1 — Autenticação e Sessão

## Funcionalidade 1.1 — Login

**Objetivo:** Validar o fluxo completo de autenticação via email e senha.

**Pré-requisitos:**

- Um colaborador ativo cadastrado no banco com email e senha
- A empresa do colaborador deve estar ativa
- Sistema operacional com navegador moderno

**Perfil de usuário:** Qualquer papel (OPERACIONAL, CEO, ADMIN, etc.)

---

### CT001 — Login com credenciais válidas (usuário comum)

**Descrição:** Realizar login com email e senha corretos de um colaborador não-admin.

**Passos:**

1. Acessar `/login`
2. Preencher campo "Email" com email válido de um colaborador ativo
3. Preencher campo "Senha" com a senha correta
4. Clicar no botão "Entrar"

**Resultado esperado:**

- Redirecionado para `/organograma`
- Cookie `session` criado (httpOnly)
- Cookie `tema` criado (não-httpOnly)
- Navbar exibe nome do usuário e link para perfil

**Criticidade:** Crítica
**resultado do teste:** passed

---

### CT002 — Login com credenciais válidas (admin)

**Descrição:** Realizar login com email e senha corretos de um ADMIN_PLATAFORMA.

**Passos:**

1. Acessar `/login`
2. Preencher "Email" com email de um ADMIN_PLATAFORMA ativo
3. Preencher "Senha" com a senha correta
4. Clicar em "Entrar"

**Resultado esperado:** Redirecionado para `/admin` (dashboard admin)

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

### CT003 — Login com senha incorreta

**Descrição:** Tentar login com email existente e senha errada.

**Passos:**

1. Acessar `/login`
2. Preencher "Email" com email de colaborador existente
3. Preencher "Senha" com valor incorreto
4. Clicar em "Entrar"

**Resultado esperado:**

- Permanecer na página `/login`
- Exibir query param `?erro=Email+ou+senha+inv%C3%A1lidos` (ou mensagem equivalente)
- Banner vermelho de erro visível

**Criticidade:** Alta

## resultado

## **resultado do teste:** passed

### CT004 — Login com usuário inexistente

**Descrição:** Tentar login com email que não existe no banco.

**Passos:**

1. Acessar `/login`
2. Preencher "Email" com `email_inexistente@teste.com`
3. Preencher "Senha" com qualquer valor
4. Clicar em "Entrar"

**Resultado esperado:** Mensagem de erro "Email ou senha inválidos" (mesmo comportamento do CT003 — sem vazar informação sobre existência do usuário)

## resultado

**resultado do teste:** passed

**Criticidade:** Alta

---

### CT005 — Login com campos vazios

**Descrição:** Tentar login sem preencher os campos obrigatórios.

**Passos:**

1. Acessar `/login`
2. Deixar "Email" vazio
3. Deixar "Senha" vazio
4. Clicar em "Entrar"

**Resultado esperado:** Validação HTML5 bloqueia o envio — exibe tooltip "Preencha este campo" no navegador. Nenhuma requisição é enviada.

**Criticidade:** Média

## resultado

## **resultado do teste:** passed

### CT006 — Login com usuário inativo (status !== 'ativo')

**Descrição:** Tentar login com colaborador cujo status é diferente de 'ativo'.

**Passos:**

1. No banco, alterar status de um colaborador para 'vago'
2. Acessar `/login`
3. Inserir email e senha corretos desse colaborador
4. Clicar em "Entrar"

**Resultado esperado:** Mensagem de erro "Email ou senha inválidos" (sem revelar o motivo específico)

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT007 — Login com empresa inativa

**Descrição:** Tentar login de um colaborador cuja empresa está com `ativa = false`.

**Pré-requisitos:** Empresa marcada como inativa no banco.

**Passos:**

1. Acessar `/login`
2. Inserir email e senha corretos de colaborador de empresa inativa
3. Clicar em "Entrar"

**Resultado esperado:** Mensagem de erro "Email ou senha inválidos"

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT008 — Login admin com empresa inativa

**Descrição:** ADMIN_PLATAFORMA/SUPORTE devem conseguir logar independente do status da empresa (eles não têm `empresaId` vinculado).

**Passos:**

1. No banco, ter ADMIN_PLATAFORMA com status 'ativo'
2. Acessar `/login`
3. Inserir email e senha corretos
4. Clicar em "Entrar"

**Resultado esperado:** Login bem-sucedido. Redirecionado para `/admin`.

**Nota:** Admin não passa pela verificação de `empresa.ativa`.

**Criticidade:** Alta

## resultado

**resultado do teste:** Não possuem empresa vinculada teste impossibilitando o teste

---

## Funcionalidade 1.2 — Logout

### CT009 — Logout bem-sucedido

**Descrição:** Realizar logout e verificar destruição da sessão.

**Passos:**

1. Estar logado no sistema
2. Clicar no botão "Sair" (presente na navbar)
3. Aguardar redirecionamento

**Resultado esperado:**

- Cookie `session` removido
- Redirecionado para `/login`
- Tentar acessar `/organograma` após logout: redirecionado para `/login`

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

## Funcionalidade 1.3 — Sessão e Expiração

### CT010 — Expiração de sessão (24h)

**Descrição:** Verificar que o token JWT expira após 24 horas.

**Passos:**

1. Realizar login
2. Inspecionar cookie `session` no navegador (via DevTools > Application > Cookies)
3. Verificar campo `exp` do JWT (decodificar Base64)

**Resultado esperado:** O token contém `exp` com timestamp equivalente a `iat + 86400` segundos (24h). Após esse período, o cookie é rejeitado pelo servidor.

**Criticidade:** Alta

## resultado

**resultado do teste:** exp deu 384 verificar isso

---

### CT011 — Acessar página protegida sem sessão

**Descrição:** Tentar acessar páginas internas sem estar logado.

**Passos:**

1. Limpar cookies do navegador
2. Acessar diretamente `/organograma`

**Resultado esperado:** Redirecionado para `/login` (possivelmente com `?redirect=`)

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

### CT012 — Acessar página admin sem sessão

**Descrição:** Tentar acessar `/admin` sem estar logado.

**Passos:**

1. Limpar cookies
2. Acessar `/admin`

**Resultado esperado:** Redirecionado para `/login`

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

## Funcionalidade 1.4 — Recuperação de Senha

### CT013 — Recuperação de senha (inexistente)

**Descrição:** Verificar se existe fluxo de recuperação de senha.

**Passos:**

1. Acessar `/login`
2. Verificar se há link "Esqueceu a senha?" ou similar

**Resultado esperado:** ⚠️ **O sistema NÃO possui fluxo de recuperação de senha.** Isso é uma limitação conhecida. Se aparecer algum link, deve ser reportado como bug (inexistente no código).

**Criticidade:** Média (funcionalidade ausente — será reportada como gap)

## resultado

**resultado do teste:** fluxo ainda não implementado

---

# Módulo 2 — Home / Landing Page

## Funcionalidade 2.1 — Exibição de Planos

### CT014 — Visualizar landing page (não logado)

**Descrição:** Usuário não autenticado acessa a página inicial e vê os planos.

**Passos:**

1. Não estar logado
2. Acessar `/`
3. Scrollar a página

**Resultado esperado:**

- Hero section visível
- Lista de planos cadastrados (se houver) exibida em grid de cards
- Cada card mostra: nome, descrição, preço mensal/anual, recursos, botão "Contratar" linkando para `/checkout/[slug]`

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT015 — Landing page redireciona quando logado

**Descrição:** Usuário autenticado acessa a raiz e é redirecionado.

**Passos:**

1. Estar logado como colaborador comum
2. Acessar `/`

**Resultado esperado:** Redirecionado para `/organograma`

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT016 — Landing page redireciona admin

**Descrição:** Admin logado acessa a raiz.

**Passos:**

1. Estar logado como ADMIN_PLATAFORMA
2. Acessar `/`

**Resultado esperado:** Redirecionado para `/admin`

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT017 — Landing page sem planos

**Descrição:** Verificar comportamento quando não há planos cadastrados.

**Pré-requisitos:** Tabela `Plano` vazia.

**Passos:**

1. Não estar logado
2. Acessar `/`

**Resultado esperado:**

- Página carrega sem erros
- Seção de planos vazia ou com indicador de que não há planos disponíveis
- CTA permanece visível

**Criticidade:** Baixa

## resultado

**resultado do teste:** não testado

---

# Módulo 3 — Perfil do Usuário

## Funcionalidade 3.1 — Visualizar Perfil

### CT018 — Acessar perfil logado

**Descrição:** Usuário autenticado acessa `/perfil` e visualiza seus dados.

**Passos:**

1. Estar logado
2. Acessar `/perfil`
3. Observar a página

**Resultado esperado:**

- Avatar (foto ou inicial do nome)
- Nome, função, papel (badge), email, CPF, líder (se houver)
- Seção "Minhas Ações" com links conforme permissões
- Seção "Foto de Perfil"
- Seção "Informações do Perfil" (nome, username, tema)
- Seção "Alterar Senha" (se houver permissão)

**Criticidade:** Alta

## resultado

**resultado do teste:** passed porem algumas observações: precisa mostrar a preview da foto atual na pagina de perfil, la esta vazio, dando a impressão de que nunca foi configurado

sobre a senha, qualquer usuairo pode alterar sua senha

---

### CT019 — Acessar perfil sem autenticação

**Descrição:** Tentar acessar perfil sem estar logado.

**Passos:**

1. Limpar cookies
2. Acessar `/perfil`

**Resultado esperado:** Redirecionado para `/login`

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

## Funcionalidade 3.2 — Upload de Foto de Perfil

### CT020 — Upload de foto válida

**Descrição:** Enviar uma imagem válida para foto de perfil.

**Pré-requisitos:** Bucket Supabase `profile-photo` existente e acessível.

**Passos:**

1. Acessar `/perfil`
2. Na seção "Foto de Perfil", clicar em "Escolher Foto"
3. Selecionar um arquivo PNG/JPEG/WebP válido (máx 5MB)
4. Aguardar processamento

**Resultado esperado:**

- Preview da imagem exibido durante o upload
- Loading spinner sobre o avatar
- Mensagem "Foto atualizada com sucesso!"
- Avatar atualizado com a nova foto
- Recarregar a página confirma a persistência

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT021 — Upload de arquivo não-imagem

**Descrição:** Tentar enviar um arquivo que não é imagem.

**Passos:**

1. Clicar em "Escolher Foto"
2. Selecionar um arquivo PDF ou .txt

**Resultado esperado:**

- Validação do lado do cliente: `O arquivo precisa ser uma imagem`
- Nenhuma requisição enviada ao servidor

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT022 — Upload de imagem muito grande

**Descrição:** Enviar imagem que excede limites.

**Passos:**

1. Selecionar imagem > 10MB

**Resultado esperado:**

- O servidor processa com `sharp` e redimensiona para 400x400
- Não deve haver erro de tamanho máximo (validação não existe no cliente)
- Se o Next.js tiver `bodyParser` limit, pode retornar erro 413

**Nota:** O código não valida tamanho máximo do arquivo. Isso é um risco de produção.

**Criticidade:** Média

## resultado

## **resultado do teste:** passed

### CT023 — Upload sem selecionar arquivo

**Descrição:** Fechar seletor sem escolher arquivo.

**Passos:**

1. Clicar em "Escolher Foto"
2. Pressionar Cancel/Esc no diálogo de arquivo

**Resultado esperado:** Nenhuma ação. Página permanece inalterada.

**Criticidade:** Baixa

## resultado

**resultado do teste:** passed

---

## Funcionalidade 3.3 — Atualizar Dados do Perfil

### CT024 — Atualizar nome e username

**Descrição:** Alterar nome e username do perfil.

**Passos:**

1. Acessar `/perfil`
2. Em "Informações do Perfil", alterar o campo "Nome"
3. Alterar o campo "Username"
4. Clicar em "Salvar Alterações"

**Resultado esperado:**

- Mensagem "Perfil atualizado com sucesso!"
- Dados refletidos na navbar
- Recarregar confirma persistência

**Criticidade:** Média

## resultado

## **resultado do teste:** passed, porem melhor seria se tambem aparecesse uma notificação (toast) informando o sucesso ou não

### CT025 — Alterar tema

**Descrição:** Alterar tema entre Claro, Escuro e Sistema.

**Passos:**

1. Em "Informações do Perfil", selecionar tema "Escuro"
2. Salvar
3. Observar a interface

**Resultado esperado:**

- Tema escuro aplicado imediatamente
- Cookie `tema` atualizado com valor `dark`
- Ao fazer logout e login em outro dispositivo, o tema persiste

**Criticidade:** Baixa

## resultado

**resultado do teste:** passed

---

## Funcionalidade 3.4 — Alterar Senha

### CT026 — Alterar senha com sucesso

**Descrição:** Alterar a senha com dados corretos.

**Passos:**

1. Acessar `/perfil`
2. Em "Alterar Senha", preencher "Senha Atual" corretamente
3. Preencher "Nova Senha" (6+ caracteres)
4. Preencher "Confirmar Nova Senha" igual
5. Clicar em "Alterar Senha"

**Resultado esperado:**

- Mensagem "Senha alterada com sucesso"
- Fazer logout e login com a nova senha funciona

**Criticidade:** Alta

## resultado

**resultado do teste:** teste sera realizado mais a frente

---

### CT027 — Alterar senha com senha atual incorreta

**Passos:**

1. Preencher "Senha Atual" incorreta
2. Preencher nova senha e confirmação
3. Clicar em "Alterar Senha"

**Resultado esperado:** Mensagem de erro "Senha atual incorreta"

**Criticidade:** Alta

## resultado

**resultado do teste:** teste será realizado mais a frente

---

### CT028 — Alterar senha com nova senha curta (< 6 caracteres)

**Passos:**

1. Preencher "Nova Senha" com 3 caracteres

**Resultado esperado:** Validação HTML5 `minLength=6` bloqueia o envio

**Criticidade:** Média

## resultado

**resultado do teste:** teste sera realizado mais a frente

---

### CT029 — Alterar senha com confirmação diferente

**Passos:**

1. Preencher "Nova Senha" e "Confirmar Nova Senha" com valores diferentes

**Resultado esperado:** A validação de igualdade é feita no servidor — deve retornar erro "As senhas não conferem" (ou similar)

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT030 — Verificar se sessão antiga funciona após troca de senha

**Descrição:** Trocar senha e verificar que tokens JWT antigos não são invalidados.

**Passos:**

1. Fazer login (token JWT gerado)
2. Alterar senha
3. Usar o mesmo cookie de sessão (sem recarregar) para acessar páginas

**Resultado esperado:** ⚠️ O sistema não invalida tokens após troca de senha. O token antigo continua válido até expirar em 24h. Isso é um **risco de segurança** conhecido.

**Criticidade:** Alta (gap de segurança)

## resultado

**resultado do teste:** teste será realizado mais a frente

---

# Módulo 4 — Organograma

## Funcionalidade 4.1 — Visualização do Organograma

### CT031 — Carregar organograma com dados

**Descrição:** Visualizar a árvore hierárquica completa.

**Passos:**

1. Estar logado como CEO ou colaborador da empresa
2. Acessar `/organograma`
3. Aguardar carregamento do canvas ReactFlow

**Resultado esperado:**

- Tela dividida: topo com barra de ferramentas, centro com o grafo
- CEO/Diretores (roots) visíveis
- Nós conectados por arestas (smoothstep)
- Contador "X de Y" no topo direito
- MiniMap visível no canto inferior direito
- Botões de zoom (Controls) visíveis

**Criticidade:** Crítica

---

## resultado

**resultado do teste:** passed

### CT032 — Organograma sem colaboradores

**Descrição:** Visualizar organograma de empresa sem colaboradores.

**Pré-requisitos:** Empresa sem nenhum colaborador cadastrado.

**Passos:**

1. Acessar `/organograma`

**Resultado esperado:** Canvas vazio sem erros. Mensagem ou estado vazio indicando que não há colaboradores.

**Criticidade:** Média

## resultado

**resultado do teste:** passed observação, sempre vai ter pelo menos um colaborador que vai ser o ceo no minimo

---

### CT033 — Expandir e recolher nós

**Descrição:** Clicar em um nó com filhos para expandir/recolher.

**Passos:**

1. Identificar um nó que tenha subordinados (indicador ▶)
2. Clicar no nó (não no botão ▶)
3. Observar os filhos aparecerem abaixo
4. Clicar novamente

**Resultado esperado:**

- Ao clicar: nós filhos aparecem com animação suave
- Indicador ▶ gira 90° quando expandido
- Ao clicar novamente: filhos recolhidos
- Contador "X de Y" atualiza dinamicamente

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT034 — Expandir/Recolher tudo

**Descrição:** Usar o botão de expandir/recolher tudo.

**Passos:**

1. Clicar em "⬇ Expandir Tudo"
2. Observar todos os nós expandirem
3. Clicar em "⬆ Recolher Tudo"

**Resultado esperado:**

- Botão alterna entre "⬇ Expandir Tudo" e "⬆ Recolher Tudo"
- Todos os nós com filhos expandem ou recolhem conforme ação
- Botão reflete estado atual correto

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT035 — Alternar modo Formal / Lúdico

**Descrição:** Toggle entre visual formal (cards) e lúdico (avatares).

**Passos:**

1. Clicar em "🎨 Lúdico"
2. Observar alteração visual
3. Clicar em "🎨 Formal"

**Resultado esperado:**

- Modo lúdico: nós circulares com ícones do cargo (FaCrown, FaBullseye, etc.) ou foto de perfil
- Modo formal: cards retangulares com nome, cargo e indicador de expansão
- Todas as interações (clique, hover, expandir) funcionam em ambos os modos

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT036 — Arrastar nós

**Descrição:** Arrastar um nó para reposicioná-lo no canvas.

**Passos:**

1. Clicar e segurar em um nó
2. Arrastar para outra posição
3. Soltar

**Resultado esperado:** Nó move-se livremente. Posição não é persistida (apenas visual).

**Criticidade:** Baixa

## resultado

**resultado do teste:** passed

---

### CT037 — Zoom e pan no canvas

**Descrição:** Usar scroll para zoom e clique+arrasto no fundo para pan.

**Passos:**

1. Scroll para cima/baixo no canvas
2. Clicar e arrastar no fundo do canvas

**Resultado esperado:**

- Scroll: zoom in/out (respeitando minZoom=0.2, maxZoom=2.5)
- Arrasto no fundo: pan do canvas

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

## Funcionalidade 4.2 — Edição Inline de Nó

### CT038 — Editar nome e cargo de colaborador (duplo clique)

**Descrição:** Duplo clique em nó para editar nome e cargo.

**Passos:**

1. Dar duplo clique em um nó
2. Alterar o nome no input
3. Alterar o cargo no SelectCargo
4. Pressionar Enter ou clicar fora

**Resultado esperado:**

- Input e SelectCargo aparecem no lugar do texto
- Ao salvar: nó atualizado com novo nome/cargo
- Dados persistidos no banco
- Mensagem de sucesso ou atualização silenciosa

**Criticidade:** Alta

## resultado

## **resultado do teste:** reproved - não esta funcionando

### CT039 — Editar com Escape

**Descrição:** Cancelar edição inline com tecla Escape.

**Passos:**

1. Duplo clique em nó
2. Modificar nome
3. Pressionar Escape

**Resultado esperado:** Edição cancelada. Nome/Cargo retornam aos valores originais.

**Criticidade:** Média

## resultado

## **resultado do teste:** reproved não esta funcionadno

### CT040 — Editar com nome vazio

**Descrição:** Tentar salvar edição com nome vazio.

**Passos:**

1. Duplo clique
2. Apagar o nome
3. Pressionar Enter

**Resultado esperado:** A validação no servidor (`if (!nome.trim() ...)`) deve impedir — provavelmente a ação ignora ou retorna erro.

**Criticidade:** Média

## resultado

**resultado do teste:** reproved não esta funcionando

---

## Funcionalidade 4.3 — Adicionar Subordinado

### CT041 — Adicionar subordinado válido

**Descrição:** Clicar no "+" do hover para adicionar subordinado.

**Passos:**

1. Passar o mouse sobre um nó
2. Clicar no botão "+" que aparece
3. No modal, preencher "Nome" e "Função" (via SelectCargo)
4. Opcional: preencher CPF
5. Opcional: marcar "Transferir subordinados"
6. Clicar em "Adicionar"

**Resultado esperado:**

- Modal fecha
- Novo nó aparece como filho do líder selecionado
- Dados persistidos no banco
- Contador atualizado

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT042 — Adicionar subordinado sem nome

**Descrição:** Tentar adicionar subordinado com nome vazio.

**Passos:**

1. Clicar em "+" no hover
2. Deixar "Nome" vazio
3. Clicar em "Adicionar"

**Resultado esperado:** Modal não fecha. Validação impede envio (ou servidor retorna erro).

**Criticidade:** Média

## resultado

**resultado do teste:** passed - talvez mostrar feedback para o usuairo sobre o motivo de nao salvar

---

### CT043 — Adicionar subordinado com CPF inválido

**Descrição:** Inserir CPF com formato inválido (mais de 11 dígitos, letras, etc.).

**Passos:**

1. Abrir modal de adicionar
2. Preencher CPF com `123.456.789-00` (caracteres especiais) ou `ABCDEFGHIJK` (letras)
3. Clicar em "Adicionar"

**Resultado esperado:**

- Se o campo aceita formatação, deve permitir
- Se não houver validação, pode criar com CPF inválido
- ⚠️ O servidor provavelmente não valida CPF (apenas armazena como string)

**Criticidade:** Média

## resultado

**resultado do teste:** reproved adcionou cpf com menos de 11 digitos

---

## Funcionalidade 4.4 — Excluir Colaborador

### CT044 — Excluir colaborador sem subordinados

**Descrição:** Excluir colaborador que não tem subordinados.

**Passos:**

1. Passar mouse sobre um nó sem filhos
2. Clicar no "×" vermelho
3. Confirmar no `window.confirm`

**Resultado esperado:**

- Nó removido do canvas
- Dados removidos do banco (incluindo avaliações, métricas, iniciativas relacionadas)
- Contador atualizado

**Criticidade:** Alta

## resultado

**resultado do teste:** passed porem como estou usando dados mocados isso precisa ser testado mais fundo pra ver se delete
em cascata funciona

---

### CT045 — Excluir colaborador com subordinados

**Descrição:** Excluir um líder que possui subordinados.

**Passos:**

1. Passar mouse sobre nó com filhos
2. Clicar em "×"
3. Confirmar

**Resultado esperado:**

- Líder removido
- Subordinados transferidos para o líder imediato do excluído
- `window.confirm` exibe mensagem "Subordinados serão transferidos para o líder imediato."

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

### CT046 — Excluir cancelada

**Descrição:** Clicar em "×" e cancelar no confirm.

**Passos:**

1. Clicar em "×" no hover
2. Clicar "Cancelar" no `window.confirm`

**Resultado esperado:** Nó permanece. Nenhuma ação executada.

**Criticidade:** Média

---

## Funcionalidade 4.5 — Relocar (Mudar Líder)

### CT047 — Relocar colaborador

**Descrição:** Mover um colaborador para outro líder.

**Passos:**

1. Passar mouse sobre nó
2. Clicar em "⟷"
3. No modal, selecionar novo líder da árvore
4. Confirmar

**Resultado esperado:**

- Nó reposicionado visualmente
- Conexão (edge) atualizada para o novo líder
- Dados persistidos no banco

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT048 — Relocar para si mesmo (deve ser impedido)

**Descrição:** Tentar relocar um colaborador para ele mesmo como líder.

**Passos:**

1. Abrir modal de relocar
2. Na árvore de seleção, tentar selecionar o próprio colaborador

**Resultado esperado:** O próprio colaborador não deve aparecer como opção na árvore, ou a ação deve ser rejeitada pelo servidor.

**Criticidade:** Média

## resultado

## **resultado do teste:** passed

## Funcionalidade 4.6 — Modo Simulação

### CT049 — Ativar modo simulação

**Descrição:** Clicar em "🔮 Simular" para entrar no modo de simulação.

**Passos:**

1. Estar no organograma
2. Clicar em "🔮 Simular"

**Resultado esperado:**

- Botão muda para "🔮 Sair da Simulação"
- Barra de ferramentas da simulação aparece no topo
- Nós ficam com borda âmbar
- Dados de simulação carregados (avaliações, métricas, regras)
- Indicador de impacto aparece

**Criticidade:** Alta

## resultado

**resultado do teste:** passed parcialmente - não vi tambem dados de simulação carregados (avaliações, metiricas e regras) a não ser que seja invisivel para o usuario

---

### CT050 — Simular demissão

**Descrição:** Demitir um colaborador na simulação.

**Passos:**

1. Ativar modo simulação
2. Passar mouse sobre nó
3. Clicar em "↓"

**Resultado esperado:**

- Nó fica com badge "VAGO" (borda vermelha)
- Impactos recalculados e exibidos no indicador
- Sugestões de cascata de promoção aparecem (se aplicável)
- Contagem de ações simuladas incrementa
- Nenhum dado persistido no banco ainda

**Criticidade:** Alta

## resultado

**resultado do teste:** passed pode melhorar (como eu tenho uma demissão o campo fica vermelho e mostra varios usuario para promover
a ideia é que tenha uma seta que ao clicar ja suba para o cargo que esta sendo demitido acima, ai desco o nivel e subo o proximo que apareceu e assim por diante a ideia é promoção por um click, isso pode ser melhor pensando mais a frente)

---

### CT051 — Simular promoção

**Descrição:** Promover um colaborador na simulação.

**Passos:**

1. Ativar modo simulação
2. Clicar em "↑" em nó que não é vago
3. No modal, selecionar novo cargo e novo líder
4. Confirmar

**Resultado esperado:**

- Nó com badge "PROMOVIDO" (borda esmeralda)
- Impactos recalculados

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT052 — Preencher vaga na simulação

**Descrição:** Clicar em "↑" em nó vago para preencher com candidato.

**Passos:**

1. Ativar simulação
2. Clicar em "↑" em nó VAGO
3. No modal de candidatos, selecionar um candidato da lista
4. Confirmar

**Resultado esperado:**

- Vaga preenchida com o candidato
- Nó candidato é promovido
- VAGA criada na posição antiga do candidato (se houver cascata)
- Impactos recalculados

**Criticidade:** Alta

## resultado

**resultado do teste:** deu o erro abaixo na transação... ao clicar em aplicar simulação
POST /organograma 200 in 2.0s (next.js: 13ms, proxy.ts: 8ms, application-code: 2.0s)
└─ ƒ salvarImpactosAction([{"colaboradorId":"op_compra2","colaboradorNome":"Maria Clara","descricao":"Maria Clara promovido sem histórico de destaque (avaliação 0.0)","...":"4 items not stringified"},{"colaboradorId":"op_compra2","colaboradorNome":"Maria Clara","descricao":"Maria Clara subiu 3 nível(is) de Auxiliar de Compras para Supervisor de Transporte — risco de incapacidade (Princípio de Peter)","...":"4 items not stringified"}]) in 1983ms src/lib/simulacao-actions.ts
isso parecer ser apenas o processamento demorado, nesse caso precisa ter um loading para informar o usuaro que não é falha pmas que pode demonrar um pouco, e otimizar isso no futuro

---

### CT053 — Aplicar simulação

**Descrição:** Aplicar todas as ações da simulação no banco real.

**Passos:**

1. Realizar algumas ações de simulação
2. Clicar em "✓ Aplicar Simulação"

**Resultado esperado:**

- Mudanças persistidas no banco
- Simulação encerrada
- Organograma recarregado com dados reais

**Criticidade:** Crítica

---

## resultado

**resultado do teste:** deu o erro abaixo na transação... ao clicar em aplicar simulação
POST /organograma 200 in 2.0s (next.js: 13ms, proxy.ts: 8ms, application-code: 2.0s)
└─ ƒ salvarImpactosAction([{"colaboradorId":"op_compra2","colaboradorNome":"Maria Clara","descricao":"Maria Clara promovido sem histórico de destaque (avaliação 0.0)","...":"4 items not stringified"},{"colaboradorId":"op_compra2","colaboradorNome":"Maria Clara","descricao":"Maria Clara subiu 3 nível(is) de Auxiliar de Compras para Supervisor de Transporte — risco de incapacidade (Princípio de Peter)","...":"4 items not stringified"}]) in 1983ms src/lib/simulacao-actions.ts
isso parecer ser apenas o processamento demorado, nesse caso precisa ter um loading para informar o usuaro que não é falha pmas que pode demonrar um pouco, e otimizar isso no futuro

### CT054 — Descartar simulação

**Descrição:** Descartar ações da simulação sem aplicar.

**Passos:**

1. Realizar ações de simulação
2. Clicar em "✗ Descartar"

**Resultado esperado:**

- Ações descartadas
- Organograma retorna ao estado original
- Nenhuma alteração no banco

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

## Funcionalidade 4.7 — Modal de Impactos

### CT055 — Visualizar impactos da simulação

**Descrição:** Clicar no indicador de impacto para ver detalhes.

**Passos:**

1. Realizar ação de simulação que gere impactos
2. Clicar no botão de impacto (ex: "3 impactos")

**Resultado esperado:**

- Modal com lista de impactos (positivos e negativos)
- Impactos coloridos (verde/positivo, vermelho/negativo)
- Possibilidade de adicionar impacto manual
- Rolagem se muitos impactos

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT056 — Adicionar impacto manual na simulação

**Descrição:** Inserir descrição de impacto manualmente.

**Passos:**

1. Abrir modal de impactos
2. Digitar texto no input de impacto manual
3. Clicar em adicionar

**Resultado esperado:** Novo impacto aparece na lista com badge apropriado.

**Criticidade:** Baixa

## resultado

**resultado do teste:** passed

---

# Módulo 5 — Colaboradores (CRUD)

## Funcionalidade 5.1 — Listar Colaboradores

### CT057 — Listar todos os colaboradores

**Descrição:** Visualizar tabela completa de colaboradores.

**Passos:**

1. Acessar `/colaboradores`

**Resultado esperado:**

- Tabela com colunas: Nome, Função, Líder Imediato, Ações
- Dados carregados da empresa do usuário logado
- Administradores (ADMIN_PLATAFORMA/SUPORTE) não aparecem

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT058 — Listar sem colaboradores

**Descrição:** Empresa sem colaboradores.

**Passos:**

1. Acessar `/colaboradores` em empresa nova

**Resultado esperado:** Estado vazio com link para criar primeiro colaborador.

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

## Funcionalidade 5.2 — Criar Colaborador

### CT059 — Cadastro válido

**Descrição:** Criar colaborador com dados válidos.

**Passos:**

1. Acessar `/colaboradores/novo`
2. Preencher "Nome"
3. Opcional: preencher "CPF" (11 dígitos)
4. Selecionar "Função" via SelectCargo
5. Selecionar "Líder Imediato" (opcional para CEO)
6. Clicar em "Salvar"

**Resultado esperado:**

- Redirecionado para `/colaboradores`
- Novo colaborador na tabela
- Se CPF informado: email gerado automaticamente (`cpf@empresa_slug.com`) e senha padrão (6 primeiros dígitos do CPF)
- Se CPF não informado: sem email/senha (não consegue logar)

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

### CT060 — Cadastro sem nome

**Descrição:** Tentar criar sem nome.

**Passos:**

1. Deixar "Nome" vazio
2. Clicar em "Salvar"

**Resultado esperado:** Validação HTML5 bloqueia o envio.

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT061 — CPF inválido (letras)

**Descrição:** Inserir CPF com caracteres não numéricos.

**Passos:**

1. Preencher CPF com "abcdefghijk"

**Resultado esperado:** HTML5 `type="text"` + `maxLength={11}` permite letras. O sistema aceita CPF alfanumérico. ⚠️ Isso é uma fragilidade — o sistema não valida CPF.

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT062 — CPF duplicado

**Descrição:** Tentar criar colaborador com CPF já existente na empresa.

**Resultado esperado:** ⚠️ O schema Prisma não tem unique constraint para CPF. O sistema permite CPF duplicado. **Risco de produção.**

**Criticidade:** Baixa (gap conhecido)

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT063 — Limite de caracteres no nome

**Descrição:** Inserir nome com mais de 200 caracteres.

**Passos:**

1. Inserir nome com 300 caracteres
2. Tentar salvar

**Resultado esperado:** O banco (`String` sem tamanho definido no Prisma) provavelmente aceita, mas UI pode truncar. Sem validação de tamanho máximo.

**Criticidade:** Baixa

## resultado

**resultado do teste:** REPROVED - PRECISA RESOLVER RAPIDO

---

### CT064 — Caracteres especiais no nome

**Descrição:** Inserir nome com acentos, emojis ou caracteres Unicode.

**Passos:**

1. Nome: "João da Silva 🚀 über cool"
2. Salvar

**Resultado esperado:** Sistema aceita normalmente (PostgreSQL + Prisma suportam Unicode).

**Criticidade:** Baixa

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 5.3 — Excluir Colaborador

### CT065 — Excluir colaborador da tabela

**Descrição:** Clicar em "Excluir" na tabela de colaboradores.

**Passos:**

1. Acessar `/colaboradores`
2. Clicar em "Excluir" em uma linha
3. Confirmar

**Resultado esperado:** Colaborador removido. Tabela atualizada.

**Criticidade:** Alta

## resultado

**resultado do teste:** PASSED

---

### CT066 — Excluir colaborador com registros relacionados

**Descrição:** Excluir colaborador que possui avaliações, métricas e iniciativas.

**Passos:**

1. Identificar colaborador com dados associados
2. Excluir

**Resultado esperado:**

- `removerColaborador` no banco executa cascade: avaliações, métricas e iniciativas são deletadas
- ⚠️ Conversas, respostas de testes e scores NÃO são limpos explicitamente — podem ficar órfãos

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente (precisa permitir edição de colaborador, crud tem que ser completo, o delete de colaboradore tem que tambem considrear os impactos no organograma, se deletar um colaborador la no organograma deve ficar mostrando a vaga em aberto e todoas os impactos disso isso é importante, entçao deletar fucniona como demitir)

---

# Módulo 6 — Avaliações de Desempenho

## Funcionalidade 6.1 — Listar Avaliações

### CT067 — Listar avaliações

**Descrição:** Visualizar lista de avaliações de desempenho.

**Passos:**

1. Acessar `/avaliacoes`

**Resultado esperado:**

- Cards com: avaliador → avaliado, badge de sentimento, data, média das notas, critérios individuais
- Comentário geral opcional
- Botão "Nova Avaliação"

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT068 — Badge de sentimento em avaliação

**Descrição:** Verificar badge de análise de sentimento em cada card.

**Passos:**

1. Acessar `/avaliacoes`
2. Identificar badge `AnaliseSentimentoBadge` no card
3. Clicar no badge

**Resultado esperado:** Badge carrega sentimento (positivo/negativo/neutro) via API. Popover exibe score e insights.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 6.2 — Criar Avaliação

### CT069 — Criar avaliação válida

**Descrição:** Criar avaliação de desempenho com dados completos.

**Passos:**

1. Acessar `/avaliacoes/nova`
2. Selecionar "Avaliador"
3. Selecionar "Avaliado"
4. Para cada um dos 6 critérios, selecionar nota 1-5
5. Opcional: preencher "Comentário Geral"
6. Clicar em "Salvar"

**Resultado esperado:**

- Redirecionado para `/avaliacoes`
- Nova avaliação na lista

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT070 — Criar avaliação sem selecionar avaliado

**Descrição:** Tentar criar sem selecionar avaliado.

**Passos:**

1. Não selecionar "Avaliado"
2. Tentar salvar

**Resultado esperado:** HTML5 `required` no select bloqueia o envio.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT071 — Usar IA para gerar feedback

**Descrição:** Clicar em "Gerar Feedback com IA".

**Passos:**

1. Preencher avaliador, avaliado e notas dos critérios
2. Clicar em "Gerar Feedback com IA" (componente `GerarFeedbackButton`)
3. Aguardar

**Resultado esperado:**

- Textarea "Comentário Geral" preenchido com feedback gerado pela IA
- Se IA estiver desabilitada (feature flag), fallback determinístico preenche um feedback genérico

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT072 — Excluir avaliação

**Descrição:** Excluir avaliação da lista.

**Passos:**

1. Em `/avaliacoes`, clicar em "Excluir" em um card
2. Confirmar

**Resultado esperado:** Avaliação removida da lista.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

# Módulo 7 — Métricas Mensais

## Funcionalidade 7.1 — Listar Métricas

### CT073 — Listar métricas

**Descrição:** Visualizar tabela de métricas mensais.

**Passos:**

1. Acessar `/metricas`

**Resultado esperado:**

- Tabela: Colaborador, Período, Dias Trabalhados, Faltas, Atrasos, Perfil (Ruim/Bom), Ações
- Perfil "Ruim" em vermelho quando faltas > 2 ou atrasos > 4h

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT074 — Listar métricas vazia

**Descrição:** Sem métricas cadastradas.

**Passos:**

1. Acessar `/metricas` em empresa sem dados

**Resultado esperado:** Estado vazio com link "Nova Métrica".

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 7.2 — Criar Métrica

### CT075 — Criar métrica válida

**Descrição:** Cadastrar métrica mensal para um colaborador.

**Passos:**

1. Acessar `/metricas/nova`
2. Selecionar colaborador
3. Selecionar mês
4. Preencher ano (default: atual)
5. Preencher dias trabalhados (default: 22)
6. Preencher faltas (default: 0)
7. Preencher horas de atraso (default: 0)
8. Opcional: observação
9. Clicar em "Salvar"

**Resultado esperado:**

- Redirecionado para `/metricas`
- Nova métrica na tabela

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT076 — Criar métrica com valores negativos

**Descrição:** Inserir valores negativos em campos numéricos.

**Passos:**

1. Preencher "diasTrabalhados" com -5
2. Tentar salvar

**Resultado esperado:** HTML5 `min=0` bloqueia valores negativos.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT077 — Criar métrica com valores muito altos

**Descrição:** Inserir 9999 dias trabalhados.

**Passos:**

1. Preencher "diasTrabalhados" = 9999
2. Salvar

**Resultado esperado:** Sistema aceita (sem `max` definido). Dado inconsistente persistido. ⚠️ Falta validação de limite superior.

**Criticidade:** Baixa

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 7.3 — Excluir Métrica

### CT078 — Excluir métrica

**Descrição:** Remover métrica mensal.

**Passos:**

1. Em `/metricas`, clicar "Excluir"

**Resultado esperado:** Métrica removida.

**Criticidade:** Média

---

# Módulo 8 — Iniciativas

## Funcionalidade 8.1 — Listar Iniciativas

### CT079 — Listar iniciativas

**Descrição:** Visualizar cards de iniciativas.

**Passos:**

1. Acessar `/iniciativas`

**Resultado esperado:**

- Cards: título, colaborador, data, descrição, valor (badge azul), resultado qualitativo (verde)
- Botão "Nova Iniciativa"

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 8.2 — Criar Iniciativa

### CT080 — Criar iniciativa válida

**Descrição:** Cadastrar iniciativa com dados completos.

**Passos:**

1. Acessar `/iniciativas/nova`
2. Selecionar colaborador
3. Preencher título
4. Opcional: descrição
5. Opcional: valorResultado + unidadeMedida
6. Opcional: resultado (qualitativo)
7. Clicar em "Salvar"

**Resultado esperado:** Redirecionado para `/iniciativas`. Nova iniciativa na lista.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT081 — Sugerir iniciativa com IA

**Descrição:** Usar "Sugerir com IA" para gerar iniciativa a partir de rascunho.

**Passos:**

1. Selecionar colaborador
2. Escrever rascunho em "Descrição"
3. Clicar em "Sugerir com IA"

**Resultado esperado:** Campos título, descrição, resultado e unidade de medida preenchidos pela IA (ou fallback determinístico).

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT082 — Criar iniciativa sem título

**Descrição:** Tentar salvar sem título.

**Passos:**

1. Deixar título vazio

**Resultado esperado:** HTML5 `required` bloqueia.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

# Módulo 9 — Conversas / Reuniões

## Funcionalidade 9.1 — Listar Conversas

### CT083 — Listar conversas

**Descrição:** Visualizar cards de conversas/ reuniões.

**Passos:**

1. Acessar `/conversas`

**Resultado esperado:**

- Cards: tipo (badge colorido), título, data, colaborador, resumo (truncado), pontos positivos/melhoria (truncados)
- Cada card linka para `/conversas/[id]`

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 9.2 — Criar Conversa

### CT084 — Criar conversa válida

**Descrição:** Registrar nova conversa/reunião.

**Passos:**

1. Acessar `/conversas/nova`
2. Selecionar colaborador
3. Selecionar tipo (1:1, feedback, avaliação, etc.)
4. Preencher título
5. Selecionar data (default: hoje)
6. Preencher campos opcionais
7. Clicar em "Salvar"

**Resultado esperado:** Redirecionado para `/conversas`. Nova conversa na lista.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

## Funcionalidade 9.3 — Detalhe da Conversa

### CT085 — Visualizar detalhe da conversa

**Descrição:** Clicar em conversa e ver detalhes completos.

**Passos:**

1. Em `/conversas`, clicar em um card
2. Observar página de detalhe

**Resultado esperado:**

- Badge do tipo
- Título, colaborador, data
- Assunto (se houver)
- Resumo
- Grid 2-col: Pontos Positivos (verde) / Pontos de Melhoria (vermelho)
- Observações (se houver)
- Metadados: "Registrada em {data}"

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT086 — Conversa não encontrada

**Descrição:** Acessar ID de conversa inexistente.

**Passos:**

1. Acessar `/conversas/id_inexistente`

**Resultado esperado:** Página 404 (notFound() chamado). Mensagem "Conversa não encontrada".

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

# Módulo 10 — Fit Cultural

## Funcionalidade 10.1 — Responder Questionário

### CT087 — Responder fit cultural válido

**Descrição:** Submeter respostas do questionário de fit cultural.

**Passos:**

1. Acessar `/fit-cultural`
2. Selecionar colaborador (pode ser si mesmo ou subordinado)
3. Para cada pergunta (agrupada por dimensão), selecionar nota 1-5
4. Clicar em "Salvar Respostas"

**Resultado esperado:**

- Mensagem de sucesso
- Respostas persistidas
- Score de fit cultural calculado

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT088 — Responder sem selecionar colaborador

**Descrição:** Tentar submeter sem selecionar colaborador.

**Passos:**

1. Não selecionar "Colaborador"
2. Clicar em "Salvar"

**Resultado esperado:** HTML5 `required` bloqueia.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT089 — Visualizar perguntas cadastradas

**Descrição:** Ver tabela de perguntas de fit cultural.

**Passos:**

1. Acessar `/fit-cultural`
2. Ver seção "Perguntas Cadastradas"

**Resultado esperado:** Tabela com pergunta, dimensão (com cor), peso, ordem.

**Criticidade:** Baixa

---

# Módulo 11 — Teste DISC

## Funcionalidade 11.1 — Responder Teste DISC

### CT090 — Responder teste DISC válido

**Descrição:** Submeter respostas do teste DISC.

**Passos:**

1. Acessar `/teste-disc`
2. Selecionar colaborador
3. Para cada pergunta (agrupada por D/I/S/C com cores), selecionar 1-5
4. Clicar em "Salvar"

**Resultado esperado:**

- Respostas salvas
- Resultado DISC calculado (perfil, pontuações)
- Redirecionado ou mensagem de sucesso

**Criticidade:** Alta

---

## Funcionalidade 11.2 — Visualizar Resultados

### CT091 — Listar resultados DISC

**Descrição:** Visualizar dashboard de resultados DISC.

**Passos:**

1. Acessar `/teste-disc/resultados`

**Resultado esperado:**

- Cards: colaborador, data, perfil (ex: "DI"), nome extenso do perfil, barras de progresso D/I/S/C

**Criticidade:** Média

---

### CT092 — Resultados vazios

**Descrição:** Nenhum resultado DISC cadastrado.

**Passos:**

1. Acessar `/teste-disc/resultados` sem dados

**Resultado esperado:** Estado vazio com link "Novo Teste".

**Criticidade:** Baixa

---

# Módulo 12 — Pesquisa de Sentimento

## Funcionalidade 12.1 — Registrar Sentimento

### CT093 — Registrar sentimento válido

**Descrição:** Submeter pesquisa de sentimento.

**Passos:**

1. Acessar `/pesquisa-sentimento`
2. Selecionar colaborador
3. Selecionar sentimento (emoji radio: 😍 😊 😐 😟 😡)
4. Selecionar nota (1-5)
5. Opcional: engajamento, motivação, pertencimento
6. Opcional: comentário
7. Clicar em "Salvar"

**Resultado esperado:** Pesquisa registrada. Histórico atualizado.

**Criticidade:** Alta

## resultado

**resultado do teste:** testar isso mais pra frente

---

### CT094 — Histórico de sentimentos

**Descrição:** Visualizar pesquisas anteriores.

**Passos:**

1. Após registrar, observar seção "Histórico"

**Resultado esperado:** Cards com sentimento (badge com emoji), nota, engajamento/motivação/pertencimento, comentário em itálico, data.

**Criticidade:** Média

## resultado

**resultado do teste:** testar isso mais pra frente

---

# Módulo 13 — Regras de Impacto

## Funcionalidade 13.1 — CRUD de Regras

### CT095 — Listar regras de impacto

**Descrição:** Visualizar regras cadastradas.

**Passos:**

1. Acessar `/regras-impacto`

**Resultado esperado:**

- Cards: tipo (positivo/negativo/neutro), nome, condição, descrição, ações (Ativar/Desativar, Editar, Excluir)
- Regras inativas com opacidade

**Criticidade:** Média

## resultado

**resultado do teste:** existem regras mas não consegui nem visualizar e nem criar, pode ser porque as regras criadas são do sistmea e não criadas por mim, avaliar isso

---

### CT096 — Criar regra de impacto válida

**Descrição:** Criar nova regra.

**Passos:**

1. Clicar em "+ Nova Regra"
2. Preencher "Nome"
3. Preencher "Descrição"
4. Selecionar "Tipo" (positivo/negativo/neutro)
5. Selecionar "Condição"
6. Clicar em "Salvar"

**Resultado esperado:** Modal fecha. Nova regra na lista.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui criar

---

### CT097 — Criar regra sem nome

**Descrição:** Tentar criar sem preencher nome.

**Passos:**

1. Abrir modal
2. Deixar nome vazio
3. Clicar em "Salvar"

**Resultado esperado:** Botão "Salvar" desabilitado (validação: `!nome || !descricao`).

**Criticidade:** Baixa

## resultado

**resultado do teste:** nãop consegui criar

---

### CT098 — Editar regra de impacto

**Descrição:** Alterar regra existente.

**Passos:**

1. Clicar em "Editar" em uma regra
2. Modificar campos
3. Salvar

**Resultado esperado:** Regra atualizada na lista.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui visualizar

---

### CT099 — Ativar/Desativar regra

**Descrição:** Toggle ativo/inativo.

**Passos:**

1. Clicar em "Ativa" / "Inativa" em uma regra

**Resultado esperado:** Badge e opacidade alternam. Regra inativa não é considerada na simulação.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção

---

### CT100 — Excluir regra

**Descrição:** Remover regra.

**Passos:**

1. Clicar em "Excluir"
2. Confirmar no `confirm()`

**Resultado esperado:** Regra removida da lista.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção

---

# Módulo 14 — Admin: Dashboard

## Funcionalidade 14.1 — Visualizar Dashboard

### CT101 — Acessar dashboard admin

**Descrição:** ADMIN_PLATAFORMA acessa dashboard.

**Passos:**

1. Logar como ADMIN_PLATAFORMA
2. Acessar `/admin`

**Resultado esperado:**

- 5 cards de KPI: Empresas Ativas, Receita do Mês, Investimento Total, Total Colaboradores, Gastos do Mês
- Seção "Ações Rápidas" com links
- Lista "Empresas Recentes" (5 últimas)
- Navegação lateral com links completos

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT102 — ADMIN_SUPORTE acessa dashboard

**Descrição:** ADMIN_SUPORTE é redirecionado do dashboard.

**Passos:**

1. Logar como ADMIN_SUPORTE
2. Acessar `/admin`

**Resultado esperado:** Redirecionado para `/admin/empresas` (SUPORTE não vê dashboard, conforme layout)

**Criticidade:** Média

## resultado

**resultado do teste:** não existe usuario supotte ainda

---

### CT103 — Usuário não-admin tenta acessar /admin

**Descrição:** CEO ou colaborador tenta acessar área admin.

**Passos:**

1. Logar como CEO
2. Acessar `/admin`

**Resultado esperado:** Redirecionado para `/login` (via AdminLayout)

**Criticidade:** Crítica

## resultado

**resultado do teste:** esta redirecionando para login e tem que na verdade exibir que ele não tem autorziação para acessar a quela pagina

---

# Módulo 15 — Admin: Empresas

## Funcionalidade 15.1 — Listar Empresas

### CT104 — Listar empresas (admin)

**Descrição:** ADMIN_PLATAFORMA visualiza lista de empresas.

**Passos:**

1. Acessar `/admin/empresas`

**Resultado esperado:**

- Tabela: Empresa (link), Slug, Contato, Status, Plano, Colaboradores, Desde, Ações
- Botão "+ Nova Empresa"
- Ações: Alternar Status, Detalhes, Excluir

**Criticidade:** Alta,

## resultado

**resultado do teste:** passed

---

## Funcionalidade 15.2 — Criar Empresa (Admin)

### CT105 — Criar empresa pelo admin

**Descrição:** ADMIN_PLATAFORMA cria nova empresa manualmente.

**Passos:**

1. Acessar `/admin/empresas/nova`
2. Preencher "Nome da Empresa"
3. Slug gerado automaticamente (editável)
4. Preencher dados do CEO (nome, email, senha)
5. Clicar em "Criar Empresa"

**Resultado esperado:**

- Empresa criada (slug único)
- CEO criado como colaborador
- Assinatura criada (plano padrão)
- Mensagem de sucesso
- Redirecionado para `/admin/empresas` após 1.5s

**Criticidade:** Crítica

## resultado

**resultado do teste:** usuario admin system foi deletado por engano

---

### CT106 — Criar empresa com slug duplicado

**Descrição:** Tentar criar empresa com slug que já existe.

**Passos:**

1. Preencher slug igual a uma empresa existente
2. Tentar criar

**Resultado esperado:** Erro de unique constraint no banco. Mensagem de erro amigável.

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

## Funcionalidade 15.3 — Detalhe da Empresa

### CT107 — Visualizar detalhe da empresa

**Descrição:** Clicar em empresa na lista.

**Passos:**

1. Em `/admin/empresas`, clicar em nome
2. Observar `/admin/empresas/[id]`

**Resultado esperado:**

- Grid 2x2: Informações, Plano, Colaboradores (contagem), Ações
- Breadcrumb

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT108 — Empresa não encontrada

**Descrição:** Acessar ID de empresa inexistente.

**Passos:**

1. Acessar `/admin/empresas/id_invalido`

**Resultado esperado:** Página 404.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

## Funcionalidade 15.4 — Alternar Status da Empresa

### CT109 — Ativar/Desativar empresa

**Descrição:** Alternar status de empresa entre ativa/inativa.

**Passos:**

1. Em `/admin/empresas`, clicar "Alternar" em empresa ativa

**Resultado esperado:**

- Status alterado (Ativa ↔ Inativa)
- Colaboradores dessa empresa não conseguem mais logar (testar CT007)

**Criticidade:** Crítica

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

## Funcionalidade 15.5 — Excluir Empresa

### CT110 — Excluir empresa

**Descrição:** ADMIN_PLATAFORMA exclui empresa e todos os dados.

**Passos:**

1. Clicar em "Excluir" em empresa
2. Confirmar

**Resultado esperado:** Empresa e todos os registros associados (colaboradores, avaliações, métricas, etc.) são removidos. Ação irreversível.

**Criticidade:** Crítica

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT111 — ADMIN_SUPORTE tenta excluir empresa

**Descrição:** Verificar que SUPORTE não pode excluir.

**Passos:**

1. Logar como ADMIN_SUPORTE
2. Tentar acessar ação de excluir

**Resultado esperado:** Botão de excluir pode não estar visível, ou ação retorna erro de permissão.

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção nao existe usuaro de suporte

---

# Módulo 16 — Admin: Gastos do Sistema

## Funcionalidade 16.1 — CRUD Gastos

### CT112 — Listar gastos com filtro

**Descrição:** Visualizar gastos com filtro por mês/ano.

**Passos:**

1. Acessar `/admin/gastos`
2. Selecionar mês e ano nos filtros

**Resultado esperado:**

- Cards de gastos filtrados
- Total do período exibido
- Filtros aplicados via query params

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT113 — Criar gasto válido

**Descrição:** Cadastrar novo gasto do sistema.

**Passos:**

1. Preencher tipo, descrição, valor, mês, ano
2. Opcional: recorrente, fornecedor, observação
3. Clicar em "Salvar"

**Resultado esperado:** Gasto adicionado na lista.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT114 — Editar gasto

**Descrição:** Alterar gasto existente via modal.

**Passos:**

1. Clicar em "Editar" em um card
2. Modificar valor
3. Salvar

**Resultado esperado:** Gasto atualizado.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT115 — Excluir gasto

**Descrição:** Remover gasto.

**Passos:**

1. Clicar em "Excluir"
2. Confirmar

**Resultado esperado:** Gasto removido.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

# Módulo 17 — Admin: Investimentos

## Funcionalidade 17.1 — CRUD Investimentos

### CT116 — Criar investimento válido

**Descrição:** Registrar novo investimento.

**Passos:**

1. Acessar `/admin/investimentos`
2. Preencher descrição, valor, data
3. Clicar em "Salvar"

**Resultado esperado:** Investimento adicionado na lista.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT117 — Editar investimento

**Descrição:** Alterar investimento via modal.

**Passos:**

1. Clicar em "Editar"
2. Modificar valor
3. Salvar

**Resultado esperado:** Investimento atualizado.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT118 — Excluir investimento

**Descrição:** Remover investimento.

**Passos:**

1. Clicar em "Excluir"
2. Confirmar

**Resultado esperado:** Investimento removido.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

# Módulo 18 — Admin: Financeiro

## Funcionalidade 18.1 — Indicadores Financeiros

### CT119 — Visualizar painel financeiro

**Descrição:** Acessar indicadores financeiros consolidados.

**Passos:**

1. Acessar `/admin/financeiro`

**Resultado esperado:**

- 7 KPIs: Receita, Gastos, Investimento, Lucro Líquido, ROI, Payback, Margem Líquida
- Tabela mensal com 12 linhas (Mes, Receita, Gasto, Saldo)
- Valores coloridos (verde/positivo, vermelho/negativo)

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT120 — Financeiro sem dados

**Descrição:** Painel financeiro sem nenhum gasto/investimento/assinatura.

**Passos:**

1. Acessar `/admin/financeiro` com banco vazio

**Resultado esperado:** KPIs zerados ou com valores padrão. Tabela mensal vazia (ou com zeros). Sem erros.

**Criticidade:** Baixa

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

# Módulo 19 — Admin: Usuários do Sistema

## Funcionalidade 19.1 — Gerenciar Admins

### CT121 — Listar admins

**Descrição:** Visualizar administradores do sistema.

**Passos:**

1. Acessar `/admin/usuarios`

**Resultado esperado:**

- Formulário "Adicionar Admin" (esquerda)
- Lista de admins (direita): avatar inicial, nome, email, papel badge, status badge, Excluir

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT122 — Criar admin válido

**Descrição:** Criar novo administrador.

**Passos:**

1. Preencher nome, email, papel (ADMIN_PLATAFORMA ou ADMIN_SUPORTE), senha
2. Clicar em "Adicionar"

**Resultado esperado:** Admin adicionado à lista. Novo admin consegue logar.

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT123 — Criar admin com email duplicado

**Descrição:** Tentar criar admin com email já existente.

**Passos:**

1. Preencher email já cadastrado
2. Tentar adicionar

**Resultado esperado:** Erro de duplicidade. Mensagem exibida.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT124 — Excluir admin

**Descrição:** Remover administrador do sistema.

**Passos:**

1. Clicar em "Excluir" em um card de admin (que não seja o próprio)
2. Confirmar

**Resultado esperado:** Admin removido. Admin excluído não consegue mais logar.

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT125 — Excluir o próprio admin

**Descrição:** Tentar excluir a si mesmo da lista de admins.

**Passos:**

1. Identificar seu próprio card
2. Verificar se botão "Excluir" existe

**Resultado esperado:** Botão "Excluir" não deve estar visível para o próprio usuário (protegido no código: `session.colaboradorId !== admin.id`)

**Criticidade:** Alta

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano, no caso ele foi excluido diretametne no banco por isso o erro

---

# Módulo 20 — Admin: Perfil

## Funcionalidade 20.1 — Gerenciar Perfil Admin

### CT126 — Atualizar perfil admin

**Descrição:** ADMIN_PLATAFORMA altera nome, username e tema.

**Passos:**

1. Acessar `/admin/perfil`
2. Modificar campos
3. Salvar

**Resultado esperado:** Perfil atualizado. Mesmo comportamento do perfil de usuário comum.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

### CT127 — Upload de foto (admin)

**Descrição:** Admin envia foto de perfil.

**Passos:**

1. Em `/admin/perfil`, clicar em "Escolher Foto"
2. Selecionar imagem
3. Aguardar

**Resultado esperado:** Foto atualizada. Mesmo fluxo do perfil comum.

**Criticidade:** Média

## resultado

**resultado do teste:** nãop consegui ver essa opção usuario admin system foi deletado por engano

---

# Módulo 21 — Público: Onboarding

## Funcionalidade 21.1 — Criar Conta (Auto-cadastro)

### CT128 — Onboarding bem-sucedido

**Descrição:** Nova empresa se cadastra via onboarding.

**Pré-requisitos:** Plano existente no banco.

**Passos:**

1. Acessar `/checkout/[slug]` de um plano
2. Selecionar ciclo (mensal/anual)
3. Clicar em "Continuar"
4. No onboarding, preencher dados da empresa (nome)
5. Preencher dados do CEO (nome, email, senha)
6. Clicar em "Criar Conta"

**Resultado esperado:**

- Empresa criada
- CEO criado como colaborador
- Slug gerado automaticamente
- Redirecionado para `/login?sucesso=Conta+criada+com+sucesso`
- CEO consegue logar com email e senha cadastrados

**Criticidade:** Crítica

## resultado

**resultado do teste:** passed

---

### CT129 — Onboarding com slug já existente

**Descrição:** Tentar criar empresa com slug já em uso.

**Passos:**

1. Preencher slug igual a empresa existente
2. Tentar criar

**Resultado esperado:** Erro de unique constraint. Mensagem de erro amigável.

**Criticidade:** Alta

## resultado

**resultado do teste:** passed mas nçao passou feedback que realmente ajudasse o usuairo e ainda quebrou o fluxo da aplicação

---

### CT130 — Onboarding com plano inexistente

**Descrição:** Tentar onboarding sem plano válido.

**Passos:**

1. Acessar `/onboarding?planoId=id_invalido`

**Resultado esperado:** Mensagem de erro "Plano não encontrado".

**Criticidade:** Média

## resultado

**resultado do teste:** testar posteriormente

---

# Módulo 22 — Público: Checkout

## Funcionalidade 22.1 — Página do Plano

### CT131 — Visualizar checkout de plano

**Descrição:** Acessar página de checkout de um plano.

**Passos:**

1. Acessar `/checkout/[slug]` com slug de plano existente

**Resultado esperado:**

- Resumo do plano (nome, descrição, preço, recursos)
- Toggle mensal/anual (20% off no anual)
- Formulário de pagamento (mock: cartão, boleto, pix)
- Warning "100% simulado"

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT132 — Plano não encontrado no checkout

**Descrição:** Acessar checkout com slug inexistente.

**Passos:**

1. Acessar `/checkout/slug_inexistente`

**Resultado esperado:** "Plano não encontrado" com link para homepage.

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT133 — Processar pagamento mock

**Descrição:** Submeter formulário de checkout.

**Passos:**

1. Preencher "Nome no Cartão"
2. Selecionar método
3. Clicar em "Finalizar"

**Resultado esperado:**

- Loading de 2s (mock)
- Redirecionado para `/onboarding?planoId=X&ciclo=Y`

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

# Módulo 23 — APIs de IA

## Funcionalidade 23.1 — GET /api/ai/features

### CT134 — Verificar feature flags

**Descrição:** Obter status das features de IA.

**Passos:**

1. Fazer requisição GET para `/api/ai/features`

**Resultado esperado:**

- Status 200
- JSON com 4 booleanos: `ai-sugestao-candidatos`, `ai-feedback-avaliacao`, `ai-iniciativa`, `ai-sentimento`
- Cada flag reflete o valor da env var `FF_AI_*` correspondente

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 23.2 — POST /api/ai/sugerir-candidatos

### CT135 — Sugerir candidatos com payload válido

**Descrição:** Chamar API de sugestão de candidatos.

**Passos:**

1. Fazer POST para `/api/ai/sugerir-candidatos`
2. Body: `{ "cargoVago": "Gerente de Vendas", "liderVagoId": "id_valido" }`

**Resultado esperado:**

- Status 200
- `{ candidatos: [...], usouIA: boolean }`
- Candidatos ordenados por score decrescente

**Criticidade:** Média

## resultado

**resultado do teste:** ja funcionando

---

### CT136 — Sugerir candidatos sem payload obrigatório

**Descrição:** Campos obrigatórios ausentes.

**Passos:**

1. POST com body vazio `{}`

**Resultado esperado:** Status 400, `{ erro: "cargoVago e liderVagoId são obrigatórios" }`

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

### CT137 — Sugerir candidatos sem autenticação (deve falhar)

**Descrição:** A API de IA não exige autenticação.

**Passos:**

1. Fazer POST sem cookie de sessão

**Resultado esperado:** ⚠️ **A API aceita a requisição sem autenticação.** Isso é um **risco de segurança** — qualquer pessoa pode consumir tokens de IA.

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 23.3 — POST /api/ai/feedback

### CT138 — Gerar feedback com payload válido

**Descrição:** Chamar API de feedback.

**Passos:**

1. POST para `/api/ai/feedback`
2. Body: `{ "avaliadorId": "id", "avaliadoId": "id", "criterios": [{"criterio": "Comunicação", "nota": 4}] }`

**Resultado esperado:** Status 200, `{ feedback: "texto...", usouIA: boolean }`

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

### CT139 — Gerar feedback sem payload

**Descrição:** Campos obrigatórios ausentes.

**Passos:**

1. POST sem `criterios`

**Resultado esperado:** Status 400

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 23.4 — POST /api/ai/iniciativa

### CT140 — Sugerir iniciativa com payload válido

**Descrição:** Chamar API de iniciativa.

**Passos:**

1. POST para `/api/ai/iniciativa`
2. Body: `{ "colaboradorId": "id", "esboco": "Melhorar vendas" }`

**Resultado esperado:** Status 200, `{ sugestao: { titulo, descricao, resultado, unidadeMedidaSugerida }, usouIA: boolean }`

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 23.5 — POST /api/ai/sentimento

### CT141 — Analisar sentimento

**Descrição:** Chamar API de sentimento.

**Passos:**

1. POST para `/api/ai/sentimento`
2. Body: `{ "colaboradorId": "id" }`

**Resultado esperado:** Status 200, `{ analise: { sentimento, score, insights }, usouIA: boolean }`

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

# Módulo 24 — API de Upload de Foto

## Funcionalidade 24.1 — POST /api/upload-foto

### CT142 — Upload sem autenticação

**Descrição:** Tentar enviar foto sem estar logado.

**Passos:**

1. Fazer POST para `/api/upload-foto` sem cookie de sessão
2. FormData com `foto` = arquivo de imagem

**Resultado esperado:** Status 401, `{ erro: "Não autorizado" }`

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT143 — Upload sem arquivo

**Descrição:** Enviar requisição sem o campo `foto`.

**Passos:**

1. POST com FormData vazio
2. Autenticado

**Resultado esperado:** Status 400, `{ erro: "Nenhum arquivo enviado" }`

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT144 — Upload de arquivo não-imagem

**Descrição:** Enviar arquivo .txt.

**Passos:**

1. POST com `foto` = arquivo de texto

**Resultado esperado:** Status 400, `{ erro: "O arquivo precisa ser uma imagem" }`

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

# Módulo 25 — Permissões e RBAC (Testes Transversais)

## Funcionalidade 25.1 — Hierarquia de Acesso

### CT145 — CEO edita qualquer colaborador da empresa

**Descrição:** CEO pode editar nome/função de qualquer colaborador na empresa.

**Passos:**

1. Logar como CEO
2. No organograma, editar (duplo clique) um OPERACIONAL
3. Salvar

**Resultado esperado:** Edição permitida e persistida.

**Criticidade:** Crítica

## resultado

**resultado do teste:** testar mais pra frente

---

### CT146 — LÍDER tenta editar DIRETOR

**Descrição:** LÍDER não pode editar cargo acima na hierarquia.

**Passos:**

1. Logar como LIDER
2. No organograma, tentar editar um GERENTE ou DIRETOR

**Resultado esperado:** A edição não deve ser permitida (erro de permissão no servidor).

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

### CT147 — Contratação: CEO contrata DIRETOR

**Descrição:** CEO pode contratar um DIRETOR (1 nível abaixo).

**Passos:**

1. Logar como CEO
2. Adicionar colaborador com papel DIRETOR

**Resultado esperado:** Permitido.

**Criticidade:** Alta

## resultado

**resultado do teste:** passed

---

### CT148 — Contratação: CEO tenta contratar GERENTE

**Descrição:** CEO **não** pode contratar GERENTE (regra: CEO só contrata DIRETOR).

**Passos:**

1. Logar como CEO
2. Tentar adicionar colaborador com papel GERENTE

**Nota:** A regra `podeContratar(CEO, GERENTE)` retorna `false`. Mas atualmente não há seletor de papel no formulário de adicionar — a permissão pode não ser verificada nesse fluxo. ⚠️ Necessário validar com o responsável.

**Resultado esperado:** Ação bloqueada ou permissão negada.

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

### CT149 — Demissão: LÍDER demite OPERACIONAL

**Descrição:** LÍDER pode demitir OPERACIONAL (subordinado direto).

**Passos:**

1. Logar como LIDER
2. No organograma, simular demissão de OPERACIONAL subordinado

**Resultado esperado:** Permitido.

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

### CT150 — Promoção: DIRETOR promove para SUPERVISOR

**Descrição:** DIRETOR pode promover para SUPERVISOR.

**Passos:**

1. Logar como DIRETOR
2. Simular promoção de GERENTE para SUPERVISOR

**Resultado esperado:** `podePromoverPara(DIRETOR, SUPERVISOR)` = true. Ação permitida.

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

# Módulo 26 — Segurança (Testes Transversais)

## Funcionalidade 26.1 — SQL Injection

### CT151 — SQL Injection no login

**Descrição:** Tentar SQL Injection no campo de email.

**Passos:**

1. Acessar `/login`
2. Email: `' OR 1=1 --`
3. Senha: qualquer
4. Clicar em "Entrar"

**Resultado esperado:** Prisma usa query parametrizada (prepared statements). A tentativa é inofensiva. Retorna "Email ou senha inválidos".

**Criticidade:** Crítica

---

### CT152 — SQL Injection em formulários

**Descrição:** Inserir SQL Injection em campos de formulário.

**Passos:**

1. Em qualquer formulário (ex: criar colaborador), inserir `'; DROP TABLE Colaborador; --` no campo "Nome"
2. Submeter

**Resultado esperado:** Prisma escapa/parametriza. Tabela não é afetada. O nome é salvo literalmente.

**Criticidade:** Crítica

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 26.2 — XSS (Cross-Site Scripting)

### CT153 — XSS no nome do colaborador

**Descrição:** Inserir script malicioso no nome.

**Passos:**

1. Criar colaborador com nome `<script>alert('XSS')</script>`
2. Visualizar na lista de colaboradores e no organograma

**Resultado esperado:** React escapa HTML por padrão (`{colaborador.nome}` renderiza como texto, não HTML). O script não executa.

**Criticidade:** Crítica

## resultado

**resultado do teste:** testar mais pra frente

---

### CT154 — XSS no comentário de avaliação

**Descrição:** Inserir HTML/script em campo de texto.

**Passos:**

1. Criar avaliação com comentário `<img src=x onerror=alert('XSS')>`
2. Visualizar na lista

**Resultado esperado:** React escapa o conteúdo. Nenhum script executado.

**Criticidade:** Crítica

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 26.3 — CSRF

### CT155 — CSRF em server actions

**Descrição:** Tentar induzir ação não intencional via link externo.

**Passos:**

1. Criar página HTML externa com formulário que POST para `/colaboradores/novo`
2. Tentar submeter

**Resultado esperado:** Next.js Server Actions protegem contra CSRF por padrão (requerem cabeçalho `Content-Type: application/x-www-form-urlencoded` ou `multipart/form-data` com cookie). Ação deve falhar.

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 26.4 — Sessão e Token

### CT156 — JWT secret padrão

**Descrição:** Verificar se o segredo JWT padrão foi alterado.

**Passos:**

1. Verificar `auth.ts` linha do `JWT_SECRET`

**Resultado esperado:** **⚠️ RISCO:** O código tem fallback `'fallback-secret-change-me'`. Se a env var `JWT_SECRET` não estiver definida em produção, qualquer um pode forjar tokens JWT.

**Criticidade:** Crítica

## resultado

**resultado do teste:** testar mais pra frente

---

### CT157 — Cookie httpOnly

**Descrição:** Verificar que o cookie de sessão não é acessível por JavaScript.

**Passos:**

1. Fazer login
2. No console do navegador: `document.cookie`

**Resultado esperado:** Cookie `session` **não** aparece (httpOnly=true). Cookie `tema` aparece (httpOnly=false — proposital).

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

### CT158 — Cookie secure em produção

**Descrição:** Verificar flag Secure do cookie.

**Passos:**

1. Verificar configuração em `auth-actions.ts`

**Resultado esperado:** Cookie `session` tem `secure: process.env.NODE_ENV === 'production'`. Em produção, enviado apenas via HTTPS.

**Criticidade:** Crítica

## resultado

## **resultado do teste:** testar mais pra frente

## Funcionalidade 26.5 — Rate Limiting

### CT159 — Tentativas múltiplas de login

**Descrição:** Realizar múltiplas tentativas de login em sequência.

**Passos:**

1. Tentar logar 10 vezes com senha incorreta em rápida sucessão

**Resultado esperado:** ⚠️ **Não há rate limiting.** Todas as tentativas são processadas. Risco de brute force.

**Criticidade:** Alta

## resultado

**resultado do teste:** testar mais pra frente

---

# Módulo 27 — Interface e Experiência do Usuário (Testes Transversais)

## Funcionalidade 27.1 — Navegação

### CT160 — Navbar responsivo

**Descrição:** Verificar navbar em diferentes tamanhos de tela.

**Passos:**

1. Estar logado
2. Redimensionar viewport para 375px (mobile)

**Resultado esperado:** Navbar se adapta (possivelmente menu hamburguer). Links permanecem acessíveis.

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

### CT161 — Breadcrumbs no admin

**Descrição:** Verificar breadcrumbs nas páginas admin.

**Passos:**

1. Acessar `/admin/empresas/[id]`

**Resultado esperado:** Breadcrumb visível: "Empresas / {Nome da Empresa}"

**Criticidade:** Baixa

## resultado

**resultado do teste:** testar mais pra frente

---

## Funcionalidade 27.2 — Temas

### CT162 — Modo escuro

**Descrição:** Alternar para tema escuro.

**Passos:**

1. Clicar no toggle de tema
2. Percorrer várias páginas

**Resultado esperado:** Todas as páginas com fundo escuro e texto claro. Contraste adequado. Sem quebras de layout.

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

### CT163 — Persistência de tema

**Descrição:** Verificar que o tema persiste entre sessões.

**Passos:**

1. Alterar tema para escuro
2. Fechar e reabrir o navegador

**Resultado esperado:** Tema escuro mantido (lido do cookie).

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

## Funcionalidade 27.3 — Estados de Interface

### CT164 — Loading states

**Descrição:** Verificar indicadores de carregamento.

**Passos:**

1. Navegar entre páginas com dados
2. Observar transições

**Resultado esperado:**

- Páginas server-side: sem loading (servidor envia HTML pronto)
- Componentes client-side com fetch (ex: OrganogramaWrapper, AnaliseSentimentoBadge): loading spinner ou estado de carregamento
- Upload de foto: spinner sobre o avatar

**Criticidade:** Média

## resultado

**resultado do teste:** testar mais pra frente

---

### CT165 — Página 404

**Descrição:** Acessar rota inexistente.

**Passos:**

1. Acessar `/rota-inexistente`

**Resultado esperado:** Página 404 amigável.

**Criticidade:** Baixa

## resultado

**resultado do teste:** redirecionando para login

---

### CT166 — Modais: fechar com clique fora

**Descrição:** Clicar fora do modal para fechar.

**Passos:**

1. Abrir modal no organograma (ex: Adicionar Subordinado)
2. Clicar no backdrop (fundo escuro)

**Resultado esperado:** Modal fecha.

**Criticidade:** Média

---

### CT167 — Modais: tecla Escape

**Descrição:** Pressionar Escape para fechar modal.

**Passos:**

1. Abrir modal
2. Pressionar Escape

**Resultado esperado:** Modal fecha (quando implementado).

**Criticidade:** Média

## resultado

**resultado do teste:** passed

---

---

## Resumo

### Quantidade Total de Casos de Teste

| Módulo                       | CTs     |
| ---------------------------- | ------- |
| 1 — Autenticação e Sessão    | 13      |
| 2 — Home / Landing Page      | 4       |
| 3 — Perfil do Usuário        | 13      |
| 4 — Organograma              | 26      |
| 5 — Colaboradores (CRUD)     | 10      |
| 6 — Avaliações de Desempenho | 6       |
| 7 — Métricas Mensais         | 6       |
| 8 — Iniciativas              | 4       |
| 9 — Conversas / Reuniões     | 4       |
| 10 — Fit Cultural            | 3       |
| 11 — Teste DISC              | 3       |
| 12 — Pesquisa de Sentimento  | 2       |
| 13 — Regras de Impacto       | 6       |
| 14 — Admin: Dashboard        | 3       |
| 15 — Admin: Empresas         | 8       |
| 16 — Admin: Gastos           | 4       |
| 17 — Admin: Investimentos    | 3       |
| 18 — Admin: Financeiro       | 2       |
| 19 — Admin: Usuários         | 5       |
| 20 — Admin: Perfil           | 2       |
| 21 — Público: Onboarding     | 3       |
| 22 — Público: Checkout       | 3       |
| 23 — APIs de IA              | 8       |
| 24 — API de Upload de Foto   | 3       |
| 25 — Permissões e RBAC       | 6       |
| 26 — Segurança               | 9       |
| 27 — Interface e UX          | 8       |
| **Total**                    | **167** |

---

### Cobertura Estimada do Sistema

| Aspecto                  | Cobertura                                                                         |
| ------------------------ | --------------------------------------------------------------------------------- |
| Páginas                  | ~95% (22 de 23 páginas cobertas — exceto `_not-found` implícita)                  |
| APIs                     | 100% (6 endpoints cobertos)                                                       |
| Componentes              | ~90% (componentes principais cobertos)                                            |
| Fluxos de autenticação   | 100%                                                                              |
| CRUDs                    | ~90% (todos os CRUDs identificados cobertos)                                      |
| Regras de permissão      | ~80% (principais regras cobertas; algumas específicas podem precisar de expansão) |
| Validações de formulário | ~85%                                                                              |
| IA e fallbacks           | 100%                                                                              |
| Segurança                | ~70% (testes de penetração mais profundos podem ser necessários)                  |
| Responsividade           | ~30% (apenas teste básico de redimensionamento)                                   |

---

### Funcionalidades que Não Puderam Ser Analisadas por Falta de Contexto

1. **Regras de cálculo do Score do Colaborador** — O peso exato de cada sub-score (fit cultural, DISC, sentimento, conversas, avaliações, métricas, iniciativas) não foi completamente analisado. Necessário validar com o responsável.
2. **Regras de condição da simulação (10 tipos)** — As 10 condições (`time_sem_lider`, `promocao_avaliacao_alta`, etc.) têm comportamento detalhado em `simulacao.ts` que não foi exaustivamente verificado para cada condição.
3. **Processo de "cascata" de promoções** — A lógica exata de quando uma cascata é acionada e como os candidatos são sugeridos em cada nível.
4. **"Peter Principle Check" na simulação** — Existe lógica que verifica se uma promoção viola o Princípio de Peter; os detalhes precisam ser validados.
5. **Ciclo de faturamento real** — Atualmente o pagamento é 100% mock. Não há integração com gateway de pagamento real.
6. **Política de expiração de trial** — Não identificado no código como o trial é gerenciado.

---

### Pontos de Atenção

| #   | Ponto                                                                | Impacto                                                                                 |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | **JWT_SECRET com fallback inseguro** (`'fallback-secret-change-me'`) | Qualquer um pode forjar tokens JWT se a env var não estiver definida                    |
| 2   | **APIs de IA sem autenticação**                                      | Qualquer pessoa com acesso às URLs pode consumir tokens de IA (custo financeiro)        |
| 3   | **Não invalida sessão após troca de senha**                          | Token JWT antigo continua válido por 24h                                                |
| 4   | **Sem rate limiting no login**                                       | Vulnerável a ataques de brute force                                                     |
| 5   | **Sem recuperação de senha**                                         | Se usuário esquecer a senha, não há meio de recuperar                                   |
| 6   | **Sem validação de CPF**                                             | CPF é armazenado como string livre, sem validação de dígitos verificadores              |
| 7   | **Senhas padrão baseadas em CPF**                                    | Os primeiros 6 dígitos do CPF são a senha inicial — extremamente frágil                 |
| 8   | **Cascade de deleção de colaborador**                                | Conversas, respostas de testes e scores podem ficar órfãos                              |
| 9   | **bodyParser / upload size limit**                                   | Não há validação de tamanho máximo de arquivo para upload de foto                       |
| 10  | **Sem verificação de permissão ao adicionar colaborador**            | O formulário de criar colaborador não verifica se o usuário pode contratar aquele papel |
| 11  | **Sem validação de e-mail**                                          | O campo e-mail não é verificado quanto a formato/domínio real                           |
| 12  | **Não há confirmação de e-mail**                                     | Usuários podem ser criados com qualquer e-mail, sem verificação                         |

---

### Possíveis Riscos de Produção

| Risco                                 | Probabilidade                 | Impacto                 | Mitigação                                                               |
| ------------------------------------- | ----------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| JWT secret padrão em produção         | Média                         | Crítico                 | Garantir que `JWT_SECRET` esteja definido em produção                   |
| Ataque de brute force no login        | Alta                          | Alto                    | Implementar rate limiting (ex: 5 tentativas/min)                        |
| Consumo não autorizado de API de IA   | Alta (se URLs forem expostas) | Alto (custo financeiro) | Adicionar autenticação JWT nos endpoints de IA                          |
| Perda de dados ao excluir colaborador | Média                         | Alto                    | Revisar cascade de deleção para incluir todas as tabelas relacionadas   |
| Vazamento de informação no login      | Baixa                         | Médio                   | Já tratado (mesma mensagem para usuário inexistente e senha errada)     |
| Upload de arquivos maliciosos         | Baixa                         | Alto                    | `sharp` processa apenas imagens, mas validação de tamanho é recomendada |
| Falha de sessão por cookie não seguro | Baixa (se HTTPS)              | Alto                    | Verificar HTTPS em produção                                             |

---

### Funcionalidades que Merecem Testes Automatizados

| Prioridade     | Funcionalidade                                                       | Motivo                                                                                                   |
| -------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 🔴 **Crítica** | Fluxo de login/logout/sessão                                         | Base de todo o sistema. Testes de unidade para `autenticarPorEmailSenha`, `criarToken`, `verificarToken` |
| 🔴 **Crítica** | Regras de permissão (`podeEditarColaborador`, `podeContratar`, etc.) | Lógica complexa com múltiplos casos de borda                                                             |
| 🔴 **Crítica** | Simulação de organograma (`processarAcao`, `calcularImpactos`)       | Lógica de negócio mais complexa do sistema (~1000 linhas)                                                |
| 🟡 **Alta**    | CRUD de colaboradores                                                | Operação central com cascata de deleção                                                                  |
| 🟡 **Alta**    | Score do colaborador (`calcularEAtualizarScore`)                     | Fórmula ponderada com 7 sub-scores                                                                       |
| 🟡 **Alta**    | APIs de IA (todos os 4 endpoints) + fallbacks                        | Contrato da API + comportamento de fallback                                                              |
| 🟢 **Média**   | Upload e processamento de foto (sharp)                               | Processamento de imagem com múltiplos formatos de entrada                                                |
| 🟢 **Média**   | Métricas mensais — cálculo de perfil (Ruim/Bom)                      | Regra de negócio simples mas usada em relatórios                                                         |
| 🟢 **Média**   | Testes de integração para rotas protegidas                           | Garantir que redirecionamentos de segurança funcionam                                                    |
| ⚪ **Baixa**   | Testes de componentes (OrganogramaNode, SelectCargo)                 | Comportamento visual pode ser verificado com testes unitários                                            |
| ⚪ **Baixa**   | Testes E2E (Playwright/Cypress) para fluxos críticos                 | Login → Organograma → Simular → Aplicar                                                                  |

**Recomendação:** Iniciar automação pelos testes de unidade das funções puras (simulação, permissões, score) e pelos testes de API (AI endpoints). Em seguida, evoluir para testes E2E dos fluxos críticos.

---

_Documento gerado em 19/07/2026 — Revisar e validar com o responsável pelo sistema antes da execução._
