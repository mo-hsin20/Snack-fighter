import { useEffect } from 'react'

// Move buttons for player-controlled fights. Keys 1–6 also work.
// Red outline = the move also hurts you (sugar, salt, fat).
export default function MovePicker({ fighter, enabled, waiting, onPick }) {
  const moves = fighter.moves

  useEffect(() => {
    if (!enabled) return
    function onKey(e) {
      const index = Number(e.key) - 1
      if (moves[index]) onPick(moves[index])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, moves, onPick])

  return (
    <section className={`move-picker ${enabled ? 'is-active' : ''}`} aria-label="Your moves">
      <div className="arcade-label text-center mb-2" aria-live="polite">
        {enabled ? 'YOUR TURN – CHOOSE A MOVE' : waiting ? 'OPPONENT IS ATTACKING…' : '…'}
      </div>
      <div className="move-grid">
        {moves.map((m, i) => (
          <button
            key={m.name}
            type="button"
            className={`move-btn ${m.selfCost >= 1 ? 'costly' : ''}`}
            disabled={!enabled}
            onClick={() => onPick(m)}
          >
            <span className="move-key" aria-hidden="true">{i + 1}</span>
            <span className="move-name"><span aria-hidden="true">{m.emoji}</span> {m.name}</span>
            <span className="move-meta">
              Power {Math.round(m.power)}
              {m.selfCost >= 1 && <> · costs you {Math.round(m.selfCost)} HP</>}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
