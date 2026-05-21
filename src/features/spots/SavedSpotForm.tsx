import { useEffect, useState } from 'react'
import { buildDefaultSpotName } from './spotStorage'

type SavedSpotFormProps = {
  defaultName: string
  onSave: (name: string) => void
  onCancel: () => void
  isSaving?: boolean
}

export function SavedSpotForm({
  defaultName,
  onSave,
  onCancel,
  isSaving = false,
}: SavedSpotFormProps) {
  const [name, setName] = useState(defaultName)

  useEffect(() => {
    setName(defaultName)
  }, [defaultName])

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(name)
      }}
    >
      <div>
        <label
          htmlFor="saved-spot-name"
          className="mb-1 block text-xs font-medium text-text-secondary"
        >
          Nom du spot
        </label>
        <input
          id="saved-spot-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={buildDefaultSpotName({ lat: 0, lon: 0 })}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none ring-accent-sun focus:ring-2"
          autoFocus
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-accent-sun px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
