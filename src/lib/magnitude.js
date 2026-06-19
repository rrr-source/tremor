// Hex values must stay in sync with --mag-* tokens in tokens.css.
const COLORS = {
  micro:  '#4cc9c0',
  light:  '#f5c451',
  mod:    '#f59e3c',
  strong: '#f4743b',
  major:  '#ef4444',
  great:  '#ff2d55',
}

export function magColor(mag) {
  if (mag == null || mag < 2.5) return COLORS.micro
  if (mag < 4) return COLORS.light
  if (mag < 5) return COLORS.mod
  if (mag < 6) return COLORS.strong
  if (mag < 7) return COLORS.major
  return COLORS.great
}

// 1.5× radius per magnitude step — mirrors energy's 31.6× but stays legible.
export function magRadius(mag) {
  if (mag == null) return 3
  return Math.min(2 * Math.pow(1.5, Math.max(0, mag - 2.5)), 16)
}

// Gutenberg–Richter: E = 10^(1.5·M + 4.8) joules
export function energyJoules(mag) {
  if (mag == null) return null
  return 10 ** (1.5 * mag + 4.8)
}

// 1 ton TNT = 4.184×10⁹ J
export function tonsTNT(mag) {
  if (mag == null) return null
  return energyJoules(mag) / 4.184e9
}

const HIROSHIMA_TONS = 15000  // 15 kilotons

function fmtNum(n, sigFigs = 3) {
  return new Intl.NumberFormat('ru-RU', { maximumSignificantDigits: sigFigs }).format(n)
}

function pluralBombs(n) {
  // Fractional numbers always take genitive singular in Russian.
  if (n % 1 !== 0) return 'бомбы'
  const abs = Math.abs(n)
  const last2 = abs % 100
  const last1 = abs % 10
  if (last2 >= 11 && last2 <= 19) return 'бомб'
  if (last1 === 1) return 'бомба'
  if (last1 >= 2 && last1 <= 4) return 'бомбы'
  return 'бомб'
}

export function energyComparison(mag) {
  if (mag == null) return null
  const tons = tonsTNT(mag)
  if (tons < 1) {
    return `≈ ${fmtNum(Math.round(tons * 1000))} кг тротила`
  }
  if (tons < HIROSHIMA_TONS) {
    return `≈ ${fmtNum(tons)} т тротила`
  }
  const bombs = tons / HIROSHIMA_TONS
  // Round to 2 sig figs so pluralisation matches displayed number.
  const bombsR = parseFloat(bombs.toPrecision(2))
  return `≈ ${fmtNum(bombsR)} ${pluralBombs(bombsR)} Хиросимы`
}

export function formatMag(mag) {
  if (mag == null) return '—'
  return mag.toFixed(1)
}

export function formatDepth(depth) {
  if (depth == null) return '—'
  return `${Math.round(depth)} км`
}
