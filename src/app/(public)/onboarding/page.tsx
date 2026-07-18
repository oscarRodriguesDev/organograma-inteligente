import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ planoId?: string; ciclo?: string }>
}) {
  const { planoId, ciclo } = await searchParams

  if (!planoId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Link inválido</p>
          <p className="text-sm text-zinc-500">
            Selecione um plano para começar.
          </p>
        </div>
      </div>
    )
  }

  return <OnboardingForm planoId={planoId} ciclo={ciclo ?? 'mensal'} />
}
