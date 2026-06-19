import { useEffect } from 'react'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { haversine } from '../lib/geo.js'

const ERROR_MESSAGES = {
  denied: 'Не удалось получить геопозицию. Разрешите доступ в браузере и попробуйте снова.',
  unavailable: 'Геопозиция недоступна на этом устройстве.',
}

export function NearMeButton({ quakes, onSelect, onNearest }) {
  const { coords, loading, error, request } = useGeolocation()

  // Runs only when coords change (one-shot per request). quakes read from
  // closure at effect time — always current because coords only change after
  // a fresh getCurrentPosition call, by which point quakes are loaded.
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
        {loading ? 'Определяем геопозицию…' : '📍 Ближайший ко мне'}
      </button>
      {error && (
        <p className="near-me-error">
          {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unavailable}
        </p>
      )}
    </div>
  )
}
