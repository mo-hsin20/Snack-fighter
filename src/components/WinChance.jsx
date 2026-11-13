import { useMemo } from 'react'
import { simulateBattle } from '../game/battleEngine.js'

const SIMULATIONS = 500

// Predicts the winner by running the battle engine 500 times and
// counting the wins. Because the engine is plain JavaScript (no React,
// no animations), it can play hundreds of fights in a few milliseconds.
export default function WinChance({ left, right }) {
  const leftPercent = useMemo(() => {
    let wins = 0
    for (let i = 0; i < SIMULATIONS; i++) {
      if (simulateBattle(left, right).winner === 'left') wins++
    }
    return Math.round((wins / SIMULATIONS) * 100)
  }, [left, right])

  return (
    <section className="win-chance" aria-label="Predicted win chance">
      <div className="arcade-label text-center mb-2">WIN CHANCE ({SIMULATIONS} SIMULATED FIGHTS)</div>
      <div className="win-bar">
        <div className="win-left" style={{ width: `${leftPercent}%` }}>{leftPercent >= 12 && `${leftPercent}%`}</div>
        <div className="win-right" style={{ width: `${100 - leftPercent}%` }}>{100 - leftPercent >= 12 && `${100 - leftPercent}%`}</div>
      </div>
      <div className="d-flex justify-content-between small mt-1">
        <span>{left.name}</span>
        <span>{right.name}</span>
      </div>
    </section>
  )
}
