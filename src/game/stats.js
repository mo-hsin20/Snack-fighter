// Hall of Fame: fight history and achievements, saved in localStorage.
// Like progress.js, every storage access is wrapped in try/catch.

const KEY = 'snackfighter-stats'

const EMPTY = {
  fights: 0,
  snackalities: 0,
  playerWins: 0,       // fights the player controlled (or was assigned) and won
  playerLosses: 0,
  streak: 0,           // current win streak of the player
  bestStreak: 0,
  tournamentsWon: 0,
  dailyWins: [],       // dates ('2026-10-31') of won daily challenges
  fighters: {},        // id -> { name, emoji, image, wins, losses }
  achievements: [],    // ids of unlocked achievements
}

export function loadStats() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) }
  } catch {
    return { ...EMPTY }
  }
}

function save(stats) {
  try { localStorage.setItem(KEY, JSON.stringify(stats)) } catch { /* storage blocked */ }
}

// All achievements. `check` gets the stats (and the latest fight) and
// returns true when the achievement should unlock.
export const ACHIEVEMENTS = [
  { id: 'first-fight', icon: '🥊', name: 'First Bite', text: 'Finish your first fight.', check: (s) => s.fights >= 1 },
  { id: 'ten-fights', icon: '🔟', name: 'Regular Customer', text: 'Finish 10 fights.', check: (s) => s.fights >= 10 },
  { id: 'fifty-fights', icon: '🏟️', name: 'Arena Veteran', text: 'Finish 50 fights.', check: (s) => s.fights >= 50 },
  { id: 'snackality', icon: '💀', name: 'Snackality!', text: 'Perform a finishing move.', check: (s) => s.snackalities >= 1 },
  { id: 'five-snackalities', icon: '☠️', name: 'Merciless', text: 'Perform 5 finishing moves.', check: (s) => s.snackalities >= 5 },
  { id: 'streak-3', icon: '🔥', name: 'On Fire', text: 'Win 3 of your fights in a row.', check: (s) => s.bestStreak >= 3 },
  { id: 'streak-10', icon: '🌋', name: 'Unstoppable', text: 'Win 10 of your fights in a row.', check: (s) => s.bestStreak >= 10 },
  { id: 'underdog', icon: '🐶', name: 'Underdog', text: 'Win your fight with a worse Nutri-Score than the opponent.', check: (s, f) => f?.underdog },
  { id: 'champion', icon: '🏆', name: 'Crisper Cup Champion', text: 'Win a tournament.', check: (s) => s.tournamentsWon >= 1 },
  { id: 'daily', icon: '📅', name: 'Daily Diner', text: 'Win a daily challenge.', check: (s) => s.dailyWins.length >= 1 },
  { id: 'daily-3', icon: '🗓️', name: 'Three-Course Streak', text: 'Win daily challenges on 3 days.', check: (s) => s.dailyWins.length >= 3 },
]

const GRADES = ['a', 'b', 'c', 'd', 'e']

// Called by the Arena when a fight is decided.
// Returns the list of achievements unlocked by this fight.
export function recordFight({ winner, finished, fighters, player }) {
  const stats = loadStats()
  const loser = winner === 'left' ? 'right' : 'left'
  stats.fights += 1
  if (finished && (!player || winner === player)) stats.snackalities += 1

  // Win/loss record for every fighter
  for (const side of ['left', 'right']) {
    const snack = fighters[side].snack
    const entry = stats.fighters[snack.barcode] ?? { name: snack.name, emoji: snack.emoji ?? null, image: snack.thumb ?? null, wins: 0, losses: 0 }
    if (side === winner) entry.wins += 1
    else entry.losses += 1
    stats.fighters[snack.barcode] = entry
  }

  // The player's own record (only when the player had a side)
  let underdog = false
  if (player) {
    if (winner === player) {
      stats.playerWins += 1
      stats.streak += 1
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak)
      const mine = GRADES.indexOf(fighters[player].snack.nutriScore)
      const theirs = GRADES.indexOf(fighters[loser].snack.nutriScore)
      underdog = mine > -1 && theirs > -1 && mine > theirs
    } else {
      stats.playerLosses += 1
      stats.streak = 0
    }
  }

  const unlocked = checkAchievements(stats, { underdog })
  save(stats)
  return unlocked
}

export function recordTournamentWin() {
  const stats = loadStats()
  stats.tournamentsWon += 1
  checkAchievements(stats)
  save(stats)
}

export function recordDailyWin(date) {
  const stats = loadStats()
  if (!stats.dailyWins.includes(date)) stats.dailyWins.push(date)
  checkAchievements(stats)
  save(stats)
}

function checkAchievements(stats, fight) {
  const newOnes = ACHIEVEMENTS.filter((a) => !stats.achievements.includes(a.id) && a.check(stats, fight))
  stats.achievements.push(...newOnes.map((a) => a.id))
  return newOnes
}

export function resetStats() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
