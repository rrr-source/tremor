import { useRef, useState, useEffect, useMemo } from 'react'
import { geoPath, geoGraticule10 } from 'd3-geo'
import { makeProjection } from '../lib/geo.js'
import { magColor, magRadius } from '../lib/magnitude.js'
import { Legend } from './Legend.jsx'
import land from '../data/land-110m.geo.json'

const ONE_HOUR = 3_600_000

export function WorldMap({ quakes = [], selectedId = null, onSelect }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { sphereD, graticuleD, landD, projection } = useMemo(() => {
    const { width, height } = size
    if (!width || !height) return {}
    const proj = makeProjection(width, height)
    const pathGen = geoPath(proj)
    return {
      projection: proj,
      sphereD:    pathGen({ type: 'Sphere' }),
      graticuleD: pathGen(geoGraticule10()),
      landD:      pathGen(land),
    }
  }, [size])

  // Ascending mag so larger quakes paint on top.
  const sortedQuakes = useMemo(
    () => [...quakes].sort((a, b) => (a.mag ?? 0) - (b.mag ?? 0)),
    [quakes]
  )

  const now = Date.now()

  return (
    <div ref={containerRef} className="world-map">
      {sphereD && (
        <svg
          width={size.width}
          height={size.height}
          style={{ display: 'block' }}
          role="region"
          aria-label="Карта землетрясений"
        >
          <path d={sphereD}    aria-hidden="true" fill="var(--bg)"       stroke="var(--bg-line)"   strokeWidth={0.5} />
          <path d={graticuleD} aria-hidden="true" fill="none"            stroke="var(--graticule)" strokeWidth={0.3} />
          <path d={landD}      aria-hidden="true" fill="var(--land)"     stroke="var(--land-edge)" strokeWidth={0.5} />

          <g className="quake-layer">
            {sortedQuakes.map(q => {
              const pos = projection([q.lon, q.lat])
              if (!pos) return null
              const [x, y] = pos
              const r = magRadius(q.mag)
              const color = magColor(q.mag)
              const isSelected = q.id === selectedId
              const isFresh = (now - q.time) < ONE_HOUR

              return (
                <g
                  key={q.id}
                  transform={`translate(${x},${y})`}
                  className={`quake-marker${isSelected ? ' quake-selected' : ''}${isFresh ? ' quake-fresh' : ''}`}
                  onClick={() => onSelect?.(q.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect?.(q.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={q.title}
                  aria-pressed={isSelected}
                >
                  <title>{q.title}</title>
                  {isSelected && (
                    <circle
                      r={r + 5}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.7}
                    />
                  )}
                  <circle
                    className="quake-dot"
                    r={r}
                    fill={color}
                    fillOpacity={0.75}
                    stroke={color}
                    strokeWidth={0.8}
                  />
                </g>
              )
            })}
          </g>
        </svg>
      )}
      <Legend />
    </div>
  )
}
