import { useTranslation } from '../i18n/context.jsx'
import { magColor, formatMag } from '../lib/magnitude.js'

const TOP_N = 12

function relativeShort(ts, t) {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60)    return t('time.short_s', { n: secs })
  if (secs < 3600)  return t('time.short_m', { n: Math.floor(secs / 60) })
  if (secs < 86400) return t('time.short_h', { n: Math.floor(secs / 3600) })
  return t('time.short_d', { n: Math.floor(secs / 86400) })
}

export function QuakeList({ quakes, selectedId, onSelect }) {
  const { t } = useTranslation()

  const top = [...quakes]
    .sort((a, b) => (b.mag ?? 0) - (a.mag ?? 0))
    .slice(0, TOP_N)

  return (
    <section className="qlist">
      <h2 className="qlist-heading mono">{t('list.heading')}</h2>
      {top.length === 0 ? (
        <p className="qlist-empty">{t('list.empty')}</p>
      ) : (
        <ul className="qlist-items">
          {top.map(q => {
            const color      = magColor(q.mag)
            const isSelected = q.id === selectedId
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className={`qlist-row${isSelected ? ' qlist-row--selected' : ''}`}
                  onClick={() => onSelect(q.id)}
                >
                  <span
                    className="qlist-mag mono"
                    style={{
                      color,
                      background: `color-mix(in srgb, ${color} 14%, transparent)`,
                    }}
                  >
                    {formatMag(q.mag)}
                  </span>
                  <span className="qlist-place">{q.place ?? '—'}</span>
                  <span className="qlist-time mono">{relativeShort(q.time, t)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
