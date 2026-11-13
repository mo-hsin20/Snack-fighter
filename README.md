# 🥊 Snack Fighter

Pick two snacks and watch them fight — with health, attacks and special moves
calculated from real nutrition data from the [Open Food Facts](https://world.openfoodfacts.org) API.

**Live app:** https://mo-hsin20.github.io/Snack-fighter/

## Screens

| Route | Screen | Purpose |
|---|---|---|
| `/` | Title screen | Arcade-style intro – press Enter or tap to start |
| `/select` | Pick fighters | Search snacks or browse categories and choose one for each corner |
| `/battle` | Battle | The two snacks fight, turn by turn, with animations and sound |
| `/product/:barcode` | Fighter profile | A snack's scores, game stats, nutrient chart and move list |
| `/product/:barcode?vs=:other` | Tale of the tape | Two snacks side by side, with a predicted win chance |
| `/snackverse` | The Snackverse | Story mode: fighters from other realities, unlockable endings |
| `/snackverse/:id` | Story run | Prologue → 4-stage ladder (rival + final boss) → ending |
| `/tournament` | The Crisper Cup | 8-fighter knockout bracket; your matches are played, the rest simulated |
| `/daily` | Daily Challenge | One matchup + twist per day (seeded by the date), with a daily streak |
| `/hall-of-fame` | Hall of Fame | Your record, top fighters and 11 achievements |

## Tech

- **React** + **Vite**
- **React Router** – navigation between screens
- **React-Bootstrap / Bootstrap 5** – layout and UI components
- **Motion** (`motion/react`) – intro, hit, K.O. and banner animations
- **canvas-confetti** – winner celebration
- **Recharts** – nutrient comparison chart on the profile screen
- **html5-qrcode** – scan a snack's barcode with the phone camera
- **Open Food Facts API** – product and nutrition data (no API key needed)

## How the battle works

The rules live in `src/game/battleEngine.js` (plain JavaScript, no React):

| Real data | Game effect |
|---|---|
| Nutri-Score A–E | Starting HP and defense |
| Sugar, salt, fat | Strong attacks that also hurt the attacker |
| Protein, fiber | Clean attacks with no self-damage |
| 5+ additives | Poisoned: loses HP every turn |
| NOVA 4 (ultra-processed) | Takes 10 % extra damage |
| Eco-Score A–B | Green Shield blocks the first hit |
| Below 30 % HP | Rage: hits 35 % harder |

The whole fight is calculated first; the Battle screen then replays it turn by turn.

**Play or watch:** choose *I choose the moves* to pick P1's attacks yourself (buttons or
keys 1–6), or *Just watch*. Both use the same engine: `startBattle()` + `playTurn()`;
`simulateBattle()` simply plays every turn at once.

**Finishing moves:** when a fight ends, *FINISH THEM!* appears. Enter the arrow combo
(keyboard arrows or the on-screen pad) before time runs out to trigger the winner's
"Snackality" – chosen by its strongest nutrient (`src/game/finishers.js`).

## Story mode – the Snackverse

Ten fighters from other realities (plus a secret boss) compete for one wish from the
Fridge Light. Each has a prologue, a rival and an ending. Cleared stories are saved in
`localStorage`; clearing all ten reveals the true ending. Story characters are defined in
`src/data/snackverse.js` in the same shape as API products, so the same battle engine runs them.

## Other features

- Tekken-style VS splash before every fight, nameplates and a "YOU" tag
- Shareable result image drawn with the Canvas API (share, download or copy text)
- Original chiptune background music (Web Audio API) with a volume slider
- Picked fighters, settings, stats and story progress are saved in `localStorage`
- Charts and the barcode scanner are lazy-loaded to keep the first load small
- Accessibility: skip link, visible focus rings, ARIA labels, keyboard controls,
  and animations respect the system "reduce motion" setting
- An error boundary shows a "Game over – restart" screen instead of a blank page

## About the API

Open Food Facts' search endpoint (`/cgi/search.pl`) is often overloaded and answers
*503* to many requests. The app retries automatically, and the barcode endpoint
(`/api/v2/product/:code.json`) – which is much more reliable – powers the
barcode scanner and the "classic fighters" buttons as a fallback.

## Running locally

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Building and deploying

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
npm run deploy    # build and publish dist/ to the gh-pages branch
```

After the first `npm run deploy`, go to the repository's **Settings → Pages**
and set the source to the `gh-pages` branch.
