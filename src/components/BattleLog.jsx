// The turn-by-turn commentary under the arena. Each line also shows the
// real nutrition fact behind the attack, so the game teaches something.
// aria-live makes screen readers announce new lines as they appear.
export default function BattleLog({ events, fighters }) {
  const newestFirst = [...events].reverse().slice(0, 8)

  return (
    <section className="battle-log" aria-label="Battle log">
      <h2 className="arcade-label mb-3">BATTLE LOG</h2>
      {newestFirst.length === 0 && <p className="text-body-secondary mb-0">Waiting for the first hit…</p>}
      <ol className="list-unstyled mb-0" aria-live="polite">
        {newestFirst.map((e) => {
          const attacker = fighters[e.attacker].snack.name
          const defender = fighters[e.defender].snack.name
          return (
            <li key={e.turn} className={`log-line log-${e.attacker}`}>
              <div>
                <strong>{attacker}</strong> used <strong>{e.move.emoji} {e.move.name}</strong>
                {e.rage && <span className="text-danger"> in RAGE</span>}
                {e.blocked
                  ? <> – {defender}’s 🛡️ Green Shield blocked it!</>
                  : <> – {e.crit && <span className="text-warning">critical! </span>}{e.damage} damage.</>}
                {e.selfDamage > 0 && <> It hurt itself for {e.selfDamage}.</>}
                {e.poison > 0 && <> ☠️ Additives cost it {e.poison} HP.</>}
              </div>
              {e.move.type !== 'basic' && <div className="log-fact">💡 {e.move.fact}</div>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
