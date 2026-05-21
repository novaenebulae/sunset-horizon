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

  it('affiche le message initial pour le coucher corrigé', () => {
    render(<App />)
    expect(
      screen.getByText(/choisis un point ou utilise ta position actuelle/i),
    ).toBeInTheDocument()
  })
})
