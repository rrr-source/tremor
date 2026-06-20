import { useTranslation } from '../i18n/context.jsx'
import { magColor, tonsTNT } from '../lib/magnitude.js'

const HIROSHIMA_TONS = 15_000  // 15 kilotons TNT

export function EnergyBar({ mag }) {
  const { lang, t, plural } = useTranslation()

  if (mag == null) return null

  const pct   = Math.min(100, Math.max(0, (mag - 2) / 7 * 100))
  const color = magColor(mag)

  const locale = lang === 'ru' ? 'ru-RU' : 'en-US'
  function fmtNum(n, sigFigs = 3) {
    return new Intl.NumberFormat(locale, { maximumSignificantDigits: sigFigs }).format(n)
  }

  const tons = tonsTNT(mag)
  let comparison
  if (tons < 1) {
    comparison = t('energy.kg_tnt', { n: fmtNum(Math.round(tons * 1000)) })
  } else if (tons < HIROSHIMA_TONS) {
    comparison = t('energy.t_tnt', { n: fmtNum(tons) })
  } else {
    const bombs  = tons / HIROSHIMA_TONS
    const bombsR = parseFloat(bombs.toPrecision(2))
    comparison   = plural('energy.hiroshima', bombsR, { n: fmtNum(bombsR) })
  }

  return (
    <div className="energy-bar">
      <div className="energy-bar-wrap">
        <div className="energy-bar-track">
          <div className="energy-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="energy-bar-thumb" style={{ left: `${pct}%`, background: color }} />
      </div>
      <div className="energy-bar-ends mono">
        <span>M2</span>
        <span>M9</span>
      </div>
      <p className="energy-bar-comparison mono">{comparison}</p>
    </div>
  )
}
