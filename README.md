# web-skk

A browser-based SKK Japanese input method experience app. Try SKK — a unique, keyboard-centric input method for Japanese — directly in your browser, with no installation required.

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

## Features (v1)

- Full SKK input experience in the browser — no OS-level IME needed
- Hiragana, Katakana, ASCII, and Full-width ASCII modes
- Kanji conversion with okurigana (送り仮名) support
- Dictionary: SKK-JISYO.L (~6 MB), cached in IndexedDB after first load
- Mode indicator, candidate popup, collapsible key guide
- Pure TypeScript SKK engine — zero browser/DOM dependency, fully unit-tested

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

## Running the Dev Server (for testing and debugging)

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
| `Ctrl+J` | Switch to Hiragana mode |
| `Q` | Toggle Hiragana ↔ Katakana |
| `l` | Switch to ASCII mode |
| `L` | Switch to Full-width ASCII mode |
| `Backspace` | Delete one character |

**Okurigana example:** To type 書く (to write), type `K` `a` `K` `u` — the second capital `K` marks the start of the okurigana.

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
- `src/skk/*.test.ts` — SKK engine, romaji table, dictionary parser (64 tests, no DOM)
- `src/components/*.test.tsx` — React component integration tests

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server:

```bash
npm run preview   # Vite's built-in preview server
```

---

## Project Structure

```
src/
  skk/
    types.ts          # SkkState type, INITIAL_STATE, getPreEdit()
    romaji-table.ts   # Romaji→kana table and conversion logic
    engine.ts         # processKey() — pure state machine, no React/DOM
    dictionary.ts     # SKK-JISYO parser, IndexedDB cache, DictionaryProvider
  components/
    SkkInputArea.tsx  # Main input field (keydown capture, ▽/▼ display)
    CandidatePopup.tsx
    ModeIndicator.tsx
    DictionaryStatus.tsx
    KeyGuide.tsx
  hooks/
    useSkkEngine.ts   # Connects engine + dictionary to React state
    useDictionary.ts  # Async dictionary load with status tracking
public/
  skk-jisyo.utf8      # SKK-JISYO.L converted to UTF-8
e2e/
  skk-input.spec.ts   # Playwright E2E scenarios
```

---

## Architecture Notes

The SKK engine (`src/skk/engine.ts`) is a pure function:

```
processKey(state: SkkState, event: KeyboardEvent) → { nextState, dictionaryRequest? }
```

It has no dependency on React, the DOM, or browser APIs. This makes it:
- **Fully unit-testable** without a browser environment
- **Reusable** for future modes (e.g. a typing game)

When a dictionary lookup is needed, the engine returns a `dictionaryRequest` object. The React hook (`useSkkEngine`) performs the lookup synchronously and injects candidates back into state.

---

## License

MIT
