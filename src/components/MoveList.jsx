import { ProgressBar } from 'react-bootstrap'

const MAX_POWER = 45 // roughly the strongest possible move, used to scale the bars

// The fighter's move list, like a fighting game's "command list".
export default function MoveList({ fighter }) {
  const moves = [...fighter.moves].sort((a, b) => b.power - a.power)

  return (
    <ul className="list-unstyled mb-0 move-list">
      {moves.map((m) => (
        <li key={m.name} className="mb-3">
          <div className="d-flex justify-content-between">
            <strong><span aria-hidden="true">{m.emoji}</span> {m.name}</strong>
            <span className="small">
              Power {Math.round(m.power)}
              {m.selfCost >= 1 && <span className="text-danger"> · self-damage {Math.round(m.selfCost)}</span>}
            </span>
          </div>
          <ProgressBar
            now={Math.min(100, (m.power / MAX_POWER) * 100)}
            variant={m.selfCost >= 1 ? 'danger' : 'success'}
            aria-label={`${m.name} power`}
            className="my-1"
          />
          {m.type !== 'basic' && <div className="small text-body-secondary">{m.fact}</div>}
        </li>
      ))}
    </ul>
  )
}
