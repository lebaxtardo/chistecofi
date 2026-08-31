import { useEffect, useRef } from 'react'
import { GameEngine } from '../../game/engine'
import { LEVELS } from '../../game/levels'
import type { Difficulty, EngineSnapshot } from '../../game/types'

type Props = {
  difficulty: Difficulty
  seed: number
  onSnapshot: (snapshot: EngineSnapshot) => void
  onFound: () => void
}

export function GameCanvas({ difficulty, seed, onSnapshot, onFound }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new GameEngine(canvas, LEVELS[difficulty], seed, {
      onSnapshot,
      onFound,
    })

    return () => engine.destroy()
  }, [difficulty, seed, onSnapshot, onFound])

  return <canvas ref={canvasRef} className="game-canvas" />
}
