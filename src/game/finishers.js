// Finishing moves ("Snackalities"). Each winner gets the finisher that
// matches its strongest attack type, so the finisher also says something
// about the snack: a sugary winner buries the loser in candy, and so on.
//
// For each finisher:
//   particle / pattern -> what the FinisherFX component draws
//   loser              -> how the losing fighter is animated (Motion keyframes)

export const FINISHERS = {
  sugar: {
    name: 'SUGAR CRASH',
    text: 'buries its opponent under an avalanche of candy',
    particles: ['🍬', '🍭', '🍩'],
    pattern: 'rain',
    loser: { scaleY: [1, 1, 0.12], y: [0, 0, 60], filter: ['hue-rotate(0deg)', 'hue-rotate(160deg)', 'hue-rotate(300deg)'] },
  },
  salt: {
    name: 'SALT MINE',
    text: 'crystallises its opponent and shatters it into pieces',
    particles: ['💎', '🧂', '✨'],
    pattern: 'burst',
    loser: { filter: ['saturate(1) brightness(1)', 'saturate(0) brightness(2)', 'saturate(0) brightness(2)'], opacity: [1, 1, 0], scale: [1, 1.05, 1.3] },
  },
  fat: {
    name: 'DEEP FRY',
    text: 'drops its opponent into the deep fryer – extra crispy',
    particles: ['🔥', '🔥', '💨'],
    pattern: 'rise',
    loser: { filter: ['sepia(0)', 'sepia(1) saturate(3) brightness(.8)', 'sepia(1) saturate(4) brightness(.3)'], rotate: [0, -6, 6], opacity: [1, 1, 0.2] },
  },
  protein: {
    name: 'GAINS SLAM',
    text: 'flattens its opponent with one giant flex',
    particles: ['💪'],
    pattern: 'slam',
    loser: { scaleY: [1, 1, 0.1], scaleX: [1, 1, 1.6], y: [0, 0, 70] },
  },
  fiber: {
    name: 'ROUGHAGE ROUNDHOUSE',
    text: 'kicks its opponent clean out of the arena',
    particles: ['🌾', '🌿', '🍃'],
    pattern: 'whirl',
    loser: { x: [0, 0, 900], y: [0, -40, -300], rotate: [0, 0, 1080] },
  },
  basic: {
    name: 'TOTAL CRUMBLE',
    text: 'reduces its opponent to a pile of crumbs',
    particles: ['🍪', '🟫', '🟤'],
    pattern: 'burst',
    loser: { opacity: [1, 1, 0], scale: [1, 0.9, 0.2] },
  },
}

// Pick the finisher for a fighter: the type of its strongest real attack.
export function getFinisher(fighter) {
  const best = fighter.moves
    .filter((m) => m.type !== 'basic')
    .sort((a, b) => b.power - a.power)[0]
  return FINISHERS[best?.type] ?? FINISHERS.basic
}

// The input combo the player must enter, e.g. ['↑', '→', '↓', '←'].
const KEYS = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']
export const ARROWS = { ArrowUp: '↑', ArrowRight: '→', ArrowDown: '↓', ArrowLeft: '←' }

export function randomCombo(length = 4) {
  return Array.from({ length }, () => KEYS[Math.floor(Math.random() * KEYS.length)])
}
