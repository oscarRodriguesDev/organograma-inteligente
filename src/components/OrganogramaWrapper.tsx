'use client'

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
  return <OrganogramaFlow colaboradores={colaboradores} />
}
