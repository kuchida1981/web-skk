import { test, expect } from '@playwright/test'

// Helper: wait for dictionary to load (ready state removes loading indicator)
async function waitForReady(page: import('@playwright/test').Page) {
  await page.waitForSelector('.skk-input-area:not(.skk-input-area--disabled)', { timeout: 30000 })
}

test.describe('SKK入力 基本動作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)
  })

  test('ひらがな入力と変換・確定', async ({ page }) => {
    const input = page.locator('.skk-input-area')
    await input.focus()

    // Type "Ka n ji" to get ▽かんじ
    await page.keyboard.press('K')
    await page.keyboard.press('a')
    await page.keyboard.press('n')
    await page.keyboard.press('j')
    await page.keyboard.press('i')

    // preedit should show ▽かんじ
    await expect(page.locator('.skk-preedit')).toContainText('▽かんじ')

    // Press Space to convert
    await page.keyboard.press('Space')

    // Candidate popup should appear
    await expect(page.locator('.candidate-popup')).toBeVisible()

    // Press Enter to commit
    await page.keyboard.press('Enter')

    // Committed text should contain 漢字
    await expect(page.locator('.skk-committed')).toContainText('漢字')
  })

  test('モード切り替え: ひらがな → カタカナ', async ({ page }) => {
    const input = page.locator('.skk-input-area')
    await input.focus()

    await expect(page.locator('.mode-indicator')).toHaveText('ひらがな')

    await page.keyboard.press('q') // lowercase q switches mode
    await expect(page.locator('.mode-indicator')).toHaveText('カタカナ')
  })

  test('モード切り替え: ひらがな → ASCII', async ({ page }) => {
    const input = page.locator('.skk-input-area')
    await input.focus()

    await page.keyboard.press('l')
    await expect(page.locator('.mode-indicator')).toHaveText('ASCII')
  })

  test('Ctrl+G で変換キャンセル', async ({ page }) => {
    const input = page.locator('.skk-input-area')
    await input.focus()

    await page.keyboard.press('K')
    await page.keyboard.press('a')
    await page.keyboard.press('n')
    await expect(page.locator('.skk-preedit')).toContainText('▽か')

    await page.keyboard.press('Control+g')
    await expect(page.locator('.skk-preedit')).not.toBeAttached()
  })
})

test.describe('SKK入力 送り仮名', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)
  })

  test('送り仮名付き変換 (書く)', async ({ page }) => {
    const input = page.locator('.skk-input-area')
    await input.focus()

    // K a K u → ▽かK u → 書く
    await page.keyboard.press('K')
    await page.keyboard.press('a')
    await page.keyboard.press('K') // start okurigana
    await page.keyboard.press('u') // く confirmed

    // Should be in conversion with okurigana
    await expect(page.locator('.candidate-popup')).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(page.locator('.skk-committed')).toContainText('く')
  })
})
