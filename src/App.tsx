import { useState, useCallback } from 'react'
import { useDictionary } from './hooks/useDictionary'
import { useSkkEngine } from './hooks/useSkkEngine'
import { useGameScore } from './hooks/useGameScore'
import { useTypingGame } from './hooks/useTypingGame'
import { SkkInputArea } from './components/SkkInputArea'
import { ModeIndicator } from './components/ModeIndicator'
import { DictionaryStatus } from './components/DictionaryStatus'
import { KeyGuide } from './components/KeyGuide'
import { TypingGame } from './components/game/TypingGame'
import './App.css'

type AppMode = 'free' | 'game'

function App() {
  const { state: dictState, provider, retry, personalProvider } = useDictionary()
  const { skkState, handleKeyDown, reset: resetSkkEngine } = useSkkEngine(provider, personalProvider)
  const { saveRecord, records } = useGameScore()
  const game = useTypingGame(saveRecord)

  const [appMode, setAppMode] = useState<AppMode>('free')

  const isReady = dictState.status === 'ready'
  const isGamePlaying = game.gameState.phase === 'playing'

  const switchMode = useCallback(
    (mode: AppMode) => {
      if (isGamePlaying) return
      resetSkkEngine()
      setAppMode(mode)
    },
    [isGamePlaying, resetSkkEngine],
  )

  const handleSwitchToFree = useCallback(() => {
    resetSkkEngine()
    setAppMode('free')
  }, [resetSkkEngine])

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">SKK 体験</h1>
        <nav className="app__tabs" aria-label="モード切替">
          <button
            className={`app__tab ${appMode === 'free' ? 'app__tab--active' : ''}`}
            onClick={() => switchMode('free')}
            disabled={isGamePlaying}
            aria-current={appMode === 'free' ? 'page' : undefined}
          >
            フリー入力
          </button>
          <button
            className={`app__tab ${appMode === 'game' ? 'app__tab--active' : ''}`}
            onClick={() => switchMode('game')}
            disabled={isGamePlaying}
            aria-current={appMode === 'game' ? 'page' : undefined}
          >
            ゲーム
          </button>
        </nav>
        {appMode === 'free' && <ModeIndicator mode={skkState.mode} />}
      </header>

      <main className="app__main">
        <DictionaryStatus state={dictState} onRetry={retry} />
        {appMode === 'free' ? (
          <SkkInputArea
            skkState={skkState}
            disabled={!isReady}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <TypingGame
            game={game}
            skkState={skkState}
            handleKeyDown={handleKeyDown}
            resetSkkEngine={resetSkkEngine}
            records={records}
            isReady={isReady}
            onSwitchToFree={handleSwitchToFree}
          />
        )}
      </main>

      {appMode === 'free' && (
        <footer className="app__footer">
          <KeyGuide />
        </footer>
      )}
    </div>
  )
}

export default App
