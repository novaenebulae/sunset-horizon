import { AppShell } from '@/components/AppShell'
import { Header } from '@/components/Header'

export function App() {
  return (
    <AppShell>
      <Header />
      <main className="flex flex-1 flex-col">
        <section
          className="rounded-xl border border-border bg-surface p-6"
          aria-labelledby="initial-state-heading"
        >
          <h2
            id="initial-state-heading"
            className="text-lg font-medium text-text"
          >
            Bienvenue
          </h2>
          <p className="mt-3 text-text-secondary">
            Choisis un point ou utilise ta position actuelle.
          </p>
          <p className="mt-4 text-sm text-text-secondary">
            La carte, le calcul solaire et les données IGN arrivent dans les
            prochaines phases. Cette version pose le socle technique de
            l&apos;application.
          </p>
        </section>
      </main>
      <footer className="mt-8 text-center text-xs text-text-secondary">
        Phase 0 — setup initial
      </footer>
    </AppShell>
  )
}
