/**
 * Cliente LLM genérico — abstrai o provedor de IA.
 *
 * A NVIDIA API é compatível com o formato OpenAI Chat Completions.
 * Endpoint: https://integrate.api.nvidia.com/v1
 * Modelos recomendados:
 *   - meta/llama-3.1-8b-instruct  (rápido, tarefas simples)
 *   - meta/llama-3.1-70b-instruct (análise mais profunda)
 */

export interface AIRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  maxTokens?: number
  model?: string
  /** Se true, resposta deve ser JSON válido */
  jsonMode?: boolean
}

export interface AIResponse {
  content: string
  model: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  latencyMs: number
  cached: boolean
}

export type AIProvider = 'nvidia' | 'mock'

const DEFAULT_MODEL = 'meta/llama-3.1-8b-instruct'
const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1'

let _nvidiaKey: string | null = null

export function getNvidiaKey(): string {
  if (!_nvidiaKey) {
    _nvidiaKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || null
    if (!_nvidiaKey) {
      throw new Error(
        'NVIDIA_API_KEY não configurada. Defina a variável de ambiente NVIDIA_API_KEY.'
      )
    }
  }
  return _nvidiaKey
}

/** Para testes/injeção */
export function setNvidiaKey(key: string) {
  _nvidiaKey = key
}

async function callNVIDIA(req: AIRequest): Promise<AIResponse> {
  const start = Date.now()
  const apiKey = getNvidiaKey()

  const body: Record<string, unknown> = {
    model: req.model || DEFAULT_MODEL,
    messages: req.messages,
    temperature: req.temperature ?? 0.2,
    max_tokens: req.maxTokens ?? 1024,
  }

  if (req.jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`NVIDIA API error ${res.status}: ${errBody}`)
  }

  const json = await res.json()
  const latencyMs = Date.now() - start

  return {
    content: json.choices[0]?.message?.content || '',
    model: json.model || req.model || DEFAULT_MODEL,
    usage: {
      promptTokens: json.usage?.prompt_tokens ?? 0,
      completionTokens: json.usage?.completion_tokens ?? 0,
      totalTokens: json.usage?.total_tokens ?? 0,
    },
    latencyMs,
    cached: false,
  }
}

/**
 * Provider mock para desenvolvimento — retorna respostas pré-definidas.
 * Ativado quando NVIDIA_API_KEY não está definida.
 */
async function callMock(req: AIRequest): Promise<AIResponse> {
  const start = Date.now()
  // Simula latência de rede
  await new Promise((r) => setTimeout(r, 300))

  let content = ''

  if (req.jsonMode) {
    content = JSON.stringify({ message: 'Resposta mockada (NVIDIA_API_KEY não configurada)' })
  } else {
    content =
      '**[Modo Mock — IA não configurada]** Defina a variável NVIDIA_API_KEY no .env.local para ativar chamadas reais à NVIDIA API.'
  }

  return {
    content,
    model: 'mock',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    latencyMs: Date.now() - start,
    cached: false,
  }
}

const providers: Record<string, (req: AIRequest) => Promise<AIResponse>> = {
  nvidia: callNVIDIA,
  mock: callMock,
}

function getProvider(): AIProvider {
  const p = (process.env.AI_PROVIDER || 'nvidia') as AIProvider
  return p
}

/**
 * Chama a IA com o provider configurado.
 * Se NVIDIA_API_KEY não estiver definida, entra em modo mock automaticamente.
 */
export async function callAI(req: AIRequest): Promise<AIResponse> {
  const provider: AIProvider = getNvidiaKey() ? (process.env.AI_PROVIDER as AIProvider) || 'nvidia' : 'mock'
  const impl = providers[provider]
  if (!impl) {
    throw new Error(`Provider "${provider}" não implementado. Use "nvidia" ou "mock".`)
  }
  return impl(req)
}
