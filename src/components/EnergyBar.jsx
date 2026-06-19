import { magColor, energyComparison } from '../lib/magnitude.js'

export function EnergyBar({ mag }) {
  if (mag == null) return null

  const pct = Math.min(100, Math.max(0, (mag - 2) / 7 * 100))
  const color = magColor(mag)
  const comparison = energyComparison(mag)

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
