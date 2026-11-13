// Shows the chosen fighter for one corner ("P1" or "P2"),
// or an empty placeholder if nothing is chosen yet.
export default function FighterSlot({ player, snack, color, onClear }) {
  return (
    <div className={`fighter-slot fighter-${color}`}>
      <div className="arcade-label">{player}</div>
      {snack ? (
        <>
          {snack.thumb
            ? <img src={snack.thumb} alt="" className="fighter-slot-img" />
            : <div className="fighter-slot-img placeholder-emoji" aria-hidden="true">🍪</div>}
          <div className="fighter-slot-name">{snack.name}</div>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={onClear}>
            Remove
          </button>
        </>
      ) : (
        <div className="fighter-slot-empty">Choose a snack</div>
      )}
    </div>
  )
}
