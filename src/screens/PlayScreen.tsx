import { useCallback, useRef, useState } from 'react'
import { GameCanvas } from '../components/game/GameCanvas'
import { Hud } from '../components/game/Hud'
import { Needle } from '../components/game/Needle'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { createSeed, formatDuration } from '../game/math'
import type { Difficulty, EngineSnapshot } from '../game/types'
import { useI18n } from '../i18n/useI18n'

type Props = {
  difficulty: Difficulty
  onExit: () => void
}

export function PlayScreen({ difficulty, onExit }: Props) {
  const { t } = useI18n()
  const [seed, setSeed] = useState(() => createSeed())
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null)
  const [won, setWon] = useState(false)
  const [winTime, setWinTime] = useState(0)
  const snapshotRef = useRef<EngineSnapshot | null>(null)

  const onSnapshot = useCallback((next: EngineSnapshot) => {
    snapshotRef.current = next
    setSnapshot((prev) => (sameHud(prev, next) ? prev : next))
  }, [])

  const onFound = useCallback(() => {
    setWon(true)
    setWinTime(snapshotRef.current?.elapsedMs ?? 0)
  }, [])

  const playAgain = () => {
    setWon(false)
    setWinTime(0)
    setSnapshot(null)
    snapshotRef.current = null
    setSeed(createSeed())
  }

  const elapsed = won ? winTime : (snapshot?.elapsedMs ?? 0)

  return (
    <div className="screen play-screen">
      <Hud snapshot={snapshot} onBack={onExit} />

      <div className="stage">
        <GameCanvas difficulty={difficulty} seed={seed} onSnapshot={onSnapshot} onFound={onFound} />
      </div>

      <p className="play-hint">
        {snapshot && !snapshot.spriteMode
          ? t('zoomInToPick')
          : snapshot?.needleInView
            ? t('needleInView')
            : t('controlsHint')}
      </p>

      <Modal
        open={won}
        title={t('youFoundIt')}
        actions={
          <>
            <Button onClick={playAgain}>{t('playAgain')}</Button>
            <Button variant="wood" onClick={onExit}>
              {t('changeLevel')}
            </Button>
          </>
        }
      >
        <div className="win-visual">
          <Needle width={96} />
        </div>
        <p>{t('winBody')}</p>
        <p className="win-time">
          {t('time')} {formatDuration(elapsed)}
        </p>
      </Modal>
    </div>
  )
}

function sameHud(prev: EngineSnapshot | null, next: EngineSnapshot): boolean {
  if (!prev) return false
  return (
    prev.movedCount === next.movedCount &&
    prev.dragging === next.dragging &&
    prev.foundNeedle === next.foundNeedle &&
    prev.needleInView === next.needleInView &&
    prev.spriteMode === next.spriteMode &&
    Math.round(prev.zoom * 20) === Math.round(next.zoom * 20) &&
    Math.round(prev.proximity * 40) === Math.round(next.proximity * 40) &&
    Math.floor(prev.elapsedMs / 1000) === Math.floor(next.elapsedMs / 1000)
  )
}
