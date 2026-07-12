# AGENTS.md

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build + PWA service worker generation
npm run lint      # oxlint (NOT ESLint — no .eslintrc exists)
npm run preview   # Serve production build locally
npm test          # Vitest unit + component tests
npm run test:watch  # Vitest watch mode
npm run test:e2e  # Playwright e2e tests
```

## Testing

- **Unit/Component tests:** Vitest + React Testing Library + jsdom (9 files, 55 tests)
- **E2E tests:** Playwright (run `npm run test:e2e` with dev server)
- Test setup: `src/test-setup.js` imports jest-dom matchers and auto-cleanup
- Config: test settings in `vite.config.js` under `test` key
- Linter: jsx-a11y plugin now active — catches a11y regressions at lint time

## Toolchain

- **Linter:** oxlint (`.oxlintrc.json`) — plugins: `react`, `oxc`. Rules enforce hooks rules and component exports only.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. No `tailwind.config.js` — config is zero-config by design. All styling is utility classes in JSX.
- **PWA:** `vite-plugin-pwa` with `registerType: 'autoUpdate'` and Workbox `generateSW`. Build produces `dist/sw.js`, `dist/workbox-*.js`, and `dist/manifest.webmanifest`.
- **Entry:** `index.html` → `src/main.jsx` → `src/App.jsx`.

## Critical Invariants

- **Never replace `cryptoRandomInt` with `Math.random()`.** All randomness must go through `src/utils/crypto.js` which uses `crypto.getRandomValues`. This is a security-critical app.
- Fisher-Yates shuffle in `src/utils/generator.js` uses CSPRNG indices — do not simplify with `sort(() => Math.random())`.

## Code Structure

- All state lives in `App.jsx` and flows down as props — no context, no state management library.
- `src/utils/strength.js` exports `LEVELS` (score thresholds + labels + colors) used by both `calculatePasswordStrength` and `StrengthMeter.jsx`.
