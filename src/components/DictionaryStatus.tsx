import { DictionaryState } from '../skk/dictionary'

interface Props {
  state: DictionaryState
  onRetry: () => void
}

export function DictionaryStatus({ state, onRetry }: Props) {
  if (state.status === 'ready') return null

  return (
    <div className="dictionary-status" role="status">
      {state.status === 'loading' || state.status === 'idle' ? (
        <div className="dictionary-status__loading">
          <span className="dictionary-status__spinner" aria-hidden="true" />
          辞書を読み込み中...
        </div>
      ) : state.status === 'error' ? (
        <div className="dictionary-status__error">
          <span>辞書の読み込みに失敗しました: {state.message}</span>
          <button className="dictionary-status__retry" onClick={onRetry}>
            再試行
          </button>
        </div>
      ) : null}
    </div>
  )
}
