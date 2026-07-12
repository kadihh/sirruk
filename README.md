# sirruk

A minimalist, cryptographically secure password generator built with React, Vite, and Tailwind CSS. Runs entirely in the browser — no server, no telemetry.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Icons | lucide-react |
| PWA | vite-plugin-pwa (Workbox) |
| Linter | oxlint |

## Project Structure

```
src/
├── App.jsx                         # Root: state hub, layout, security wipe
├── index.css                       # @import "tailwindcss"
├── main.jsx                        # Entry point (StrictMode)
├── components/
│   ├── PasswordDisplay.jsx         # Mono display + Copy/Regen buttons
│   ├── PasswordOptions.jsx         # Composes slider + toggles
│   ├── LengthSlider.jsx            # Range input 8–64
│   ├── ToggleGroup.jsx             # 4 pill toggles (A-Z, a-z, 0-9, symbols)
│   └── StrengthMeter.jsx           # 4-segment strength bar
└── utils/
    ├── crypto.js                   # CSPRNG via crypto.getRandomValues
    ├── generator.js                # Password generation + Fisher-Yates shuffle
    ├── strength.js                 # Real-time strength scoring
    └── useSecurityWipe.js          # Clears state on tab blur
```

## Architecture & Data Flow

All application state lives in `App.jsx` and flows downward as props:

```
App  (state: password, copied, copyFailed, insecure, length, uppercase, lowercase, numbers, symbols, excludeAmbiguous)
├── PasswordDisplay   ← password, copied, copyFailed, emptyMessage, onCopy, onRegenerate
├── PasswordOptions   ← length, toggles, setters, excludeAmbiguous
│   ├── LengthSlider  ← value, onChange
│   └── ToggleGroup   ← toggles[]
└── StrengthMeter     ← entropy, label
```

**Generation pipeline:**

1. User toggles options → `App` state updates → `generate` `useCallback` identity changes
2. `useEffect` watching `generate` fires → calls `generatePassword(length, options)`
3. New password stored via `setPassword` → re-render triggers
4. `calculatePasswordStrength(password)` runs inline → `StrengthMeter` receives updated `entropy` and `label`

## File Walkthrough

### `vite.config.js`

Three plugins compose the build:

- **`@vitejs/plugin-react`** — JSX transform, Fast Refresh
- **`@tailwindcss/vite`** — Tailwind v4 JIT engine (no config file needed)
- **`vite-plugin-pwa`** — generates a Workbox service worker at build time that precaches all JS, CSS, HTML, and SVG assets. The manifest declares standalone display, dark theme color, SVG icons, and a maskable icon entry.

PWA `registerType: 'autoUpdate'` means the service worker installs and activates in the background whenever the user refreshes — no prompt.

### `index.html`

Meta tags for PWA and security:

- `theme-color` matches the dark background (`#030712`)
- `apple-mobile-web-app-capable` enables full-screen on iOS
- Content Security Policy: `script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'`
- Open Graph and Twitter Card meta tags for social sharing
- `<noscript>` fallback for users with JavaScript disabled
- The title and favicon reference the SVG icon

### `src/index.css`

Two things:

- `@import "tailwindcss"` — Tailwind v4 imports via the Vite plugin. No custom CSS classes anywhere in the project.
- Global `prefers-reduced-motion: reduce` rule that disables all transitions and animations for users who prefer reduced motion.

### `src/main.jsx`

Standard Vite + React entry. Wraps `<App>` in `<StrictMode>` so hooks fire twice in dev to surface side-effect bugs.

### `src/App.jsx`

**State.** Nine pieces of state: `password`, `copied`, `copyFailed`, `insecure`, `length` (default 16), `excludeAmbiguous`, and three booleans for character sets. A `timerRef` (`useRef`) tracks the copy-confirmation timeout. `copied`/`copyFailed` and any pending timer reset whenever `password` changes via a `useEffect`.

**Generation.** The `generate` callback is wrapped in `useCallback` with all relevant state in its dependency array. A new function identity is created whenever length or any toggle changes, which triggers the `useEffect` to call it. There's no manual "generate on load" logic — the effect handles both initial mount and incremental changes.

**Copy.** `handleCopy` writes to `navigator.clipboard`, sets `copied = true`, and schedules `setCopied(false)` after 2 seconds. If the clipboard API fails, `copyFailed = true` with a 3-second timeout. Any previously pending timer is cleared first (`clearTimeout(timerRef.current)`) to prevent overlapping timeouts. A cleanup `useEffect` also clears the timer on unmount.

**Security wipe.** `useSecurityWipe(handleWipe)` is subscribed to `visibilitychange`. When the tab is hidden, it clears `password` and `copied`, and makes a best-effort attempt to clear the clipboard. A separate `beforeunload` listener also wipes the clipboard when the page is closed.

**HTTPS detection.** On mount, checks `location.protocol` — if not HTTPS (and not localhost), sets `insecure = true` to show a warning banner about clipboard API availability.

**Auto-regenerate.** When the tab becomes visible again, `generate()` is called to produce a fresh password, replacing the one that was cleared by the security wipe.

```jsx
useSecurityWipe(
  useCallback(() => {
    setPassword('');
    setCopied(false);
    setCopyFailed(false);
    navigator.clipboard.writeText('').catch(() => {});
  }, [])
);
```

The wipe callback is memoized with an empty dependency array — it never changes identity, so `useSecurityWipe` registers the listener once and removes it on unmount.

**Layout.** A full-viewport centered card using `bg-gray-950` / `bg-gray-900` / `border-gray-800`. Everything is a single column with `space-y-6`.

### `src/utils/crypto.js`

```js
export function cryptoRandomInt(max) {
  if (max <= 0 || !Number.isInteger(max)) throw new RangeError('max must be a positive integer');
  const array = new Uint32Array(1);
  const maxValid = 0xFFFFFFFF - (0xFFFFFFFF % max);
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= maxValid);
  return array[0] % max;
}
```

This is the project's only source of randomness. No `Math.random()` is used anywhere.

`crypto.getRandomValues` fills a `Uint32Array` with cryptographically secure random bytes. The naive approach (`array[0] % max`) introduces modulo bias when `max` does not evenly divide `2³²`. Rejection sampling discards values in the partial remainder region to guarantee a perfectly uniform distribution.

### `src/utils/generator.js`

```js
generatePassword(length, { uppercase, lowercase, numbers, symbols, excludeAmbiguous })
```

**Step 1 — Build pool and guarantee coverage.** For each enabled character class, the class's characters are appended to `pool` and one random character from that class is pushed into `required`. If `excludeAmbiguous` is true, `|` and `;` are filtered from the symbol pool. This ensures the output always contains at least one character from every selected category.

**Step 2 — Fill.** `required` characters are placed first, then the remaining slots are filled from `pool`.

**Step 3 — Fisher-Yates shuffle.** The array is shuffled in-place using cryptographically random indices. Fisher-Yates guarantees that every permutation is equally likely, unlike naive `sort(() => Math.random() - 0.5)` which produces biased orderings.

The shuffle iterates from the end of the array, swapping each element with a random earlier element. This runs in O(n) and is unbiased.

```js
for (let i = result.length - 1; i > 0; i--) {
  const j = cryptoRandomInt(i + 1);
  [result[i], result[j]] = [result[j], result[i]];
}
```

### `src/utils/strength.js`

Exports the `LEVELS` array and the `calculatePasswordStrength` function.

```js
export const LEVELS = [
  { label: 'Weak', color: 'bg-red-500', min: 0 },
  { label: 'Medium', color: 'bg-yellow-500', min: 29 },
  { label: 'Strong', color: 'bg-lime-500', min: 36 },
  { label: 'Very Strong', color: 'bg-emerald-500', min: 60 },
];
```

`LEVELS` is imported by both `calculatePasswordStrength` (to map entropy → label) and `StrengthMeter.jsx` (to map entropy → bar color). Single source of truth — editing one place updates both.

**Scoring.** Strength is calculated from entropy (bits), not length or diversity:

1. Detect the character pool size from the password (e.g. lowercase only = 26, mixed case = 52, all classes = 95)
2. Entropy = `password.length × log2(poolSize)`
3. Map entropy to a level via the `LEVELS` thresholds

| Entropy (bits) | Label | Bar color |
|---|---|---|
| 0–28 | Weak | red |
| 29–35 | Medium | yellow |
| 36–59 | Strong | lime |
| 60+ | Very Strong | emerald |

A crack-time estimate is also displayed: `2^entropy ÷ 10 billion guesses/sec ÷ 2` (average case).

### `src/utils/useSecurityWipe.js`

A React hook that listens for `document.visibilitychange`. When `document.hidden` becomes true (user switched tabs or minimized the window), the provided callback fires. The hook cleans up the event listener on unmount.

```js
export function useSecurityWipe(onWipe) {
  useEffect(() => {
    const handle = () => {
      if (document.hidden) onWipe();
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [onWipe]);
}
```

The callback in `App.jsx` also attempts `navigator.clipboard.writeText('')` to clear any copied password from the system clipboard — a defense against clipboard-harvesting malware and shoulder-surfing.

### `src/components/PasswordDisplay.jsx`

Renders the current password in a monospace font. Font size adapts to password length: `text-xl`/`sm:text-2xl` for shorter passwords, `text-base`/`sm:text-lg` for passwords longer than 32 characters. When `password` is empty, shows italic placeholder text or a custom `emptyMessage`. The text is `select-all` so users can manually highlight if they prefer.

Two buttons sit to the right:

- **Copy.** Shows a `Copy` icon normally, switches to a green `Check` + "Copied!" label beneath for 2 seconds after clicking. On clipboard failure, shows a red `AlertCircle` with an error message for 3 seconds. Disabled when `!password`.
- **Regenerate.** A `RefreshCw` icon that calls `onRegenerate`. Disabled when `!password`.

Both buttons use `bg-gray-700` with `hover:bg-gray-600` transitions.

### `src/components/PasswordOptions.jsx`

Thin compositor that renders the control panel: the length slider, four charset toggles, and an "Exclude ambiguous symbols" checkbox (visible when symbols are enabled). Passes props to `LengthSlider` and `ToggleGroup`.

### `src/components/LengthSlider.jsx`

A range slider (8–64) with a linked number input for direct value entry:

- Label on the left, `<input type="number">` on the right in `tabular-nums`
- WebKit and Firefox thumb styles via Tailwind's arbitrary variant syntax (`[&::-webkit-slider-thumb]:...`)
- Accent color set to `indigo-500`
- `aria-label` on the number input for screen reader access

### `src/components/ToggleGroup.jsx`

Renders four toggles in a 2×2 grid. Each toggle is a `<label>` wrapping:

1. A visually hidden `<input type="checkbox" className="sr-only peer">`
2. A styled `<div>` that uses `peer-checked:` to toggle colors and slide the circular knob via `after:translate-x-4`

```jsx
<input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
<div className="w-9 h-5 bg-gray-600 rounded-full peer-checked:bg-indigo-500 transition-colors
  after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4
  after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
```

The `peer` utility is a Tailwind feature that styles a sibling based on the input's `:checked` state, eliminating the need for a separate state indicator.

### `src/components/StrengthMeter.jsx`

Imports `LEVELS` from `strength.js` (no duplicate definition). Four rounded bars in a row. Each bar's color is determined by whether its index falls within the active range. The active range is calculated via `getActiveLevel(entropy)` — finding the last level whose `min` threshold the entropy meets or exceeds.

Also displays the crack-time estimate below the label.

## Security

| Concern | Mitigation |
|---|---|
| Weak PRNG | `crypto.getRandomValues` backed by kernel entropy sources |
| Modulo bias | Rejection sampling in `cryptoRandomInt` |
| Predictable shuffling | Fisher-Yates with CSPRNG indices |
| Clipboard leakage | Password cleared + clipboard wiped on tab blur and page unload |
| No secure context | HTTPS warning banner; clipboard API silently degrades |
| Script injection | CSP header: `script-src 'self'; object-src 'none'; base-uri 'self'` |
| Ambiguous characters | Optional exclusion of `|` and `;` from symbol pool |
| Password in memory | Security wipe clears React state + clipboard on visibility change |

## PWA

The app is a fully offline-capable Progressive Web App:

- **Service worker** generated by Workbox via `vite-plugin-pwa` (mode: `generateSW`)
- **Precached assets:** JS, CSS, HTML, SVG icons
- **Manifest:** standalone display, dark background/theme, SVG icons at 192, 512 (maskable), and apple-touch-icon
- **Registration:** `autoUpdate` — updates install silently on next visit

`npm run build` produces the service worker (`dist/sw.js`), workbox runtime (`dist/workbox-*.js`), and manifest (`dist/manifest.webmanifest`).

## Running

```bash
npm run dev      # dev server with HMR
npm run build    # production build + PWA service worker
npm run lint     # oxlint (0 warnings, 0 errors)
npm run preview  # serve the production build locally
```
