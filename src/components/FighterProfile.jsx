import { Card, Badge } from 'react-bootstrap'
import GradeBadge from './GradeBadge.jsx'

// "Character select" style card: the snack's picture, scores and the
// game stats the battle engine gives it.
export default function FighterProfile({ fighter, color }) {
  const { snack } = fighter
  const traits = [
    fighter.greenShield && { icon: '🛡️', name: 'Green Shield', text: 'Good Eco-Score – blocks the first hit.' },
    fighter.poisoned && { icon: '☠️', name: 'Poisoned', text: `${snack.additives} additives – loses HP every turn.` },
    fighter.ultraProcessed && { icon: '🏭', name: 'Ultra-processed', text: 'NOVA group 4 – takes extra damage.' },
  ].filter(Boolean)

  return (
    <Card className={`profile-card profile-${color} h-100`}>
      <Card.Body>
        <div className="d-flex gap-3 align-items-center mb-3">
          <div className="profile-img">
            {snack.image ? <img src={snack.image} alt={snack.name} /> : <span aria-hidden="true">🍪</span>}
          </div>
          <div className="min-w-0">
            <h2 className="h4 mb-1">{snack.name}</h2>
            {snack.brand && <div className="text-body-secondary">{snack.brand}</div>}
            <div className="small text-body-secondary">Barcode {snack.barcode}</div>
          </div>
        </div>

        <dl className="profile-scores">
          <div><dt>Nutri-Score</dt><dd><GradeBadge label="Nutri-Score" grade={snack.nutriScore} /></dd></div>
          <div><dt>Eco-Score</dt><dd><GradeBadge label="Eco-Score" grade={snack.ecoScore} /></dd></div>
          <div><dt>Processing</dt><dd><span className="nova-badge">{snack.nova ? `NOVA ${snack.nova}` : '?'}</span></dd></div>
        </dl>

        <div className="stat-row">
          <div className="stat-box"><span className="stat-value">{fighter.maxHp}</span><span className="stat-label">HP</span></div>
          <div className="stat-box"><span className="stat-value">{Math.round(fighter.defense * 100)}%</span><span className="stat-label">Defense</span></div>
          <div className="stat-box"><span className="stat-value">{fighter.moves.length}</span><span className="stat-label">Moves</span></div>
        </div>

        <h3 className="arcade-label mt-3 mb-2">TRAITS</h3>
        {traits.length === 0 ? (
          <p className="small text-body-secondary mb-0">No special traits.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {traits.map((t) => (
              <li key={t.name} className="small mb-1">
                <span aria-hidden="true">{t.icon}</span> <Badge bg="secondary">{t.name}</Badge> {t.text}
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  )
}
