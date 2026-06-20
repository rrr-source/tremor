import { useTranslation } from '../i18n/context.jsx'

export function LangToggle() {
  const { lang, setLang, t } = useTranslation()
  return (
    <div className="lang-toggle" role="group" aria-label={t('lang_toggle_aria')}>
      <button
        type="button"
        className={`lang-btn mono${lang === 'en' ? ' lang-btn--active' : ''}`}
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn mono${lang === 'ru' ? ' lang-btn--active' : ''}`}
        aria-pressed={lang === 'ru'}
        onClick={() => setLang('ru')}
      >
        RU
      </button>
    </div>
  )
}
