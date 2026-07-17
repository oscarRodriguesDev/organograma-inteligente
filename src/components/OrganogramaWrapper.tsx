'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Colaborador } from '@/lib/types'

const OrganogramaFlow = dynamic(() => import('@/components/OrganogramaFlow'), {
  ssr: false,
})

export default function OrganogramaWrapper({
  colaboradores,
}: {
  colaboradores: Colaborador[]
}) {
  const [aiFeatures, setAiFeatures] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/ai/features')
      .then((r) => r.json())
      .then((data) => setAiFeatures(data))
      .catch(() => {
        // Se falhar, assume tudo false
        setAiFeatures({})
      })
  }, [])

  return (
    <OrganogramaFlow
      colaboradores={colaboradores}
      aiSugestaoCandidatos={!!aiFeatures['ai-sugestao-candidatos']}
    />
  )
}
