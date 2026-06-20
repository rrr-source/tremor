import { useState, useRef } from 'react'
import { useTranslation } from '../i18n/context.jsx'

export function ShareButton() {
  const [status, setStatus] = useState('idle') // 'idle' | 'ok' | 'fail'
  const timerRef = useRef(null)
  const { t } = useTranslation()

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
    status === 'ok'   ? t('share.ok')   :
    status === 'fail' ? t('share.fail') :
                        t('share.idle')

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
