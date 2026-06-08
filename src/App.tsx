import { useState, useCallback, useEffect } from 'react'
import { useDictionary } from './hooks/useDictionary'
import { useSkkEngine } from './hooks/useSkkEngine'
import { useGameScore } from './hooks/useGameScore'
import { useTypingGame } from './hooks/useTypingGame'
import { SkkInputArea } from './components/SkkInputArea'
import { ModeIndicator } from './components/ModeIndicator'
import { DictionaryStatus } from './components/DictionaryStatus'
import { KeyGuide } from './components/KeyGuide'
import { TypingGame } from './components/game/TypingGame'
import { trackEvent } from './lib/analytics'
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
      trackEvent('mode_switch', { mode })
    },
    [isGamePlaying, resetSkkEngine],
  )

  useEffect(() => {
    if (dictState.status === 'ready') {
      trackEvent('dictionary_ready')
    } else if (dictState.status === 'error') {
      trackEvent('dictionary_error', { message: dictState.message })
    }
  }, [dictState.status, (dictState as any).message])

  useEffect(() => {
    if (game.gameState.phase === 'result' && game.gameState.startTime && game.gameState.endTime) {
      trackEvent('game_complete', {
        difficulty: game.gameState.difficulty,
        time_ms: game.gameState.endTime - game.gameState.startTime,
      })
    }
  }, [game.gameState.phase, game.gameState.difficulty, game.gameState.startTime, game.gameState.endTime])

  const handleSwitchToFree = useCallback(() => {
    resetSkkEngine()
    setAppMode('free')
  }, [resetSkkEngine])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-title">
          <h1 className="app__title">SKK 体験会場</h1>
          <p className="app__subtitle">Shift（大文字）で変換範囲を自分で指定する、シンプルな日本語入力方式です。</p>
        </div>
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
      </header>

      <main className="app__main">
        <DictionaryStatus state={dictState} onRetry={retry} />
        <div className="app__free-layout">
          <div className="app__free-input">
            {(appMode === 'free' || isGamePlaying) && (
              <>
                <ModeIndicator mode={skkState.mode} />
                <p className="app__ime-note">
                  ⚠️ Microsoft IME・Google 日本語入力・Fcitx などシステムの日本語入力をオフにしてご使用ください
                </p>
              </>
            )}
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
          </div>
          <KeyGuide />
        </div>
      </main>
    </div>
  )
}

export default App
