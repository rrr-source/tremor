import { useTranslation } from '../i18n/context.jsx'
import { useRelativeTime } from '../hooks/useRelativeTime.js'
import { magColor, formatMag } from '../lib/magnitude.js'
import { EnergyBar } from './EnergyBar.jsx'

export function QuakeDetail({ quake, distanceKm }) {
  const { lang, t, plural } = useTranslation()
  const relTime = useRelativeTime(quake?.time ?? null, lang)

  if (!quake) {
    return (
      <div className="quake-detail quake-detail--empty">
        <p className="quake-detail-placeholder">{t('detail.placeholder')}</p>
      </div>
    )
  }

  const color = magColor(quake.mag)

  const absTime = new Date(quake.time).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day:    'numeric',
    month:  'long',
    hour:   '2-digit',
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
        <p className="detail-magtype mono">{t('detail.type_label', { type: quake.magType })}</p>
      )}

      {/* Location, time, depth */}
      <div className="detail-section">
        <p className="detail-place">{quake.place}</p>
        <p className="detail-time mono">{absTime} · {relTime}</p>
        <p className="detail-depth mono">
          {quake.depth != null
            ? t('detail.depth_label', { n: Math.round(quake.depth) })
            : '—'}
        </p>
        {distanceKm != null && (
          <p className="detail-distance mono">
            {t('detail.distance', { n: distanceKm.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US') })}
          </p>
        )}
      </div>

      {/* Felt count — omit if null or 0 */}
      {quake.felt > 0 && (
        <p className="detail-felt mono">{plural('detail.felt', quake.felt)}</p>
      )}

      {/* Warning badges */}
      {(quake.tsunami === 1 || quake.alert) && (
        <div className="detail-badges">
          {quake.tsunami === 1 && (
            <span className="badge badge--tsunami">{t('detail.tsunami')}</span>
          )}
          {quake.alert && (
            <span
              className="badge"
              style={{
                color:       `var(--alert-${quake.alert})`,
                borderColor: `var(--alert-${quake.alert})`,
                background:  `color-mix(in srgb, var(--alert-${quake.alert}) 12%, transparent)`,
              }}
            >
              {t(`detail.alert.${quake.alert}`) || quake.alert}
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
        {t('detail.usgs_link')}
      </a>
    </div>
  )
}
