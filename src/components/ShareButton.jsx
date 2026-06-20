import { useState, useRef } from 'react'

export function ShareButton() {
  const [status, setStatus] = useState('idle') // 'idle' | 'ok' | 'fail'
  const timerRef = useRef(null)

  function handleClick() {
    if (timerRef.current) clearTimeout(timerRef.current)

    const url = window.location.href
    const done = s => {
      setStatus(s)
      timerRef.current = setTimeout(() => setStatus('idle'), s === 'fail' ? 3500 : 2000)
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => done('ok'), () => done('fail'))
    } else {
      done('fail')
    }
  }

  const label =
    status === 'ok'   ? 'Ссылка скопирована' :
    status === 'fail' ? 'Скопируйте из адресной строки' :
                        'Поделиться'

  return (
    <button
      type="button"
      className={`share-btn mono share-btn--${status}`}
      onClick={handleClick}
    >
      {label}
    </button>
  )
}
