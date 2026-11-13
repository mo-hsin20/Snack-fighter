import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <Container className="text-center my-5">
      <h1 className="arcade-title display-title">GAME OVER</h1>
      <p>This page doesn’t exist.</p>
      <Link to="/" className="btn btn-warning">Back to the arena</Link>
    </Container>
  )
}
