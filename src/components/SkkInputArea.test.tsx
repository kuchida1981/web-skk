import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkkInputArea } from './SkkInputArea'
import { INITIAL_STATE, SkkState } from '../skk/types'

function makeConversionState(candidates: string[]): SkkState {
  return {
    ...INITIAL_STATE,
    phase: 'conversion',
    midashi: 'てんき',
    candidates,
    candidateIndex: 0,
  }
}

const noop = () => {}

describe('SkkInputArea', () => {
  it('renders committed text', () => {
    const state: SkkState = { ...INITIAL_STATE, committed: '今日は' }
    render(<SkkInputArea skkState={state} disabled={false} onKeyDown={noop} />)
    expect(screen.getByText('今日は')).toBeInTheDocument()
  })

  it('renders preEdit text in pre-conversion', () => {
    const state: SkkState = { ...INITIAL_STATE, phase: 'pre-conversion', midashi: 'てんき' }
    render(<SkkInputArea skkState={state} disabled={false} onKeyDown={noop} />)
    expect(screen.getByText('▽てんき')).toBeInTheDocument()
  })

  it('shows candidate popup in conversion phase', () => {
    const state = makeConversionState(['天気', '点機'])
    render(<SkkInputArea skkState={state} disabled={false} onKeyDown={noop} />)
    expect(screen.getByText('天気')).toBeInTheDocument()
    expect(screen.getByText('点機')).toBeInTheDocument()
  })

  it('shows candidate popup for inner conversion inside word registration', () => {
    const innerState: SkkState = makeConversionState(['対', '追', '遂'])
    const state: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      midashi: 'ついしかり',
      wordRegistration: {
        midashi: 'ついしかり',
        midashiKey: 'ついしかり',
        okurigana: '',
        inputState: innerState,
      },
    }
    render(<SkkInputArea skkState={state} disabled={false} onKeyDown={noop} />)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('対')).toBeInTheDocument()
    expect(screen.getByText('追')).toBeInTheDocument()
  })

  it('hides candidate popup in word registration when inner is not in conversion', () => {
    const innerState: SkkState = { ...INITIAL_STATE, phase: 'pre-conversion', midashi: 'つい' }
    const state: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      wordRegistration: {
        midashi: 'ついしかり',
        midashiKey: 'ついしかり',
        okurigana: '',
        inputState: innerState,
      },
    }
    render(<SkkInputArea skkState={state} disabled={false} onKeyDown={noop} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides candidate popup in direct phase', () => {
    render(<SkkInputArea skkState={INITIAL_STATE} disabled={false} onKeyDown={noop} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('is disabled when disabled=true', () => {
    render(<SkkInputArea skkState={INITIAL_STATE} disabled={true} onKeyDown={noop} />)
    const el = screen.getByRole('textbox')
    expect(el).toHaveAttribute('aria-disabled', 'true')
    expect(el).toHaveAttribute('tabindex', '-1')
  })
})

describe('ModeIndicator integration', () => {
  it('shows ひらがな for hiragana mode', async () => {
    const { ModeIndicator } = await import('./ModeIndicator')
    render(<ModeIndicator mode="hiragana" />)
    expect(screen.getByText('ひらがな')).toBeInTheDocument()
    expect(screen.queryByText(/Ctrl\+J/)).not.toBeInTheDocument()
  })

  it('shows カタカナ for katakana mode', async () => {
    const { ModeIndicator } = await import('./ModeIndicator')
    render(<ModeIndicator mode="katakana" />)
    expect(screen.getByText('カタカナ')).toBeInTheDocument()
  })

  it('shows Ctrl+J hint in ASCII mode', async () => {
    const { ModeIndicator } = await import('./ModeIndicator')
    render(<ModeIndicator mode="ascii" />)
    expect(screen.getByText('ASCII')).toBeInTheDocument()
    expect(screen.getByText(/Ctrl\+J/)).toBeInTheDocument()
  })

  it('shows Ctrl+J hint in zenkaku-ascii mode', async () => {
    const { ModeIndicator } = await import('./ModeIndicator')
    render(<ModeIndicator mode="zenkaku-ascii" />)
    expect(screen.getByText('全角ASCII')).toBeInTheDocument()
    expect(screen.getByText(/Ctrl\+J/)).toBeInTheDocument()
  })
})

describe('KeyGuide', () => {
  it('renders all sections', async () => {
    const { KeyGuide } = await import('./KeyGuide')
    render(<KeyGuide />)
    expect(screen.getByText('基本')).toBeInTheDocument()
    expect(screen.getByText('モード切替')).toBeInTheDocument()
    expect(screen.getByText('▽変換中')).toBeInTheDocument()
    expect(screen.getByText('▼候補選択中')).toBeInTheDocument()
    expect(screen.getByText('単語登録')).toBeInTheDocument()
  })

  it('renders key bindings in basic section', async () => {
    const { KeyGuide } = await import('./KeyGuide')
    render(<KeyGuide />)
    expect(screen.getByText('かな変換開始 (▽モード)')).toBeInTheDocument()
  })
})
