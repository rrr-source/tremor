import { useRef, useState, useEffect, useMemo } from 'react'
import { geoPath, geoGraticule10 } from 'd3-geo'
import { makeProjection } from '../lib/geo.js'
import land from '../data/land-110m.geo.json'

export function WorldMap() {
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

  const { sphereD, graticuleD, landD } = useMemo(() => {
    const { width, height } = size
    if (!width || !height) return {}
    const projection = makeProjection(width, height)
    const pathGen = geoPath(projection)
    return {
      sphereD:    pathGen({ type: 'Sphere' }),
      graticuleD: pathGen(geoGraticule10()),
      landD:      pathGen(land),
    }
  }, [size])

  return (
    <div ref={containerRef} className="world-map">
      {sphereD && (
        <svg
          width={size.width}
          height={size.height}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <path d={sphereD}    fill="var(--bg)"       stroke="var(--bg-line)"   strokeWidth={0.5} />
          <path d={graticuleD} fill="none"            stroke="var(--graticule)" strokeWidth={0.3} />
          <path d={landD}      fill="var(--land)"     stroke="var(--land-edge)" strokeWidth={0.5} />
        </svg>
      )}
    </div>
  )
}
