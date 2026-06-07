import { useDictionary } from './hooks/useDictionary'
import { useSkkEngine } from './hooks/useSkkEngine'
import { SkkInputArea } from './components/SkkInputArea'
import { ModeIndicator } from './components/ModeIndicator'
import { DictionaryStatus } from './components/DictionaryStatus'
import { KeyGuide } from './components/KeyGuide'
import './App.css'

function App() {
  const { state: dictState, provider, retry, personalProvider } = useDictionary()
  const { skkState, handleKeyDown } = useSkkEngine(provider, personalProvider)

  const isReady = dictState.status === 'ready'

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">SKK 体験</h1>
        <ModeIndicator mode={skkState.mode} />
      </header>

      <main className="app__main">
        <DictionaryStatus state={dictState} onRetry={retry} />
        <SkkInputArea
          skkState={skkState}
          disabled={!isReady}
          onKeyDown={handleKeyDown}
        />
      </main>

      <footer className="app__footer">
        <KeyGuide />
      </footer>
    </div>
  )
}

export default App
