const DEFAULTS = {
  mode:       'globe',
  period:     'day',
  filter:     '2.5',
  selectedId: null,
}

const ALLOWED_MODES   = new Set(['flat', 'globe'])
const ALLOWED_PERIODS = new Set(['day', 'week', 'month'])
const ALLOWED_FILTERS = new Set(['all', '2.5', '4.5', 'significant'])

export function readState() {
  const p = new URLSearchParams(window.location.search)

  const rawMode   = p.get('mode')
  const rawPeriod = p.get('period')
  const rawFilter = p.get('mag')
  const rawId     = p.get('q')

  return {
    mode:       ALLOWED_MODES.has(rawMode)     ? rawMode   : DEFAULTS.mode,
    period:     ALLOWED_PERIODS.has(rawPeriod) ? rawPeriod : DEFAULTS.period,
    filter:     ALLOWED_FILTERS.has(rawFilter) ? rawFilter : DEFAULTS.filter,
    selectedId: rawId || null,
  }
}

export function writeState({ mode, period, filter, selectedId }) {
  const p = new URLSearchParams()

  if (mode !== DEFAULTS.mode)     p.set('mode',   mode)
  if (period !== DEFAULTS.period) p.set('period', period)
  if (filter !== DEFAULTS.filter) p.set('mag',    filter)
  if (selectedId)                 p.set('q',      selectedId)

  const qs  = p.toString()
  const url = window.location.pathname + (qs ? '?' + qs : '')
  history.replaceState(null, '', url)
}
