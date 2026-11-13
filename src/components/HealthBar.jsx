// Fighting-game health bar with a "ghost" bar: when HP drops, the
// coloured bar shrinks at once and a lighter bar behind it follows a
// moment later, so you can see how big the hit was.
// side="right" mirrors the bar so it empties towards the centre.
export default function HealthBar({ name, hp, maxHp, side, rage }) {
  const percent = Math.max(0, (hp / maxHp) * 100)
  const level = percent > 50 ? 'high' : percent > 25 ? 'mid' : 'low'

  return (
    <div className={`hp hp-${side}`}>
      <div className="hp-top">
        <span className="hp-name">{name}</span>
        {rage && <span className="rage-tag">RAGE</span>}
      </div>
      <div
        className="hp-track"
        role="progressbar"
        aria-label={`${name} health`}
        aria-valuemin={0}
        aria-valuemax={maxHp}
        aria-valuenow={hp}
      >
        <div className="hp-ghost" style={{ width: `${percent}%` }} />
        <div className={`hp-fill hp-${level}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="hp-number">{hp} / {maxHp}</div>
    </div>
  )
}
