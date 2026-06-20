import { createContext, useContext } from 'react'
import en from './en.js'
import ru from './ru.js'

const DICTS = { en, ru }

function lookup(dict, key) {
  return key.split('.').reduce((obj, k) => (obj != null ? obj[k] : undefined), dict)
}

function interpolate(str, params) {
  if (typeof str !== 'string') return str ?? ''
  if (!params) return str
  return Object.entries(params).reduce(
    (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
    str
  )
}

// Returns the plural category for n in the given language.
// Russian: one / few / many (3-form).  English: one / other (2-form).
function selectPlural(lang, n) {
  if (lang === 'ru') {
    const abs   = Math.abs(Math.round(n))
    const last2 = abs % 100
    const last1 = abs % 10
    if (last2 >= 11 && last2 <= 19) return 'many'
    if (last1 === 1)                 return 'one'
    if (last1 >= 2 && last1 <= 4)   return 'few'
    return 'many'
  }
  return Math.abs(Math.round(n)) === 1 ? 'one' : 'other'
}

// Standalone helpers — usable outside React (e.g. in App's function body).
export function makeT(lang) {
  const dict = DICTS[lang] ?? DICTS.en
  return function t(key, params) {
    const val = lookup(dict, key)
    return typeof val === 'string' ? interpolate(val, params) : key
  }
}

export function makePlural(lang) {
  const dict = DICTS[lang] ?? DICTS.en
  return function plural(key, n, params) {
    const forms = lookup(dict, key)
    if (!forms || typeof forms !== 'object') {
      return interpolate(typeof forms === 'string' ? forms : key, { n, ...params })
    }
    const form = selectPlural(lang, n)
    const str  = forms[form] ?? forms.other ?? forms.many ?? Object.values(forms)[0] ?? key
    return interpolate(str, { n, ...params })
  }
}

const I18nContext = createContext(null)

export function LangProvider({ lang, setLang, children }) {
  const t      = makeT(lang)
  const plural = makePlural(lang)
  return (
    <I18nContext.Provider value={{ lang, setLang, t, plural }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
