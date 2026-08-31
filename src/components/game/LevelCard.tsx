import { LEVELS } from '../../game/levels'
import type { Difficulty } from '../../game/types'
import { useI18n } from '../../i18n/useI18n'

type Props = {
  difficulty: Difficulty
  selected?: boolean
  onSelect: (difficulty: Difficulty) => void
}

const LEVEL_COPY: Record<Difficulty, { title: 'easy' | 'medium' | 'expert'; hint: 'easyHint' | 'mediumHint' | 'expertHint' }> =
  {
    easy: { title: 'easy', hint: 'easyHint' },
    medium: { title: 'medium', hint: 'mediumHint' },
    expert: { title: 'expert', hint: 'expertHint' },
  }

export function LevelCard({ difficulty, selected = false, onSelect }: Props) {
  const { t, locale } = useI18n()
  const copy = LEVEL_COPY[difficulty]
  const count = LEVELS[difficulty].hayCount
  const formatted = new Intl.NumberFormat(locale).format(count)

  return (
    <button
      type="button"
      className={`level-card ${selected ? 'is-selected' : ''} level-${difficulty}`}
      onClick={() => onSelect(difficulty)}
      aria-pressed={selected}
    >
      <span className="level-card-kicker">{t(copy.title)}</span>
      <strong className="level-card-count">{t('hayCount', { count: formatted })}</strong>
      <span className="level-card-hint">{t(copy.hint)}</span>
    </button>
  )
}
