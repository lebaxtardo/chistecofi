import { LOCALES, LOCALE_LABELS } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'

type Props = {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: Props) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className={`lang-switch ${compact ? 'lang-switch-compact' : ''}`} role="group" aria-label={t('language')}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-btn ${locale === code ? 'is-active' : ''}`}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          title={LOCALE_LABELS[code]}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
