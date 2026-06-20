import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { geoPath, geoGraticule10, geoDistance } from 'd3-geo'
import { makeProjection, makeGlobeProjection } from '../lib/geo.js'
import { magColor, magRadius } from '../lib/magnitude.js'
import { useTranslation } from '../i18n/context.jsx'
import { Legend } from './Legend.jsx'
import land from '../data/land-110m.geo.json'

const HALF_PI = Math.PI / 2

// Show the perf HUD in dev, or in any build when ?debug=1 is in the URL.
const PERF_HUD = import.meta.env.DEV || location.search.includes('debug=1')

export function WorldMap({ quakes = [], selectedId = null, onSelect, mode = 'flat' }) {
  const containerRef = useRef(null)
  const [size, setSize]       = useState({ width: 0, height: 0 })
  const [rotate, setRotate]   = useState([0, -20])
  const [dragging, setDragging] = useState(false)
  const [hasRotated, setHasRotated] = useState(false)
  const [hintOut, setHintOut] = useState(false)

  const { t } = useTranslation()

  // Drag state lives in refs so pointer-move handlers never see stale closures.
  const dragRef            = useRef(null)
  const rotateAtDragStart  = useRef([0, -20])
  const projRef            = useRef(null)
  const didDrag            = useRef(false)

  const rotateRef       = useRef([0, -20])
  const rafRef          = useRef(null)
  const lastAnimatedFor = useRef(null)

  // Dev perf HUD — refs only, no state, so measuring doesn't add render overhead.
  const perfFpsRef   = useRef(null)
  const perfLastTime = useRef(null)
  const perfRollMs   = useRef([])
  const perfCountRef = useRef(null)

  const canvasRef = useRef(null)

  function applyRotate(r) {
    rotateRef.current = r
    setRotate(r)
  }

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

  // Remove hint element from DOM after its fade-out completes.
  useEffect(() => {
    if (!hasRotated) return
    const t = setTimeout(() => setHintOut(true), 450)
    return () => clearTimeout(t)
  }, [hasRotated])

  // Auto-rotate globe to face the selected quake.
  useEffect(() => {
    if (mode !== 'globe' || !selectedId) {
      lastAnimatedFor.current = null
      return
    }

    const key = `${selectedId}:${mode}`
    if (lastAnimatedFor.current === key) return

    const q = quakes.find(q => q.id === selectedId)
    if (!q) return

    lastAnimatedFor.current = key

    const toLon = -q.lon
    const toLat = Math.max(-89, Math.min(89, -q.lat))
    const [fromLon, fromLat] = rotateRef.current

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyRotate([toLon, toLat])
      return
    }

    const DURATION = 600
    const startTime = performance.now()

    function tick(now) {
      const raw = Math.min(1, (now - startTime) / DURATION)
      const tEase = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2

      let dLon = toLon - fromLon
      if (dLon >  180) dLon -= 360
      if (dLon < -180) dLon += 360

      applyRotate([fromLon + dLon * tEase, fromLat + (toLat - fromLat) * tEase])

      rafRef.current = raw < 1 ? requestAnimationFrame(tick) : null
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [selectedId, mode, quakes]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const sortedQuakes = useMemo(
    () => [...quakes].sort((a, b) => (a.mag ?? 0) - (b.mag ?? 0)),
    [quakes]
  )

  // ── Canvas marker draw ─────────────────────────────────────────────────────
  // useLayoutEffect so canvas updates in the same frame as the SVG base layer —
  // avoids a one-frame lag where land moves but dots don't.

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !projection || !size.width || !size.height) return

    const dpr = window.devicePixelRatio || 1
    const w   = size.width
    const h   = size.height
    const cw  = Math.round(w * dpr)
    const ch  = Math.round(h * dpr)

    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width  = cw
      canvas.height = ch
    }

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, cw, ch)
    ctx.save()
    ctx.scale(dpr, dpr)

    const TWO_PI   = Math.PI * 2
    const isGlobe_ = mode === 'globe'
    const center_  = [-rotate[0], -rotate[1]]
    let   rendered = 0

    // Pass 1: all non-selected quakes, low→high mag so larger dots paint on top.
    for (const q of sortedQuakes) {
      if (q.id === selectedId) continue
      if (isGlobe_ && geoDistance([q.lon, q.lat], center_) >= HALF_PI) continue
      const pos = projection([q.lon, q.lat])
      if (!pos) continue
      const [x, y] = pos
      const r     = magRadius(q.mag)
      const color = magColor(q.mag)

      ctx.beginPath()
      ctx.arc(x, y, r, 0, TWO_PI)
      ctx.globalAlpha = 0.75
      ctx.fillStyle = color
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = color
      ctx.lineWidth = 0.8
      ctx.stroke()
      rendered++
    }

    // Pass 2: selected quake drawn on top with its selection ring.
    if (selectedId) {
      const q = sortedQuakes.find(q => q.id === selectedId)
      const isVisible = q && (!isGlobe_ || geoDistance([q.lon, q.lat], center_) < HALF_PI)
      const pos = isVisible ? projection([q.lon, q.lat]) : null
      if (q && pos) {
        const [x, y] = pos
        const r     = magRadius(q.mag)
        const color = magColor(q.mag)

        // Selection ring
        ctx.beginPath()
        ctx.arc(x, y, r + 5, 0, TWO_PI)
        ctx.globalAlpha = 0.7
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Dot
        ctx.beginPath()
        ctx.arc(x, y, r, 0, TWO_PI)
        ctx.globalAlpha = 0.75
        ctx.fillStyle = color
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = color
        ctx.lineWidth = 0.8
        ctx.stroke()
        rendered++
      }
    }

    ctx.restore()

    if (PERF_HUD && perfCountRef.current) {
      perfCountRef.current.textContent = `${rendered} pts`
    }
  }, [sortedQuakes, projection, selectedId, size, mode, rotate]) // eslint-disable-line react-hooks/exhaustive-deps

  const globeCenter = [-rotate[0], -rotate[1]]

  // ── Click handler: nearest-center wins ────────────────────────────────────
  // Finds the visible quake whose projected center is closest to the click
  // point, within each quake's individual hit radius. One handler on the SVG
  // replaces per-marker onClick so two overlapping quakes resolve correctly.

  function handleMapClick(e) {
    if (didDrag.current) { didDrag.current = false; return }
    if (!projRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    let best     = null
    let bestDist = Infinity

    for (const q of quakes) {
      if (mode === 'globe' && geoDistance([q.lon, q.lat], globeCenter) >= HALF_PI) continue
      const pos = projRef.current([q.lon, q.lat])
      if (!pos) continue
      const dist = Math.hypot(cx - pos[0], cy - pos[1])
      const hitR = Math.max(magRadius(q.mag) + 8, 14)
      if (dist <= hitR && dist < bestDist) {
        bestDist = dist
        best = q
      }
    }

    if (best) onSelect?.(best.id)
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function onPointerDown(e) {
    if (mode !== 'globe') return
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    didDrag.current = false
    dragRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, el: e.currentTarget }
    rotateAtDragStart.current = [...rotate]
    setDragging(true)
  }

  function onPointerMove(e) {
    if (mode !== 'globe' || !dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    if (!didDrag.current) {
      if (Math.hypot(dx, dy) < 4) return
      didDrag.current = true
      dragRef.current.el.setPointerCapture(dragRef.current.pointerId)
      if (!hasRotated) setHasRotated(true)
    }
    const k = 75 / (projRef.current?.scale() ?? 200)
    applyRotate([
      rotateAtDragStart.current[0] + dx * k,
      Math.max(-89, Math.min(89, rotateAtDragStart.current[1] - dy * k)),
    ])
    // Direct DOM write — no setState so the measurement doesn't add a render.
    if (PERF_HUD && perfFpsRef.current) {
      const t = performance.now()
      if (perfLastTime.current !== null) {
        const dt = t - perfLastTime.current
        perfRollMs.current.push(dt)
        if (perfRollMs.current.length > 8) perfRollMs.current.shift()
        const avg = perfRollMs.current.reduce((a, b) => a + b, 0) / perfRollMs.current.length
        perfFpsRef.current.textContent = `${avg.toFixed(0)}ms · ${Math.round(1000 / avg)}fps`
      }
      perfLastTime.current = t
    }
  }

  function onPointerUp() {
    dragRef.current = null
    setDragging(false)
    if (PERF_HUD) {
      perfLastTime.current = null
      perfRollMs.current = []
    }
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
          aria-label="Tremor"
          onClick={handleMapClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {isGlobe && (
            <defs>
              <radialGradient id="globe-sphere-grad" cx="38%" cy="35%" r="65%">
                <stop offset="0%"   stopColor="var(--land)" />
                <stop offset="100%" stopColor="var(--bg)"   />
              </radialGradient>
            </defs>
          )}

          <path
            d={sphereD}
            aria-hidden="true"
            fill={isGlobe ? 'url(#globe-sphere-grad)' : 'var(--bg)'}
            stroke={isGlobe ? 'var(--land-edge)' : 'var(--bg-line)'}
            strokeWidth={isGlobe ? 1 : 0.5}
          />
          <path d={graticuleD} aria-hidden="true" fill="none"        stroke="var(--graticule)" strokeWidth={0.3} />
          <path d={landD}      aria-hidden="true" fill="var(--land)" stroke="var(--land-edge)" strokeWidth={0.5} />
        </svg>
      )}
      <canvas
        ref={canvasRef}
        className="quake-canvas"
        style={{ width: size.width || 0, height: size.height || 0 }}
        aria-hidden="true"
      />
      {isGlobe && !hintOut && (
        <div
          className={`globe-hint${hasRotated ? ' globe-hint--out' : ''}`}
          aria-hidden="true"
        >
          <span className="globe-hint-glyph">↻</span>
          <span>{t('globe_hint')}</span>
        </div>
      )}
      <Legend />
      {PERF_HUD && (
        <div className="perf-hud" aria-hidden="true">
          <span className="perf-hud-line mono" ref={perfCountRef}>0 pts</span>
          <span className="perf-hud-line mono" ref={perfFpsRef}>—</span>
        </div>
      )}
    </div>
  )
}
