import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 sm:px-6">
      {children}
    </div>
  )
}
