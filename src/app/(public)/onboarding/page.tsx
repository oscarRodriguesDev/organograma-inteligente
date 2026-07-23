import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionToken?: string }>
}) {
  const { sessionToken } = await searchParams

  if (!sessionToken) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Sessão inválida</p>
          <p className="text-sm text-zinc-500">
            Faça o checkout de um plano para começar.
          </p>
        </div>
      </div>
    )
  }

  return <OnboardingForm sessionToken={sessionToken} />
}
