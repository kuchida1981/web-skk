# web-skk

A browser-based SKK Japanese input method experience app. Try SKK — a unique, keyboard-centric input method for Japanese — directly in your browser, with no installation required.

**Live demo:** https://skk.u-rei.com/

> **Japanese README:** [README.ja.md](./README.ja.md)

---

## What is SKK?

SKK (Simple Kana Kanji) is a Japanese input method that differs from conventional IMEs by having users explicitly mark conversion boundaries. Instead of automatic morphological analysis, you signal the start of a word to convert by pressing a capital letter. This makes conversion deterministic and fast, at the cost of a small learning curve.

Key differences from standard IMEs:
- **Capital letter** starts a conversion block (▽ marker)
- **Space** triggers dictionary lookup and candidate selection
- **Enter** confirms; **Ctrl+G** cancels
- Okurigana (trailing kana) boundaries are marked by the user

---

## Features

- Full SKK input experience in the browser — no OS-level IME needed
- Hiragana, Katakana, ASCII, and Full-width ASCII modes
- Kanji conversion with okurigana (送り仮名) support
- In-engine word registration: when no candidates exist, enter a word inline using nested SKK input
- Personal dictionary: user-registered words stored in localStorage, prioritized over the shared dictionary
- Dictionary: SKK-JISYO.L (~6 MB), cached in IndexedDB after first load
- **Typing game mode**: practice SKK with easy / normal / hard difficulty, 10 questions per round, timer, and score history
- Two app modes switchable via header tabs: **Free Input** and **Game**
- Mode indicator, candidate popup, collapsible key guide with IME-off guidance

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |

---

## Installation

```bash
git clone <repo-url>
cd web-skk
npm install
```

---

## Running the Dev Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

**What to expect on first load:**
1. The app loads and displays a spinner while fetching the dictionary (`public/skk-jisyo.utf8`, ~6 MB)
2. Once the dictionary is ready, the input area becomes active and auto-focused
3. On subsequent loads, the dictionary is served from IndexedDB — no network request

**Debugging tips:**
- Open DevTools → **Application → IndexedDB → web-skk** to inspect the dictionary cache
- To force a fresh dictionary fetch, delete the IndexedDB entry and reload
- The browser console shows no SKK-related logs in normal operation; errors appear if the dictionary fetch fails

---

## SKK Key Reference

| Key | Action |
|-----|--------|
| Lowercase letters | Romaji-to-kana input |
| **Uppercase letter** (e.g. `K`) | Start conversion block (▽ mode) |
| `Space` | Convert / next candidate |
| `Enter` | Commit current input |
| `Ctrl+G` | Cancel conversion |
| `Ctrl+J` | Switch to Hiragana mode (some browsers: `Shift+Ctrl+J`) |
| `Q` | Toggle Hiragana ↔ Katakana |
| `l` | Switch to ASCII mode |
| `L` | Switch to Full-width ASCII mode |
| `Backspace` | Delete one character |

**Okurigana example:** To type 書く (to write), type `K` `a` `K` `u` — the second capital `K` marks the start of the okurigana.

**Word registration:** When Space produces no candidates (or you cycle past the last one), the engine enters registration mode. Type the reading in nested SKK input, press Enter, and the word is saved to your personal dictionary immediately.

> **Note:** Before using the app, disable your OS-level Japanese input (Microsoft IME, Google Japanese Input, Fcitx, etc.) to prevent key conflicts.

---

## Typing Game

Switch to **Game** mode via the header tab. Select a difficulty and press Start:

| Difficulty | Content |
|------------|---------|
| Easy | Hiragana / Katakana only (5–10 chars) |
| Normal | Kanji conversion without okurigana (10–18 chars) |
| Hard | Kanji conversion with okurigana (15–25 chars) |

10 questions are drawn randomly from the pool. A timer runs from the first question. Finish all 10 to see your total time and score history (up to 10 past records shown; up to 50 stored in localStorage).

---

## Running Tests

```bash
# Unit + integration tests (Vitest)
npm test

# Run once (no watch mode)
npx vitest run

# E2E tests (requires dev server running)
npm run test:e2e
```

Test coverage:
- `src/skk/*.test.ts` — SKK engine, romaji table, dictionary parser (no DOM)
- `src/hooks/*.test.ts` — typing game logic and score persistence
- `src/components/*.test.tsx` — React component integration tests
- `e2e/` — Playwright end-to-end scenarios

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server:

```bash
npm run preview   # Vite's built-in preview server
```

The build is configured with `base: '/web-skk/'` for GitHub Pages deployment. A release published on GitHub triggers the deploy workflow (`.github/workflows/deploy.yml`) automatically.

---

## Project Structure

```
src/
  skk/
    types.ts            # SkkState type, INITIAL_STATE, getPreEdit()
    romaji-table.ts     # Romaji→kana table and conversion logic
    engine.ts           # processKey() — pure state machine, no React/DOM
    dictionary.ts       # SKK-JISYO parser, IndexedDB cache, personal dict, DictionaryProvider
  components/
    SkkInputArea.tsx    # Main input field (keydown capture, ▽/▼ display)
    CandidatePopup.tsx
    ModeIndicator.tsx
    DictionaryStatus.tsx
    KeyGuide.tsx
    game/
      TypingGame.tsx    # Game mode root
      GameStart.tsx     # Difficulty selection screen
      GameQuestion.tsx  # In-progress question screen
      GameResult.tsx    # Results screen with score history
  hooks/
    useSkkEngine.ts     # Connects engine + dictionary to React state
    useDictionary.ts    # Async dictionary load with status tracking
    useTypingGame.ts    # Typing game state machine
    useGameScore.ts     # Score persistence (localStorage)
  data/
    questions.ts        # Static question bank (easy / normal / hard pools)
public/
  skk-jisyo.utf8        # SKK-JISYO.L converted to UTF-8
e2e/
  skk-input.spec.ts     # Playwright E2E scenarios
```

---

## Architecture Notes

The SKK engine (`src/skk/engine.ts`) is a pure function:

```
processKey(state: SkkState, event: KeyboardEvent) → { nextState, dictionaryRequest?, registrationResult? }
```

It has no dependency on React, the DOM, or browser APIs. This makes it:
- **Fully unit-testable** without a browser environment
- **Reusable** across Free Input and Game modes

When a dictionary lookup is needed, the engine returns a `dictionaryRequest`. The React hook (`useSkkEngine`) performs the lookup synchronously and injects candidates back into state. When word registration is confirmed, the engine returns a `registrationResult`; the hook persists it to the personal dictionary (localStorage) and prepends it to subsequent candidate lists.

The personal dictionary (`CompoundDictionaryProvider`) wraps the shared dictionary and always returns user-registered words first, with deduplication.

---

## License

MIT
