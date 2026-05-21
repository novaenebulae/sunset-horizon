import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
