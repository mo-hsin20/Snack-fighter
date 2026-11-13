// Small icons under a fighter showing its special traits.
// The "title" text explains each icon on hover.
export default function StatusIcons({ fighter, shieldUsed }) {
  return (
    <div className="status-icons">
      {fighter.greenShield && (
        <span title="Green Shield: good Eco-Score blocks the first hit" className={shieldUsed ? 'used' : ''}>
          🛡️<span className="visually-hidden">Green Shield</span>
        </span>
      )}
      {fighter.poisoned && (
        <span title="Poisoned: many additives – loses health every turn">
          ☠️<span className="visually-hidden">Poisoned</span>
        </span>
      )}
      {fighter.ultraProcessed && (
        <span title="Ultra-processed (NOVA 4): takes extra damage">
          🏭<span className="visually-hidden">Ultra-processed</span>
        </span>
      )}
    </div>
  )
}
