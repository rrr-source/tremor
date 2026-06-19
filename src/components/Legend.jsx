import { magColor, magRadius } from '../lib/magnitude.js'

const TIERS = [
  { label: 'M2',  mag: 2.0 },
  { label: 'M4',  mag: 4.0 },
  { label: 'M6',  mag: 6.0 },
  { label: 'M7+', mag: 7.5 },
]

const DOT_BOX = 34 // px — contains max radius of ~15

export function Legend() {
  return (
    <div className="map-legend" aria-label="Шкала магнитуд">
      {TIERS.map(({ label, mag }) => (
        <div key={label} className="legend-item">
          <svg width={DOT_BOX} height={DOT_BOX} aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle
              cx={DOT_BOX / 2}
              cy={DOT_BOX / 2}
              r={Math.max(magRadius(mag), 2)}
              fill={magColor(mag)}
              fillOpacity={0.75}
            />
          </svg>
          <span className="legend-label mono">{label}</span>
        </div>
      ))}
    </div>
  )
}
