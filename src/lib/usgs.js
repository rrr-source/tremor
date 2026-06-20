const BASE   = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary'
const FDSNWS = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

export function feedUrl(filter, period) {
  return `${BASE}/${filter}_${period}.geojson`
}

function normalize(feature) {
  const p = feature.properties
  const [lon, lat, depth] = feature.geometry.coordinates
  return {
    id:      feature.id,
    mag:     p.mag     ?? null,
    magType: p.magType ?? null,
    place:   p.place   ?? null,
    time:    p.time,
    updated: p.updated,
    lon,
    lat,
    depth:   depth  ?? null,
    felt:    p.felt ?? null,
    cdi:     p.cdi  ?? null,
    mmi:     p.mmi  ?? null,
    alert:   p.alert ?? null,
    tsunami: p.tsunami,
    sig:     p.sig,
    url:     p.url,
    title:   p.title,
  }
}

// Fetch a single event by its USGS id. Returns the normalized quake or null (not found).
// AbortError is NOT caught here — callers distinguish abort from "not found" by checking
// err.name === 'AbortError' in their .catch handlers.
export async function fetchQuakeById(id, signal) {
  const url = `${FDSNWS}?eventid=${encodeURIComponent(id)}&format=geojson`
  const res = await fetch(url, { signal })  // AbortError propagates
  if (!res.ok) return null  // 404 / 400 = not found; treat any non-2xx as missing
  const json = await res.json()
  // The fdsnws endpoint returns a FeatureCollection; guard against Feature shape too.
  const feature = json.type === 'FeatureCollection'
    ? json.features?.[0]
    : json.type === 'Feature' ? json : null
  return feature ? normalize(feature) : null
}

export async function fetchQuakes(filter, period, { signal } = {}) {
  const res = await fetch(feedUrl(filter, period), { signal })
  if (!res.ok) {
    throw new Error(`USGS feed returned ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  return json.features
    .map(normalize)
    .sort((a, b) => b.time - a.time)
}
