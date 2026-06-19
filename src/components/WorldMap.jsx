import { useRef, useState, useEffect, useMemo } from 'react'
import { geoPath, geoGraticule10, geoDistance } from 'd3-geo'
import { makeProjection, makeGlobeProjection } from '../lib/geo.js'
import { magColor, magRadius } from '../lib/magnitude.js'
import { Legend } from './Legend.jsx'
import land from '../data/land-110m.geo.json'

const ONE_HOUR = 3_600_000
const HALF_PI  = Math.PI / 2

export function WorldMap({ quakes = [], selectedId = null, onSelect, mode = 'flat' }) {
  const containerRef = useRef(null)
  const [size, setSize]       = useState({ width: 0, height: 0 })
  const [rotate, setRotate]   = useState([0, -20])
  const [dragging, setDragging] = useState(false)

  // Drag state lives in refs so pointer-move handlers never see stale closures.
  const dragRef            = useRef(null)   // { x, y, pointerId, el }
  const rotateAtDragStart  = useRef([0, -20])
  const projRef            = useRef(null)
  const didDrag            = useRef(false)  // true once pointer moved > threshold

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

  // Recompute projection + all paths whenever size, mode, or rotation changes.
  const { sphereD, graticuleD, landD, projection } = useMemo(() => {
    const { width, height } = size
    if (!width || !height) return {}
    const proj = mode === 'globe'
      ? makeGlobeProjection(width, height, rotate)
      : makeProjection(width, height)
    projRef.current = proj
    const pathGen = geoPath(proj)
    return {
      projection: proj,
      sphereD:    pathGen({ type: 'Sphere' }),
      graticuleD: pathGen(geoGraticule10()),
      landD:      pathGen(land),
    }
  }, [size, mode, rotate])

  // Ascending mag so larger quakes render on top.
  const sortedQuakes = useMemo(
    () => [...quakes].sort((a, b) => (a.mag ?? 0) - (b.mag ?? 0)),
    [quakes]
  )

  const now = Date.now()

  // Geographic point facing the viewer = inverse of the projection rotation.
  const globeCenter = [-rotate[0], -rotate[1]]

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function onPointerDown(e) {
    if (mode !== 'globe') return
    didDrag.current = false
    dragRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, el: e.currentTarget }
    rotateAtDragStart.current = [...rotate]
    setDragging(true)
  }

  function onPointerMove(e) {
    if (mode !== 'globe' || !dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    // Lazily capture the pointer once we're sure it's a drag, not a tap.
    if (!didDrag.current) {
      if (Math.hypot(dx, dy) < 4) return
      didDrag.current = true
      dragRef.current.el.setPointerCapture(dragRef.current.pointerId)
    }
    const k = 75 / (projRef.current?.scale() ?? 200)
    setRotate([
      rotateAtDragStart.current[0] + dx * k,
      Math.max(-89, Math.min(89, rotateAtDragStart.current[1] - dy * k)),
    ])
  }

  function onPointerUp() {
    dragRef.current = null
    setDragging(false)
    // didDrag.current intentionally stays true until next pointerdown so that
    // the click event fired after this pointerup is ignored by marker handlers.
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isGlobe = mode === 'globe'

  return (
    <div
      ref={containerRef}
      className={`world-map${isGlobe ? ` world-map--globe${dragging ? ' world-map--dragging' : ''}` : ''}`}
    >
      {sphereD && (
        <svg
          width={size.width}
          height={size.height}
          style={{ display: 'block' }}
          role="region"
          aria-label="Карта землетрясений"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {isGlobe && (
            <defs>
              {/* Subtle radial gradient gives the sphere a lit-sphere feel */}
              <radialGradient id="globe-sphere-grad" cx="38%" cy="35%" r="65%">
                <stop offset="0%"   stopColor="var(--land)" />
                <stop offset="100%" stopColor="var(--bg)"   />
              </radialGradient>
            </defs>
          )}

          {/* Sphere / ocean background */}
          <path
            d={sphereD}
            aria-hidden="true"
            fill={isGlobe ? 'url(#globe-sphere-grad)' : 'var(--bg)'}
            stroke={isGlobe ? 'var(--land-edge)' : 'var(--bg-line)'}
            strokeWidth={isGlobe ? 1 : 0.5}
          />
          <path d={graticuleD} aria-hidden="true" fill="none"        stroke="var(--graticule)" strokeWidth={0.3} />
          <path d={landD}      aria-hidden="true" fill="var(--land)" stroke="var(--land-edge)" strokeWidth={0.5} />

          <g className="quake-layer">
            {sortedQuakes.map(q => {
              // Back-face culling: skip quakes beyond the visible hemisphere.
              if (isGlobe && geoDistance([q.lon, q.lat], globeCenter) >= HALF_PI) return null

              const pos = projection([q.lon, q.lat])
              if (!pos) return null
              const [x, y] = pos
              const r        = magRadius(q.mag)
              const color    = magColor(q.mag)
              const isSelected = q.id === selectedId
              const isFresh    = (now - q.time) < ONE_HOUR

              return (
                <g
                  key={q.id}
                  transform={`translate(${x},${y})`}
                  className={`quake-marker${isSelected ? ' quake-selected' : ''}${isFresh ? ' quake-fresh' : ''}`}
                  onClick={() => {
                    // Suppress the click that immediately follows a drag release.
                    if (didDrag.current) { didDrag.current = false; return }
                    onSelect?.(q.id)
                  }}
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
                    <circle r={r + 5} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.7} />
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
