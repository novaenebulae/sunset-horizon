import type { HorizonSunsetState } from '@/features/horizon/hooks/useHorizonSunset'

type ResultStatusProps = {
  state: HorizonSunsetState
  error?: string | null
}

const STATUS_MESSAGES: Record<
  Exclude<HorizonSunsetState, 'success'>,
  string
> = {
  idle: 'Choisis un point ou utilise ta position actuelle.',
  ready: 'Calcul du coucher corrigé en attente des données solaires…',
  loading: 'Analyse du relief dans la direction du soleil…',
  error: 'Impossible de calculer le coucher corrigé.',
  insufficient: 'Données insuffisantes pour estimer le coucher derrière le relief.',
}

export function ResultStatus({ state, error }: ResultStatusProps) {
  if (state === 'success') {
    return null
  }

  const message =
    (state === 'error' || state === 'insufficient') && error
      ? error
      : STATUS_MESSAGES[state]

  const tone =
    state === 'error'
      ? 'text-error'
      : state === 'loading'
        ? 'text-text-secondary'
        : 'text-text-secondary'

  return (
    <p className={`text-sm ${tone}`} role="status">
      {message}
    </p>
  )
}
