import { useState, useEffect } from 'react'

function formatRelative(elapsed) {
  const secs = Math.floor(elapsed / 1000)
  if (secs < 60)    return `${secs} сек назад`
  if (secs < 3600)  return `${Math.floor(secs / 60)} мин назад`
  if (secs < 86400) return `${Math.floor(secs / 3600)} ч назад`
  return `${Math.floor(secs / 86400)} дн назад`
}

export function useRelativeTime(timestamp) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!timestamp) {
      setLabel('')
      return
    }
    function update() {
      setLabel(formatRelative(Date.now() - timestamp))
    }
    update()
    const id = setInterval(update, 10_000)
    return () => clearInterval(id)
  }, [timestamp])

  return label
}
