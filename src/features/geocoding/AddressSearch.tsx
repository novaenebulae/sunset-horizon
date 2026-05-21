import { useCallback, useEffect, useRef, useState } from 'react'
import { WarningBanner } from '@/components/WarningBanner'
import { searchAddresses } from './geocodingClient'
import { GeocodingError, type AddressSearchResult } from './geocodingTypes'

const DEBOUNCE_MS = 400
const MIN_CHARS = 3

type AddressSearchProps = {
  onSelect: (result: AddressSearchResult) => void
  disabled?: boolean
}

function formatSubtitle(result: AddressSearchResult): string | null {
  const parts = [result.postcode, result.city].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

export function AddressSearch({ onSelect, disabled = false }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const skipSearchRef = useRef(false)

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (trimmed.length < MIN_CHARS) {
      setResults([])
      setIsOpen(false)
      setError(null)
      setIsLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setIsLoading(true)
    setError(null)

    try {
      const items = await searchAddresses(trimmed, { limit: 5 })
      if (requestId !== requestIdRef.current) return
      setResults(items)
      setIsOpen(true)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setResults([])
      setIsOpen(false)
      if (err instanceof GeocodingError && err.code === 'EMPTY_QUERY') {
        setError(null)
      } else {
        setError(
          err instanceof GeocodingError
            ? err.message
            : 'Recherche d\'adresse impossible.',
        )
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (skipSearchRef.current) {
        skipSearchRef.current = false
        return
      }
      void runSearch(query)
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [query, runSearch])

  const handleSelect = (result: AddressSearchResult) => {
    requestIdRef.current += 1
    skipSearchRef.current = true
    setQuery(result.label)
    setResults([])
    setIsOpen(false)
    setError(null)
    setIsLoading(false)
    onSelect(result)
  }

  return (
    <section className="space-y-2" aria-label="Recherche d'adresse">
      <label htmlFor="address-search" className="sr-only">
        Rechercher une adresse ou un lieu
      </label>
      <div className="relative">
        <input
          id="address-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && !skipSearchRef.current) {
              setIsOpen(true)
            }
          }}
          placeholder="Rechercher une adresse ou un lieu"
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-secondary focus:border-accent-horizon focus:outline-none disabled:opacity-50"
        />
        {isLoading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
            …
          </span>
        )}
        {isOpen && results.length > 0 && (
          <ul
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface shadow-lg"
            role="listbox"
          >
            {results.map((result) => {
              const subtitle = formatSubtitle(result)
              return (
                <li key={result.id} role="option">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-surface-secondary"
                    onClick={() => handleSelect(result)}
                  >
                    <span className="block font-medium text-text">
                      {result.label}
                    </span>
                    {subtitle && (
                      <span className="mt-0.5 block text-xs text-text-secondary">
                        {subtitle}
                        {result.score !== null &&
                          ` · ${Math.round(result.score * 100)} %`}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {error && (
        <WarningBanner message={error} onDismiss={() => setError(null)} />
      )}
      {!error &&
        query.trim().length >= MIN_CHARS &&
        !isLoading &&
        !isOpen &&
        results.length === 0 && (
          <p className="text-xs text-text-secondary">Aucun résultat.</p>
        )}
    </section>
  )
}
