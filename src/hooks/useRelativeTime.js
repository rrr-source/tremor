import { useState, useEffect } from 'react'
import { makeT } from '../i18n/context.jsx'

function formatRelative(elapsed, t) {
  const secs = Math.floor(elapsed / 1000)
  if (secs < 60)    return t('time.s_ago', { n: secs })
  if (secs < 3600)  return t('time.m_ago', { n: Math.floor(secs / 60) })
  if (secs < 86400) return t('time.h_ago', { n: Math.floor(secs / 3600) })
  return t('time.d_ago', { n: Math.floor(secs / 86400) })
}

export function useRelativeTime(timestamp, lang = 'en') {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!timestamp) { setLabel(''); return }
    const t = makeT(lang)
    function update() {
      setLabel(formatRelative(Date.now() - timestamp, t))
    }
    update()
    const id = setInterval(update, 10_000)
    return () => clearInterval(id)
  }, [timestamp, lang])

  return label
}
