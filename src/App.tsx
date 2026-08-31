import { useState } from 'react'
import type { Difficulty } from './game/types'
import { I18nProvider } from './i18n/I18nProvider'
import { MenuScreen } from './screens/MenuScreen'
import { PlayScreen } from './screens/PlayScreen'

function GameRoot() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  if (difficulty) {
    return <PlayScreen difficulty={difficulty} onExit={() => setDifficulty(null)} />
  }

  return <MenuScreen onPlay={setDifficulty} />
}

export default function App() {
  return (
    <I18nProvider>
      <GameRoot />
    </I18nProvider>
  )
}
