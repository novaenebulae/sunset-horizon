import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/app/App'

describe('App', () => {
  it('affiche le titre Sunset Horizon', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /sunset horizon/i })).toBeInTheDocument()
  })
})
