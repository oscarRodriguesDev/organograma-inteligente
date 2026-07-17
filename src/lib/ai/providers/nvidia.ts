/**
 * Provider NVIDIA NIM — implementação específica.
 *
 * Usa a API de Chat Completions da NVIDIA (compatível com OpenAI).
 * Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
 *
 * Modelos disponíveis:
 *   - meta/llama-3.1-8b-instruct  (rápido, ~800 tokens/s)
 *   - meta/llama-3.1-70b-instruct (profundo, ~200 tokens/s)
 *   - mistralai/mixtral-8x22b-instruct-v0.1
 *
 * Documentação: https://build.nvidia.com/docs
 */

export const NVIDIA_MODELS = {
  FAST: 'meta/llama-3.1-8b-instruct',
  BALANCED: 'mistralai/mixtral-8x22b-instruct-v0.1',
  DEEP: 'meta/llama-3.1-70b-instruct',
} as const

export type NvidiaModel = (typeof NVIDIA_MODELS)[keyof typeof NVIDIA_MODELS]
