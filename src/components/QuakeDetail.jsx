import { useRelativeTime } from '../hooks/useRelativeTime.js'
import { magColor, formatMag, formatDepth } from '../lib/magnitude.js'
import { EnergyBar } from './EnergyBar.jsx'

const ALERT_LABELS = {
  green:  'низкая угроза',
  yellow: 'средняя угроза',
  orange: 'серьёзная угроза',
  red:    'критическая угроза',
}

function feltPhrase(n) {
  const abs = Math.abs(Math.round(n))
  const last2 = abs % 100
  const last1 = abs % 10
  if (last2 >= 11 && last2 <= 19) return `${n} человек ощутили`
  if (last1 === 1)                 return `${n} человек ощутил`
  if (last1 >= 2 && last1 <= 4)   return `${n} человека ощутили`
  return `${n} человек ощутили`
}

export function QuakeDetail({ quake, distanceKm }) {
  const relTime = useRelativeTime(quake?.time ?? null)

  if (!quake) {
    return (
      <div className="quake-detail quake-detail--empty">
        <p className="quake-detail-placeholder">Выберите толчок на карте</p>
      </div>
    )
  }

  const color = magColor(quake.mag)

  const absTime = new Date(quake.time).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="quake-detail">
      {/* Signature magnitude — largest element on screen */}
      <div className="detail-mag-block">
        <span className="detail-mag-num mono" style={{ color }}>
          {formatMag(quake.mag)}
        </span>
        <div className="detail-mag-tick" />
      </div>

      {quake.magType && (
        <p className="detail-magtype mono">тип: {quake.magType}</p>
      )}

      {/* Location, time, depth */}
      <div className="detail-section">
        <p className="detail-place">{quake.place}</p>
        <p className="detail-time mono">{absTime} · {relTime}</p>
        <p className="detail-depth mono">Глубина: {formatDepth(quake.depth)}</p>
        {distanceKm != null && (
          <p className="detail-distance mono">в {distanceKm.toLocaleString('ru-RU')} км от вас</p>
        )}
      </div>

      {/* Felt count — omit if null or 0 */}
      {quake.felt > 0 && (
        <p className="detail-felt mono">{feltPhrase(quake.felt)}</p>
      )}

      {/* Warning badges */}
      {(quake.tsunami === 1 || quake.alert) && (
        <div className="detail-badges">
          {quake.tsunami === 1 && (
            <span className="badge badge--tsunami">ЦУНАМИ</span>
          )}
          {quake.alert && (
            <span
              className="badge"
              style={{
                color: `var(--alert-${quake.alert})`,
                borderColor: `var(--alert-${quake.alert})`,
                background: `color-mix(in srgb, var(--alert-${quake.alert}) 12%, transparent)`,
              }}
            >
              {ALERT_LABELS[quake.alert] ?? quake.alert}
            </span>
          )}
        </div>
      )}

      <EnergyBar mag={quake.mag} />

      <a
        href={quake.url}
        target="_blank"
        rel="noopener noreferrer"
        className="detail-link"
      >
        Подробнее на USGS →
      </a>
    </div>
  )
}
