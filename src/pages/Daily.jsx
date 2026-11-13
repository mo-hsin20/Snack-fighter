import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Button, Card } from 'react-bootstrap'
import { CHARACTERS, BOSS } from '../data/snackverse.js'
import { seededRandom, shuffle, todayString } from '../game/random.js'
import { loadStats, recordDailyWin } from '../game/stats.js'
import { getControl } from '../game/settings.js'
import Arena from '../components/Arena.jsx'
import ControlToggle from '../components/ControlToggle.jsx'

// Each day has a twist that changes the fighters' stats a little.
// Every twist returns NEW snack objects – the originals are never changed.
const TWISTS = [
  { name: 'Boss Rush', text: 'Your opponent is boosted with +40 HP.', apply: (me, foe) => [me, { ...foe, hpBonus: (foe.hpBonus ?? 0) + 40 }] },
  { name: 'Shields Up', text: 'Both fighters get a Green Shield.', apply: (me, foe) => [{ ...me, ecoScore: 'a' }, { ...foe, ecoScore: 'a' }] },
  { name: 'Toxic Kitchen', text: 'Both fighters are poisoned by additives.', apply: (me, foe) => [{ ...me, additives: 6 }, { ...foe, additives: 6 }] },
  { name: 'Glass Cannon', text: 'You have 30 HP less – end it fast.', apply: (me, foe) => [{ ...me, hpBonus: (me.hpBonus ?? 0) - 30 }, foe] },
  { name: 'Classic Rules', text: 'No twist today. Pure skill.', apply: (me, foe) => [me, foe] },
]

// Count how many days in a row (ending today or yesterday) were won.
function currentStreak(dates) {
  const won = new Set(dates)
  let streak = 0
  const day = new Date()
  if (!won.has(todayString(day))) day.setDate(day.getDate() - 1) // today not played yet is fine
  while (won.has(todayString(day))) {
    streak++
    day.setDate(day.getDate() - 1)
  }
  return streak
}

// Time left until midnight, as "5 h 12 min".
function timeToMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const minutes = Math.floor((midnight - now) / 60000)
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

// Screen: Daily Challenge – one matchup per day, the same for everyone,
// chosen with a random generator seeded by the date.
export default function Daily() {
  const today = todayString()
  const [screen, setScreen] = useState('intro')
  const [attempt, setAttempt] = useState(0)
  const [control, setControlState] = useState(getControl)
  const [stats, setStats] = useState(loadStats)
  const [countdown, setCountdown] = useState(timeToMidnight)

  // Same date -> same seed -> same matchup and twist.
  const challenge = useMemo(() => {
    const random = seededRandom(`snack-fighter-${today}`)
    const [hero, foe] = shuffle([...CHARACTERS, BOSS], random)
    const twist = TWISTS[Math.floor(random() * TWISTS.length)]
    const [me, them] = twist.apply(hero, foe)
    return { hero: me, foe: them, twist }
  }, [today])

  const wonToday = stats.dailyWins.includes(today)
  const streak = currentStreak(stats.dailyWins)

  // Update the countdown every minute.
  useEffect(() => {
    const t = setInterval(() => setCountdown(timeToMidnight()), 60000)
    return () => clearInterval(t)
  }, [])

  function handleWin() {
    recordDailyWin(today)
    setStats(loadStats())
    setScreen('intro')
  }

  if (screen === 'fight') {
    return (
      <Arena
        key={attempt}
        left={challenge.hero}
        right={challenge.foe}
        control={control}
        playerSide="left"
        mode="daily"
        title="DAILY CHALLENGE"
        renderResult={({ winner }) =>
          winner === 'left' ? (
            <Button className="fight-btn" onClick={handleWin}>CLAIM TODAY’S WIN</Button>
          ) : (
            <div className="d-flex justify-content-center gap-2">
              <Button className="fight-btn" onClick={() => setAttempt(attempt + 1)}>TRY AGAIN</Button>
              <Button variant="outline-light" onClick={() => setScreen('intro')}>Back</Button>
            </div>
          )
        }
      />
    )
  }

  return (
    <Container className="pb-5" style={{ maxWidth: 760 }}>
      <h1 className="arcade-title display-title text-center mb-1">DAILY CHALLENGE</h1>
      <p className="text-center text-body-secondary">{today} · new challenge in {countdown}</p>

      <Card className="stats-panel daily-card my-4">
        <Card.Body className="text-center">
          <div className="daily-matchup">
            <div><span className="daily-emoji" aria-hidden="true">{challenge.hero.emoji}</span><div className="fw-bold">{challenge.hero.name}</div><small>You</small></div>
            <div className="vs-badge">VS</div>
            <div><span className="daily-emoji" aria-hidden="true">{challenge.foe.emoji}</span><div className="fw-bold">{challenge.foe.name}</div><small>Opponent</small></div>
          </div>
          <div className="daily-twist mt-3">
            <span className="arcade-label">TODAY’S TWIST: {challenge.twist.name.toUpperCase()}</span>
            <p className="mb-0 mt-1">{challenge.twist.text}</p>
          </div>
        </Card.Body>
      </Card>

      <div className="text-center">
        {wonToday ? (
          <p className="lead text-success">✓ You beat today’s challenge! Come back tomorrow.</p>
        ) : (
          <>
            <div className="mb-3"><ControlToggle id="daily-control" onChange={setControlState} /></div>
            <Button className="fight-btn" size="lg" onClick={() => setScreen('fight')}>FIGHT!</Button>
          </>
        )}
        <p className="mt-4 mb-1">🔥 Daily streak: <strong>{streak}</strong> {streak === 1 ? 'day' : 'days'}</p>
        <p className="small text-body-secondary">Total daily wins: {stats.dailyWins.length} · <Link to="/hall-of-fame">Hall of Fame</Link></p>
      </div>
    </Container>
  )
}
