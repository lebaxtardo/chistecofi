import { useState } from 'react'
import { DIFFICULTIES, LEVELS } from '../game/levels'
import type { Difficulty } from '../game/types'
import { useI18n } from '../i18n/useI18n'
import { HayPile } from '../components/game/HayPile'
import { LevelCard } from '../components/game/LevelCard'
import { Needle } from '../components/game/Needle'
import { Straw } from '../components/game/Straw'
import { Button } from '../components/ui/Button'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'

type Props = {
  onPlay: (difficulty: Difficulty) => void
}

export function MenuScreen({ onPlay }: Props) {
  const { t } = useI18n()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  return (
    <div className="screen menu-screen">
      <header className="menu-top">
        <p className="eyebrow">{t('proverb')}</p>
        <LanguageSwitcher />
      </header>

      <div className="menu-grid">
        <section className="menu-hero">
          <HayPile />
          <h1 className="display">{t('title')}</h1>
          <p className="lede">{t('tagline')}</p>
          <Button size="md" onClick={() => onPlay(difficulty)}>
            {t('play')} · {t(difficulty)}
          </Button>
        </section>

        <section className="menu-panel">
          <h2>{t('selectLevel')}</h2>
          <div className="level-list">
            {DIFFICULTIES.map((id) => (
              <LevelCard
                key={id}
                difficulty={id}
                selected={difficulty === id}
                onSelect={setDifficulty}
              />
            ))}
          </div>

          <div className="howto">
            <h3>{t('howToTitle')}</h3>
            <ul>
              <li>
                <Straw width={36} variant={1} />
                <span>{t('howToStraw')}</span>
              </li>
              <li>
                <Needle width={40} />
                <span>{t('howToNeedle')}</span>
              </li>
              <li>
                <span className="howto-icon">⊕</span>
                <span>{t('howToPan')}</span>
              </li>
              <li>
                <span className="howto-icon">⌕</span>
                <span>{t('howToZoom')}</span>
              </li>
              <li>
                <span className="howto-icon">♨</span>
                <span>{t('howToProximity')}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <footer className="menu-foot">
        <span>{t('footer')}</span>
        <span>{new Intl.NumberFormat().format(LEVELS[difficulty].hayCount)}</span>
      </footer>
    </div>
  )
}
