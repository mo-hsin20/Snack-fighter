import { Card, Placeholder } from 'react-bootstrap'

// Grey "shimmer" card shown while results are loading. It has the same
// shape as SnackCard, so the page doesn't jump when real data arrives.
export default function SkeletonCard() {
  return (
    <Card className="snack-card h-100" aria-hidden="true">
      <div className="snack-img-wrap skeleton-img" />
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow"><Placeholder xs={9} /></Placeholder>
        <Placeholder as={Card.Text} animation="glow"><Placeholder xs={5} /></Placeholder>
        <Placeholder.Button variant="secondary" xs={12} animation="glow" />
      </Card.Body>
    </Card>
  )
}
