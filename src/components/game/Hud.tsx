import { formatDuration } from '../../game/math'
import type { EngineSnapshot } from '../../game/types'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { ProximityMeter } from './ProximityMeter'

type Props = {
  snapshot: EngineSnapshot | null
  onBack: () => void
}

export function Hud({ snapshot, onBack }: Props) {
  const { t, locale } = useI18n()
  const moved = new Intl.NumberFormat(locale).format(snapshot?.movedCount ?? 0)
  const zoom = (snapshot?.zoom ?? 1).toFixed(2)
  const drag =
    snapshot?.dragging === 'needle'
      ? t('draggingNeedle')
      : snapshot?.dragging === 'straw'
        ? t('draggingStraw')
        : null

  return (
    <header className="hud">
      <div className="hud-row">
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t('back')}
        </Button>
        <div className="hud-title">
          <p className="eyebrow">{t('proverb')}</p>
          <h1>{t('title')}</h1>
        </div>
        <LanguageSwitcher compact />
      </div>

      <div className="hud-stats">
        <span className="chip">{t('strawsMoved', { count: moved })}</span>
        <span className="chip">{t('zoom', { value: zoom })}</span>
        <span className="chip">
          {t('time')} {formatDuration(snapshot?.elapsedMs ?? 0)}
        </span>
        {drag ? <span className="chip chip-accent">{drag}</span> : null}
        <div className="hud-meter">
          <ProximityMeter value={snapshot?.proximity ?? 0} label={t('proximity')} />
        </div>
      </div>
    </header>
  )
}
