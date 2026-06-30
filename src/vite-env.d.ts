/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __APP_COMMIT__: string

interface Window {
  gtag?: (...args: unknown[]) => void
}
