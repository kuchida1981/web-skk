## Code Review

This pull request integrates Google Analytics 4 (GA4) into the application by adding the gtag.js snippet to `index.html`, introducing a type-safe `analytics.ts` wrapper, and tracking key user interactions such as mode switches, dictionary loading states, and game events. The review feedback focuses on improving TypeScript safety and React performance: it suggests checking `typeof gtag === 'function'` to avoid potential compilation errors on the `Window` interface, and recommends narrowing down dependency arrays in `useEffect` and `useCallback` hooks (specifically for `dictState` and the `game` object) to prevent redundant executions and unnecessary callback recreations.

> [!IMPORTANT]
> The [consumer version of Gemini Code Assist on GitHub](https://developers.google.com/gemini-code-assist/docs/review-repo-code) is being sunset. Starting **June 18, 2026**, new organization installations will be blocked, and all code review activity will officially cease on **July 17, 2026**.
> For more details on the timeline and next steps, please review the [Help Documentation](https://developers.google.com/gemini-code-assist/docs/deprecations/consumer-code-review).
