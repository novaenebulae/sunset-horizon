import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'

vi.mock('@/features/map/LocationToolbar', () => ({
  LocationToolbar: () => (
    <div data-testid="location-toolbar">Contrôles position (mock)</div>
  ),
}))

vi.mock('@/features/map/MapPanel', () => ({
  MapPanel: () => <div data-testid="map-panel">Carte (mock)</div>,
}))

vi.mock('@/features/results/HorizonProfileChart', () => ({
  HorizonProfileChart: () => (
    <div data-testid="horizon-profile-chart">Profil (mock)</div>
  ),
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


  it('affiche le sélecteur de date', () => {
    render(<App />)
    expect(screen.getAllByLabelText(/date d'observation/i).length).toBeGreaterThan(
      0,
    )
  })

  it('masque le diagnostic terrain par défaut', () => {
    render(<App />)
    expect(screen.queryByTestId('terrain-debug-panel')).not.toBeInTheDocument()
  })

  it('masque le panneau cache terrain par défaut', () => {
    render(<App />)
    expect(
      screen.queryByRole('region', { name: /^cache terrain$/i }),
    ).not.toBeInTheDocument()
  })

  it('affiche les contrôles de position en tête de page', () => {
    render(<App />)
    expect(screen.getAllByTestId('location-toolbar').length).toBeGreaterThan(0)
  })
})
