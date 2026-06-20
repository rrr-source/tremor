import { geoNaturalEarth1, geoOrthographic } from 'd3-geo'

export function makeProjection(width, height) {
  const proj = geoNaturalEarth1().fitSize([width, height], { type: 'Sphere' })
  // fitSize centers the bounding box, but force ty = height/2 to guarantee the
  // equator lands at the vertical midpoint regardless of d3 internal rounding.
  const [tx] = proj.translate()
  return proj.translate([tx, height / 2])
}

export function makeGlobeProjection(width, height, rotate) {
  return geoOrthographic()
    .fitSize([width, height], { type: 'Sphere' })
    .rotate(rotate)
    .clipAngle(90)
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = deg => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}
