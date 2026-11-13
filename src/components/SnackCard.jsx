import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import GradeBadge from './GradeBadge.jsx'

// One snack in the search results.
// onSelect is a function passed in from the parent – the card itself
// doesn't know about "left" or "right" corners, which keeps it reusable.
export default function SnackCard({ snack, onSelect, selectedSide }) {
  return (
    <Card className={`snack-card h-100 ${selectedSide ? 'is-selected' : ''}`}>
      <div className="snack-img-wrap">
        {snack.thumb ? (
          <Card.Img variant="top" src={snack.thumb} alt={snack.name} loading="lazy" />
        ) : (
          <div className="snack-img-placeholder" aria-hidden="true">🍪</div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="fs-6 mb-1">{snack.name}</Card.Title>
        {snack.brand && <Card.Subtitle className="text-body-secondary small mb-2">{snack.brand}</Card.Subtitle>}
        <div className="mb-3">
          <GradeBadge label="Nutri-Score" grade={snack.nutriScore} />
        </div>
        <div className="mt-auto d-grid gap-2">
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-danger" className="flex-fill"
              onClick={() => onSelect('left', snack)} active={selectedSide === 'left'}>
              P1
            </Button>
            <Button size="sm" variant="outline-primary" className="flex-fill"
              onClick={() => onSelect('right', snack)} active={selectedSide === 'right'}>
              P2
            </Button>
          </div>
          <Link to={`/product/${snack.barcode}`} className="small text-center">View stats</Link>
        </div>
      </Card.Body>
    </Card>
  )
}
