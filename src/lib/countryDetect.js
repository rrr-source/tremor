import { geoContains } from 'd3-geo'
import countries from '../data/countries-110m.geo.json'

export function detectCountry(lon, lat) {
  const point = [lon, lat]
  for (const f of countries.features) {
    if (geoContains(f, point)) return f
  }
  return null
}

// Returns the country name in the given language using Intl.DisplayNames.
// Falls back to the English name embedded in the GeoJSON.
export function localizedCountryName(feature, lang) {
  if (!feature?.properties) return null
  const { alpha2, name } = feature.properties
  if (!alpha2) return name ?? null
  try {
    const dn = new Intl.DisplayNames([lang, 'en'], { type: 'region' })
    const result = dn.of(alpha2)
    return result && result !== alpha2 ? result : name
  } catch {
    return name ?? null
  }
}

export function formatCoords(lat, lon) {
  const la = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`
  const lo = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`
  return `${la}  ${lo}`
}
