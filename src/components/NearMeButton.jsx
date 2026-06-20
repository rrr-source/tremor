import { useEffect } from 'react'
import { useTranslation } from '../i18n/context.jsx'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { haversine } from '../lib/geo.js'

export function NearMeButton({ quakes, onSelect, onNearest }) {
  const { coords, loading, error, request } = useGeolocation()
  const { t } = useTranslation()

  useEffect(() => {
    if (!coords || quakes.length === 0) return
    let nearest = null
    let minDist = Infinity
    for (const q of quakes) {
      const d = haversine(coords.lat, coords.lon, q.lat, q.lon)
      if (d < minDist) { minDist = d; nearest = q }
    }
    if (nearest) {
      onSelect(nearest.id)
      onNearest(nearest.id, Math.round(minDist))
    }
  }, [coords]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="near-me">
      <button
        className="near-me-btn"
        onClick={request}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? t('nearme.loading') : t('nearme.button')}
      </button>
      {error && (
        <p className="near-me-error">
          {error === 'denied'
            ? t('nearme.error_denied')
            : t('nearme.error_unavailable')}
        </p>
      )}
    </div>
  )
}
