import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkkInputArea } from './SkkInputArea'
import { INITIAL_STATE, SkkState } from '../skk/types'

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
    const state: SkkState = {
      ...INITIAL_STATE,
      phase: 'conversion',
      midashi: 'てんき',
      candidates: ['天気', '点機'],
      candidateIndex: 0,
    }
    render(<SkkInputArea skkState={state} disabled={false} onKeyDown={noop} />)
    expect(screen.getByText('天気')).toBeInTheDocument()
    expect(screen.getByText('点機')).toBeInTheDocument()
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
  it('renders key bindings', async () => {
    const { KeyGuide } = await import('./KeyGuide')
    render(<KeyGuide />)
    expect(screen.getByText(/変換開始/)).toBeInTheDocument()
  })

  it('can be toggled closed', async () => {
    const { KeyGuide } = await import('./KeyGuide')
    const { getByRole } = render(<KeyGuide />)
    const toggle = getByRole('button', { name: /キーガイド/ })
    fireEvent.click(toggle)
    expect(screen.queryByText(/変換開始/)).not.toBeInTheDocument()
  })
})
