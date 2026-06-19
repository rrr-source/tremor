const BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary'

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

export async function fetchQuakes(filter, period) {
  const res = await fetch(feedUrl(filter, period))
  if (!res.ok) {
    throw new Error(`USGS feed returned ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  return json.features
    .map(normalize)
    .sort((a, b) => b.time - a.time)
}
