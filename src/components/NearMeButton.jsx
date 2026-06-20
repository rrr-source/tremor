import { useEffect } from 'react'
import { useTranslation } from '../i18n/context.jsx'
import { haversine } from '../lib/geo.js'
import { formatCoords } from '../lib/countryDetect.js'

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 4.55 5.4 10.74 6.44 11.9a.75.75 0 0 0 1.12 0C13.6 19.74 19 13.55 19 9c0-3.87-3.13-7-7-7Z"
        fill="var(--accent)"
      />
      {/* Inner circle fill matches button background (bg-elev) to create the hole */}
      <circle cx="12" cy="9" r="2.6" fill="var(--bg-elev)" />
    </svg>
  )
}

export function NearMeButton({
  quakes, onSelect, onNearest,
  coords, geoLoading, geoError, geoRequest,
  countryName,
}) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!coords || quakes.length === 0) return
    let nearest  = null
    let minDist  = Infinity
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
        onClick={geoRequest}
        disabled={geoLoading}
        aria-busy={geoLoading}
      >
        {geoLoading
          ? t('nearme.loading')
          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><PinIcon />{t('nearme.button')}</span>
        }
      </button>

      {coords && (
        <div className="near-me-info">
          <span className="near-me-location-label">
            <span className="near-me-location-icon" aria-hidden="true">◉</span>
            {t('nearme.location_label')}
          </span>
          <span className="near-me-coords mono">{formatCoords(coords.lat, coords.lon)}</span>
          {countryName && <span className="near-me-country">{countryName}</span>}
        </div>
      )}

      {geoError && (
        <p className="near-me-error">
          {geoError === 'denied'
            ? t('nearme.error_denied')
            : t('nearme.error_unavailable')}
        </p>
      )}
    </div>
  )
}
