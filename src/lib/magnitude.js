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
