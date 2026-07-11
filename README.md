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
App  (state: password, copied, length, uppercase, lowercase, numbers, symbols)
├── PasswordDisplay   ← password, copied, onCopy, onRegenerate
├── PasswordOptions   ← length, toggles, setters
│   ├── LengthSlider  ← value, onChange
│   └── ToggleGroup   ← toggles[]
└── StrengthMeter     ← score
```

**Generation pipeline:**

1. User toggles options → `App` state updates → `generate` `useCallback` identity changes
2. `useEffect` watching `generate` fires → calls `generatePassword(length, options)`
3. New password stored via `setPassword` → re-render triggers
4. `calculatePasswordStrength(password)` runs inline → `StrengthMeter` receives updated `score`

## File Walkthrough

### `vite.config.js`

Three plugins compose the build:

- **`@vitejs/plugin-react`** — JSX transform, Fast Refresh
- **`@tailwindcss/vite`** — Tailwind v4 JIT engine (no config file needed)
- **`vite-plugin-pwa`** — generates a Workbox service worker at build time that precaches all JS, CSS, HTML, and SVG assets (11 entries, ~230 KB). The manifest declares standalone display, dark theme color, and SVG icons.

PWA `registerType: 'autoUpdate'` means the service worker installs and activates in the background whenever the user refreshes — no prompt.

### `index.html`

Meta tags for PWA:

- `theme-color` matches the dark background (`#030712`)
- `apple-mobile-web-app-capable` enables full-screen on iOS
- The title and favicon reference the SVG icon

### `src/index.css`

A single line — Tailwind v4 imports via `@import "tailwindcss"`. No custom CSS anywhere in the project.

### `src/main.jsx`

Standard Vite + React entry. Wraps `<App>` in `<StrictMode>` so hooks fire twice in dev to surface side-effect bugs.

### `src/App.jsx`

**State.** Seven pieces of state: `password`, `copied`, `length` (default 16), and four booleans for character sets. A `timerRef` (`useRef`) tracks the copy-confirmation timeout. `copied` and any pending timer reset whenever `password` changes via a `useEffect`.

**Generation.** The `generate` callback is wrapped in `useCallback` with all relevant state in its dependency array. A new function identity is created whenever length or any toggle changes, which triggers the `useEffect` to call it. There's no manual "generate on load" logic — the effect handles both initial mount and incremental changes.

**Copy.** `handleCopy` writes to `navigator.clipboard`, sets `copied = true`, and schedules `setCopied(false)` after 2 seconds. Any previously pending timer is cleared first (`clearTimeout(timerRef.current)`) to prevent overlapping timeouts. A cleanup `useEffect` also clears the timer on unmount. If the clipboard API is unavailable (HTTP, not HTTPS), it silently fails.

**Security wipe.** `useSecurityWipe(handleWipe)` is subscribed to `visibilitychange`. When the tab is hidden, it clears `password` and `copied`, and makes a best-effort attempt to clear the clipboard.

```jsx
useSecurityWipe(
  useCallback(() => {
    setPassword('');
    setCopied(false);
    navigator.clipboard.writeText('').catch(() => {});
  }, [])
);
```

The wipe callback is memoized with an empty dependency array — it never changes identity, so `useSecurityWipe` registers the listener once and removes it on unmount.

**Layout.** A full-viewport centered card using `bg-gray-950` / `bg-gray-900` / `border-gray-800`. Everything is a single column with `space-y-6`.

### `src/utils/crypto.js`

```js
export function cryptoRandomInt(max) {
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
generatePassword(length, { uppercase, lowercase, numbers, symbols })
```

**Step 1 — Build pool and guarantee coverage.** For each enabled character class, the class's characters are appended to `pool` and one random character from that class is pushed into `required`. This ensures the output always contains at least one character from every selected category.

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
  { label: 'Medium', color: 'bg-yellow-500', min: 3 },
  { label: 'Strong', color: 'bg-lime-500', min: 5 },
  { label: 'Very Strong', color: 'bg-emerald-500', min: 7 },
];
```

`LEVELS` is imported by both `calculatePasswordStrength` (to map score → label) and `StrengthMeter.jsx` (to map score → bar color). Single source of truth — editing one place updates both.

**Scoring.** The score is the sum of:

- **Length:** +1 at 8, 12, 16, 24, 32 characters (max +5)
- **Diversity:** +1 each for containing uppercase, lowercase, digits, symbols (max +4)

Total range: 0–8. The active level is found via `reduce` — finding the last level whose `min` threshold the score meets or exceeds.

| Score | Label | Bar color |
|---|---|---|
| 0–2 | Weak | red |
| 3–4 | Medium | yellow |
| 5–6 | Strong | lime |
| 7–8 | Very Strong | emerald |

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

Renders the current password in a monospace font at `text-xl` / `sm:text-2xl`. When `password` is empty, shows italic placeholder text. The text is `select-all` so users can manually highlight if they prefer.

Two buttons sit to the right:

- **Copy.** Shows a `Copy` icon normally, switches to a green `Check` + "Copied!" label beneath for 2 seconds after clicking. Disabled when `!password`.
- **Regenerate.** A `RefreshCw` icon that calls `onRegenerate`. Disabled when `!password`.

Both buttons use `bg-gray-700` with `hover:bg-gray-600` transitions.

### `src/components/PasswordOptions.jsx`

Thin compositor that renders the control panel. No logic of its own — just passes props to `LengthSlider` and `ToggleGroup`.

### `src/components/LengthSlider.jsx`

A standard `<input type="range">` range 8–64 with:

- Label on the left, current value in `tabular-nums` on the right
- WebKit and Firefox thumb styles via Tailwind's arbitrary variant syntax (`[&::-webkit-slider-thumb]:...`)
- Accent color set to `indigo-500`

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

Imports `LEVELS` from `strength.js` (no duplicate definition). Four rounded bars in a row. Each bar's color is determined by whether its index falls within the active range. The active range is calculated via `reduce` — finding the last level whose `min` threshold the score meets or exceeds.

A text label below reads "Strength: {label}".

## Security

| Concern | Mitigation |
|---|---|
| Weak PRNG | `crypto.getRandomValues` backed by kernel entropy sources |
| Modulo bias | Rejection sampling in `cryptoRandomInt` |
| Predictable shuffling | Fisher-Yates with CSPRNG indices |
| Clipboard leakage | Password cleared + clipboard wiped on tab blur |
| No secure context | Clipboard API silently degrades; generation still works |

## PWA

The app is a fully offline-capable Progressive Web App:

- **Service worker** generated by Workbox via `vite-plugin-pwa` (mode: `generateSW`)
- **Precached assets:** 11 entries (~230 KB) — JS, CSS, HTML, SVG icons
- **Manifest:** standalone display, dark background/theme, SVG icons at 192 and 512
- **Registration:** `autoUpdate` — updates install silently on next visit

`npm run build` produces the service worker (`dist/sw.js`), workbox runtime (`dist/workbox-*.js`), and manifest (`dist/manifest.webmanifest`).

## Running

```bash
npm run dev      # dev server with HMR
npm run build    # production build + PWA service worker
npm run lint     # oxlint (0 warnings, 0 errors)
npm run preview  # serve the production build locally
```
