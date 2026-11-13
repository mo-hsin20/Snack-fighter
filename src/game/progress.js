// Story mode progress, saved in the browser's localStorage so players
// keep their unlocked endings when they come back later.
// localStorage can be blocked (private mode, strict settings), so every
// access is wrapped in try/catch – the game still works, it just forgets.

const KEY = 'snackfighter-progress'

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return { cleared: saved?.cleared ?? [] }
  } catch {
    return { cleared: [] }
  }
}

export function markCleared(characterId) {
  const progress = loadProgress()
  if (!progress.cleared.includes(characterId)) progress.cleared.push(characterId)
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // storage blocked – ignore
  }
  return progress
}
