import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const appVersion = execSync('git describe --tags --abbrev=0').toString().trim()
const appCommit = execSync('git rev-parse --short HEAD').toString().trim()

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
