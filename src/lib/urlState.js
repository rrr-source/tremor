const DEFAULTS = {
  mode:       'globe',
  period:     'day',
  filter:     '2.5',
  selectedId: null,
  lang:       'en',   // English is the default; omitted from URL
}

const ALLOWED_MODES   = new Set(['flat', 'globe'])
const ALLOWED_PERIODS = new Set(['day', 'week', 'month'])
const ALLOWED_FILTERS = new Set(['all', '2.5', '4.5', 'significant'])
const ALLOWED_LANGS   = new Set(['en', 'ru'])

export function readState() {
  const p = new URLSearchParams(window.location.search)

  const rawMode   = p.get('mode')
  const rawPeriod = p.get('period')
  const rawFilter = p.get('mag')
  const rawId     = p.get('q')
  const rawLang   = p.get('lang')

  return {
    mode:       ALLOWED_MODES.has(rawMode)     ? rawMode   : DEFAULTS.mode,
    period:     ALLOWED_PERIODS.has(rawPeriod) ? rawPeriod : DEFAULTS.period,
    filter:     ALLOWED_FILTERS.has(rawFilter) ? rawFilter : DEFAULTS.filter,
    selectedId: rawId || null,
    // null means "not in URL" — caller falls back to navigator.language detection
    lang:       ALLOWED_LANGS.has(rawLang) ? rawLang : null,
  }
}

export function writeState({ mode, period, filter, selectedId, lang }) {
  const p = new URLSearchParams()

  if (mode !== DEFAULTS.mode)     p.set('mode',   mode)
  if (period !== DEFAULTS.period) p.set('period', period)
  if (filter !== DEFAULTS.filter) p.set('mag',    filter)
  if (selectedId)                 p.set('q',      selectedId)
  // English is the default; only write lang when explicitly set to a non-default.
  if (lang && lang !== DEFAULTS.lang) p.set('lang', lang)

  const qs  = p.toString()
  const url = window.location.pathname + (qs ? '?' + qs : '')
  history.replaceState(null, '', url)
}
