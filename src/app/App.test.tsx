import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'

vi.mock('@/features/map/MapPanel', () => ({
  MapPanel: () => <div data-testid="map-panel">Carte (mock)</div>,
}))

vi.mock('@/features/terrain/TerrainDebugPanel', () => ({
  TerrainDebugPanel: () => (
    <div data-testid="terrain-debug-panel">Diagnostic terrain (mock)</div>
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

  it('affiche le sélecteur de date', () => {
    render(<App />)
    expect(screen.getByLabelText(/date d'observation/i)).toBeInTheDocument()
  })

  it('affiche le message initial pour le coucher officiel', () => {
    render(<App />)
    expect(
      screen.getByText(/sélectionne un point pour voir le coucher officiel/i),
    ).toBeInTheDocument()
  })
})
