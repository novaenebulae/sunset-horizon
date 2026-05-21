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
    expect(screen.getByLabelText(/date d'observation/i)).toBeInTheDocument()
  })

  it('affiche les contrôles de position en tête de page', () => {
    render(<App />)
    expect(screen.getByTestId('location-toolbar')).toBeInTheDocument()
  })
})
