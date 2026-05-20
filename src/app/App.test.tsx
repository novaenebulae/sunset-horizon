import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'

vi.mock('@/features/map/MapPanel', () => ({
  MapPanel: () => (
    <div data-testid="map-panel">Carte (mock)</div>
  ),
}))

describe('App', () => {
  it('affiche le titre Sunset Horizon', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /sunset horizon/i })).toBeInTheDocument()
  })

  it('affiche le bouton Me localiser', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /me localiser/i }),
    ).toBeInTheDocument()
  })

  it('affiche le message initial de sélection', () => {
    render(<App />)
    expect(
      screen.getByText(/choisis un point sur la carte/i),
    ).toBeInTheDocument()
  })
})
