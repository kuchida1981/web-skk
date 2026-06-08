import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

function git(cmd: string, fallback: string): string {
  try {
    return execSync(cmd).toString().trim()
  } catch {
    return fallback
  }
}

const appVersion = git('git describe --tags --abbrev=0', 'dev')
const appCommit = git('git rev-parse --short HEAD', 'unknown')

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_COMMIT__: JSON.stringify(appCommit),
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
