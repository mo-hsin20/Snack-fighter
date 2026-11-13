// Tiny retro sound effects, made with the browser's built-in Web Audio API.
// No sound files are needed: each sound is a short beep whose pitch slides.

let ctx = null
let muted = readMuted()

function readMuted() {
  try { return localStorage.getItem('sf-muted') === '1' } catch { return false }
}

export function isMuted() { return muted }

export function setMuted(value) {
  muted = value
  try { localStorage.setItem('sf-muted', value ? '1' : '0') } catch { /* storage blocked – ignore */ }
}

// type: 'square' | 'sawtooth' | 'triangle' | 'sine'
function beep({ from, to, duration, type = 'square', volume = 0.15, delay = 0 }) {
  if (muted) return
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, start)
    osc.frequency.exponentialRampToValueAtTime(to, start + duration)
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration)
  } catch {
    // Audio not available (old browser) – the game works without sound.
  }
}

export const sfx = {
  start: () => { beep({ from: 440, to: 880, duration: 0.12 }); beep({ from: 660, to: 1320, duration: 0.2, delay: 0.12 }) },
  select: () => beep({ from: 600, to: 900, duration: 0.08, volume: 0.08 }),
  hit: () => beep({ from: 220, to: 60, duration: 0.18, type: 'sawtooth' }),
  crit: () => { beep({ from: 300, to: 50, duration: 0.3, type: 'sawtooth', volume: 0.22 }); beep({ from: 1200, to: 400, duration: 0.15, delay: 0.05 }) },
  block: () => beep({ from: 900, to: 1100, duration: 0.15, type: 'triangle' }),
  fight: () => { beep({ from: 330, to: 330, duration: 0.15 }); beep({ from: 660, to: 990, duration: 0.35, delay: 0.15 }) },
  ko: () => { beep({ from: 400, to: 40, duration: 0.9, type: 'sawtooth', volume: 0.25 }) },
  wrong: () => beep({ from: 200, to: 120, duration: 0.3, type: 'square' }),
  finishThem: () => [0, 0.25, 0.5].forEach((d, i) => beep({ from: 180 - i * 30, to: 90 - i * 15, duration: 0.22, type: 'sawtooth', volume: 0.25, delay: d })),
  finisher: () => { beep({ from: 900, to: 30, duration: 1.2, type: 'sawtooth', volume: 0.25 }); beep({ from: 60, to: 30, duration: 1.4, type: 'square', volume: 0.2, delay: 0.9 }) },
  portal: () => [0, 0.1, 0.2, 0.3, 0.4].forEach((d, i) => beep({ from: 300 + i * 150, to: 1200 + i * 200, duration: 0.25, type: 'sine', volume: 0.1, delay: d })),
  win: () => [523, 659, 784, 1046].forEach((f, i) => beep({ from: f, to: f, duration: 0.18, type: 'triangle', delay: i * 0.15 })),
}
