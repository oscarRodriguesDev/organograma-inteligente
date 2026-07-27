# Configuração do Webhook Asaas

## URL do Webhook

```
POST /api/webhooks/asaas
```

**Produção:** `https://seudominio.com/api/webhooks/asaas`
**Sandbox:** `http://localhost:3000/api/webhooks/asaas`

---

## Configuração no Painel do Asaas

1. Acesse o painel do Asaas (Sandbox ou Produção)
2. Vá em **Configurações → Webhooks**
3. Clique em **Adicionar Webhook**
4. Preencha:

| Campo | Valor |
|---|---|
| **URL** | `https://seudominio.com/api/webhooks/asaas` |
| **Versão da API** | `v3` |
| **Eventos** | Marcar todos os `PAYMENT_*` |

### Eventos tratados

| Evento Asaas | Status interno | Ação |
|---|---|---|
| `PAYMENT_RECEIVED` | `aprovado` | ✅ Libera o produto |
| `PAYMENT_CONFIRMED` | `aprovado` | ✅ Libera o produto |
| `PAYMENT_CREATED` | `pendente` | Cria registro pendente |
| `PAYMENT_PENDING` | `pendente` | Atualiza status |
| `PAYMENT_OVERDUE` | `pendente` | Atualiza status |
| `PAYMENT_REFUNDED` | `estornado` | 🔒 Revoga acesso |
| `PAYMENT_REFUNDED_EXTERNAL` | `estornado` | 🔒 Revoga acesso |
| `PAYMENT_CANCELLED` | `recusado` | 🔒 Revoga acesso |
| `PAYMENT_DENIED` | `recusado` | 🔒 Revoga acesso |
| `PAYMENT_FAILED` | `recusado` | 🔒 Revoga acesso |

---

## Variáveis de Ambiente

```env
# .env (dev) / .env.prod (produção)

# URL base do Asaas
ASAAS_API_URL=https://api-sandbox.asaas.com/v3     # Sandbox
ASAAS_API_URL=https://api.asaas.com/v3              # Produção

# Chave de integração (usada tanto para API quanto para verificação de assinatura do webhook)
ASAAS_API_KEY='sua_chave_aqui'
```

---

## Arquivos Modificados

| Arquivo | Função |
|---|---|
| `src/app/api/webhooks/asaas/route.ts` | Endpoint do webhook — recebe eventos, cria/atualiza pagamentos, libera o produto |
| `src/lib/asaas.ts` | Funções `processarEventoWebhook` (mapeia eventos) e `verificarAssinaturaWebhook` (HMAC-SHA256) |
| `src/lib/db.ts` | `criarEmpresaComCEO` — agora aceita `pagamentoId` real e vincula pagamento do webhook |
| `src/lib/public-actions.ts` | `criarContaAction` — passa `pagamentoId` e `metodo` do sessionToken |
| `prisma/schema.prisma` | Modelo `WebhookLog` adicionado para auditoria |

---

## Fluxo Completo

```
1. Usuário escolhe plano → preenche dados
2. criarCheckoutAsaasAction → cria pagamento no Asaas + sessionToken (JWT com pagamentoId real)
3. Usuário paga (PIX/Boleto/Cartão)
4. ASAAS ENVIA WEBHOOK → nosso endpoint:
   a. Verifica assinatura HMAC (header x-signature)
   b. Cria WebhookLog (auditoria)
   c. Cria pagamento pendente no banco (se ainda não existir)
   d. Se CONFIRMADO → ATUALIZA PAGAMENTO + ATIVA ASSINATURA + ATIVA EMPRESA
   e. Se ESTORNO/RECUSA → CANCELA ASSINATURA
5. Usuário completa cadastro → criarContaAction:
   a. Verifica sessionToken (criptograficamente assinado)
   b. Busca pagamento pelo Asaas payment ID
   c. Se já aprovado pelo webhook → vincula à assinatura
   d. Se pendente → bloqueia com mensagem amigável
   e. Se não existe → cria pagamento pendente com a referência real
```

---

## Verificação de Assinatura

O Asaas envia o header `x-signature` com o hash HMAC-SHA256 do corpo da requisição. A chave usada é a mesma `ASAAS_API_KEY`.

```ts
// Em src/lib/asaas.ts
export function verificarAssinaturaWebhook(body: string, signature: string | null): boolean
```

Atualmente o webhook está em **modo permissivo**: registra warning se a assinatura for inválida mas ainda processa o evento. Para **bloquear** requisições sem assinatura válida, descomente a linha no `route.ts`:

```ts
// return new NextResponse('Assinatura inválida', { status: 401 })
```

---

## Testando

### Sandbox
1. Use o ambiente sandbox do Asaas (chave com prefixo `$aact_hmlg_`)
2. Faça um checkout PIX no `localhost:3000`
3. Use o webhook simulator do Asaas Sandbox para disparar eventos
4. Verifique os logs no console do servidor: `[Webhook Asaas]`

### WebhookLog (auditoria)
Todos os eventos recebidos ficam registrados na tabela `WebhookLog` no banco de dados, com payload completo para depuração.

### Payload esperado
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_abc123",
    "externalReference": "PLANO:plano_id:CICLO:mensal:TS:1234567890",
    "status": "CONFIRMED",
    "value": 49.90,
    "billingType": "PIX",
    "customer": "cus_xyz789"
  }
}
```
