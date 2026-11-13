// Random helpers.

// Shuffle a copy of a list (Fisher–Yates).
export function shuffle(list, random = Math.random) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// A "seeded" random number generator: the same seed always gives the
// same sequence of numbers. The daily challenge uses today's date as the
// seed, so everyone gets the same matchup on the same day.
// (Algorithm: mulberry32 – a tiny, well-known generator.)
export function seededRandom(seedText) {
  let seed = 0
  for (const ch of seedText) seed = (Math.imul(seed, 31) + ch.charCodeAt(0)) | 0
  return function random() {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Today's date as 'YYYY-MM-DD' in the user's own time zone.
export function todayString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
