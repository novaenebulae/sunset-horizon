import { useCallback, useRef, useState } from 'react'
import { StatusBanner } from '@/components/StatusBanner'
import { WarningBanner } from '@/components/WarningBanner'
import { isLocalStorageAvailable as isSettingsStorageAvailable } from '@/features/settings/calculationSettingsStorage'
import { isLocalStorageAvailable as isSpotsStorageAvailable } from '@/features/spots/spotStorage'
import {
  buildExportPayload,
  downloadExportFile,
} from './exportData'
import { applyImportData, buildImportSummary } from './importData'
import {
  ImportExportError,
  type ImportMode,
  type ImportSummary,
  type SunsetHorizonExport,
} from './exportTypes'
import { parseExportJson } from './importExportValidation'

const CACHE_NOTE =
  'Le cache terrain (IndexedDB) n\'est pas exporté. Il sera reconstruit automatiquement lors des prochains calculs.'

function formatSummary(summary: ImportSummary): string {
  const lines = [
    `${summary.importSpots} spot(s) dans le fichier · ${summary.localSpots} en local`,
    `${summary.importHistory} entrée(s) d'historique · ${summary.localHistory} en local`,
  ]

  if (summary.mode === 'merge') {
    lines.push(
      `Fusion : +${summary.spotsAdded} spot(s), ${summary.spotsUpdated} mis à jour, ${summary.spotsUnchanged} inchangé(s)`,
      `Historique : +${summary.historyAdded}, ${summary.historyUpdated} mis à jour`,
    )
    if (summary.historyOrphansSkipped > 0) {
      lines.push(
        `${summary.historyOrphansSkipped} entrée(s) ignorée(s) (spot manquant).`,
      )
    }
    lines.push('Les réglages locaux seront conservés.')
  } else {
    lines.push(
      'Remplacement : toutes les données locales seront remplacées par le fichier.',
      'Les réglages seront également remplacés.',
    )
  }

  return lines.join('\n')
}

export function ImportExportPanel() {
  const [sectionOpen, setSectionOpen] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<SunsetHorizonExport | null>(
    null,
  )
  const [previewSummary, setPreviewSummary] = useState<ImportSummary | null>(
    null,
  )
  const [previewMode, setPreviewMode] = useState<ImportMode>('merge')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const storageAvailable =
    isSpotsStorageAvailable() && isSettingsStorageAvailable()

  const handleExport = useCallback(() => {
    setImportError(null)
    setExportStatus(null)
    try {
      const payload = buildExportPayload()
      downloadExportFile(payload)
      setExportStatus(
        `Export téléchargé (${payload.data.spots.length} spot(s), ${payload.data.calculationHistory.length} entrée(s)).`,
      )
    } catch (err) {
      setExportStatus(null)
      setImportError(
        err instanceof ImportExportError
          ? err.message
          : 'Impossible d\'exporter les données.',
      )
    }
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      setImportError(null)
      setExportStatus(null)
      setPendingImport(null)
      setPreviewSummary(null)

      if (!file) return

      try {
        const text = await file.text()
        const exported = parseExportJson(text)
        setPendingImport(exported)
        setPreviewMode('merge')
        setPreviewSummary(buildImportSummary(exported, 'merge'))
      } catch (err) {
        setImportError(
          err instanceof ImportExportError
            ? err.message
            : 'Impossible de lire ce fichier.',
        )
      }
    },
    [],
  )

  const updatePreviewMode = useCallback(
    (mode: ImportMode) => {
      if (!pendingImport) return
      setPreviewMode(mode)
      setPreviewSummary(buildImportSummary(pendingImport, mode))
    },
    [pendingImport],
  )

  const handleCancelPreview = useCallback(() => {
    setPendingImport(null)
    setPreviewSummary(null)
    setImportError(null)
  }, [])

  const handleConfirmImport = useCallback(() => {
    if (!pendingImport || !previewSummary) return

    if (previewMode === 'replace') {
      const confirmed = window.confirm(
        'Remplacer toutes les données locales (spots, historique et réglages) par celles du fichier ? Cette action est irréversible.',
      )
      if (!confirmed) return
    }

    setImportError(null)
    try {
      applyImportData(pendingImport, previewMode)
      setExportStatus(
        previewMode === 'merge'
          ? 'Données fusionnées avec succès.'
          : 'Données remplacées avec succès.',
      )
      setPendingImport(null)
      setPreviewSummary(null)
    } catch (err) {
      setImportError(
        err instanceof ImportExportError
          ? err.message
          : 'Impossible d\'importer les données.',
      )
    }
  }, [pendingImport, previewSummary, previewMode])

  return (
    <details
      className="rounded-xl border border-border bg-surface"
      open={sectionOpen}
      onToggle={(event) => setSectionOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Export / import des données
        </h2>
      </summary>

      <div className="space-y-4 border-t border-border px-6 pb-6 pt-4">
        {!storageAvailable && (
          <WarningBanner message="Le stockage local est indisponible. Export et import impossibles." />
        )}

        <p className="text-xs text-text-secondary">{CACHE_NOTE}</p>

        {importError && (
          <WarningBanner message={importError} onDismiss={() => setImportError(null)} />
        )}

        {exportStatus && (
          <StatusBanner
            message={exportStatus}
            onDismiss={() => setExportStatus(null)}
          />
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={!storageAvailable}
            onClick={handleExport}
            className="rounded-lg bg-accent-horizon px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter mes données
          </button>
          <button
            type="button"
            disabled={!storageAvailable}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            Importer un fichier JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(event) => void handleFileChange(event)}
          />
        </div>

        {pendingImport && previewSummary && (
          <div className="space-y-3 rounded-lg border border-border bg-bg/30 p-4">
            <p className="text-sm font-medium text-text-primary">
              Aperçu avant import
            </p>
            <pre className="whitespace-pre-wrap font-sans text-xs text-text-secondary">
              {formatSummary(previewSummary)}
            </pre>

            <fieldset>
              <legend className="mb-2 text-xs font-medium text-text-primary">
                Mode d&apos;import
              </legend>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="radio"
                    name="import-mode"
                    checked={previewMode === 'merge'}
                    onChange={() => updatePreviewMode('merge')}
                  />
                  Fusionner avec les données locales
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="radio"
                    name="import-mode"
                    checked={previewMode === 'replace'}
                    onChange={() => updatePreviewMode('replace')}
                  />
                  Remplacer toutes les données
                </label>
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleConfirmImport}
                className="rounded-lg bg-accent-horizon px-4 py-2 text-sm font-medium text-background"
              >
                Confirmer l&apos;import
              </button>
              <button
                type="button"
                onClick={handleCancelPreview}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-primary hover:bg-bg"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
