import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  detectLocale,
  interpolate,
  MESSAGES,
  persistLocale,
  type Locale,
  type MessageKey,
} from './messages'
import { I18nContext } from './useI18n'

type Props = {
  children: ReactNode
}

export function I18nProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = MESSAGES[locale].title
  }, [locale])

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      return interpolate(MESSAGES[locale][key], vars)
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
